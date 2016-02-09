from __future__ import unicode_literals
import frappe
from frappe.utils import flt, cstr, cint, time_diff_in_hours, now, time_diff, add_days, formatdate
from frappe import _
import json
import math
import re


@frappe.whitelist()
def get_global_search_suggestions(filters):
	query = """  select  name from `tabTraining` where training_status = 'Published'
						and name like '%{0}%' 
						union select name from `tabSkill Matrix 18` where name like '%{0}%'
						union select name from `tabSkill Matrix 120` where name like '%{0}%'	
						union select name from `tabDocument Type` where name like '%{0}%'
		""".format(filters)
	suggestions = frappe.db.sql(query, as_list=1)
	suggestions = [suggestion[0] for suggestion in suggestions]
	return suggestions



@frappe.whitelist()
def get_published_trainings(search_filters):
	search_filters = json.loads(search_filters)
	limit_query = "LIMIT 5 OFFSET {0}".format(search_filters.get("page_no") * 5 )
	downld_query, avg_rat_query = get_ratings_and_downloads_query()
	my_query = """ select * , ({1}) as download_count , ({2}) as avg_ratings from `tabTraining` tr
						where tr.training_status = 'Published' and
						( tr.skill_matrix_18 like '%{0}%' or tr.name like '%{0}%' 
						or tr.skill_matrix_120 like '%{0}%' or tr.document_type like '%{0}%' 
						or tr.industry like '%{0}%' or tr.description like '%{0}%' )  order by tr.creation desc """.format(search_filters.get("filters"), downld_query, avg_rat_query)
	
	total_records = get_total_records(my_query)
	response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
	assessment_status = get_request_download_status(response_data)
	total_pages = math.ceil(total_records[0].get("count",0)/5.0)
	return {"response_data":response_data, "total_pages":total_pages, "test_status":assessment_status}

def get_total_records(query):
	return frappe.db.sql(query.replace("*", "count(*) as count", 1), as_dict=1)


def get_request_download_status(response_data):
	for response in response_data:		
		response["comments"] = frappe.db.sql(""" select tr.user_id, tr.comments, tr.ratings, concat(usr.first_name , ' ' ,usr.last_name) as full_name  
												from `tabTraining Review` tr  left join `tabUser` usr 
												on usr.name = tr.user_id   
												where  tr.training_name = %s""",(response.get("training_name")),as_dict=1)	 
		ans_sheet = frappe.db.sql(""" select answer_sheet_status from
													`tabAnswer Sheet` 
													where student_name = %s and training_name = %s 
													order by creation desc limit 1  """,(frappe.session.user, response.get("training_name") ), as_dict=1) 
		response["ans_status"] = ans_sheet[0].get("answer_sheet_status") if ans_sheet else ""

	result  = frappe.db.get_value("Answer Sheet", {"student_name":frappe.session.user, "answer_sheet_status":["in", ["New", "Pending"] ]}, 'name')
	return result if result else ""


def get_ratings_and_downloads_query():
	download_query = " select count(name) from `tabTraining Download Log` tdl where tdl.training_name = tr.name "
	avg_rat_query = " select ifnull(avg(ratings), 0.0) from `tabTraining Review` rvw where rvw.training_name = tr.name "
	return download_query , avg_rat_query


@frappe.whitelist()
def create_training_review(request_data):
	request_data = json.loads(request_data)
	if not frappe.db.get_value("Training Review", {"user_id":frappe.session.user, "training_name":request_data.get("training_name")}, "name"):
		tr = frappe.new_doc("Training Review")
		tr.user_id = frappe.session.user
		tr.ratings = flt(request_data.get("ratings"))
		tr.comments = request_data.get("comments")
		tr.training_name = request_data.get("training_name")
		tr.save(ignore_permissions=True)
	else:
		tr = frappe.get_doc("Training Review", {"user_id":frappe.session.user, "training_name":request_data.get("training_name")})
		tr.comments = request_data.get("comments")
		tr.ratings = flt(request_data.get("ratings"))
		tr.save(ignore_permissions=True)

@frappe.whitelist()
def make_training_subscription_form(request_data):
	request_data = json.loads(request_data)
	training_data = frappe.db.get_value("Training",{"name":request_data.get("tr_name")}, "*", as_dict=True)
	tsa = frappe.new_doc("Training Subscription Approval")
	tsa.request_type = "Unforced Training"
	tsa.training_requester = frappe.session.user
	tsa.update(get_subscription_form_dict(training_data))
	tsa.save(ignore_permissions=True)
	tsa.submit()
	# send_mail_of_training_request(training_data.get("name"))


@frappe.whitelist()
def assign_forced_training(request_data):
	request_data = json.loads(request_data)
	for row in request_data:
		training_data = frappe.db.get_value("Training",{"name":row.get("training_name")}, "*", as_dict=True)
		tsa = frappe.new_doc("Training Subscription Approval")
		tsa.request_type = "Forced Training"
		tsa.training_requester = frappe.db.get_value("Employee", {"name":row.get("employee")}, "user_id")
		tsa.update(get_subscription_form_dict(training_data))
		tsa.save(ignore_permissions=True)
		tsa.submit()



def send_mail_of_training_request(training_name):
	template = "/templates/training_templates/training_request.html"
	cd = get_central_delivery()
	first_name, last_name = frappe.db.get_value("User", {"name":frappe.session.user}, ["first_name", "last_name"])
	user_name = ' '.join([first_name, last_name]) if last_name else first_name
	args = {"user_name":first_name , "training_name":training_name}
	frappe.sendmail(recipients= cd, sender=None, subject="Training Document Notification", 
						message=frappe.get_template(template).render(args))

def get_subscription_form_dict(training_data):
	return {
			"training_name":training_data.get("name"),
			"document_type":training_data.get("document_type"),
			"industry":training_data.get("industry"),
			"skill_matrix_120":training_data.get("skill_matrix_120"),
			"skill_matrix_18":training_data.get("skill_matrix_18"),
			"assessment":training_data.get("assessment"),
			"request_status":"Open",
			"central_delivery_status":"Accepted",
			"central_delivery":"Administrator"
		}

def get_central_delivery():
	central_delivery = frappe.get_list("UserRole", filters={"role":"Central Delivery","parent":["!=", "Administrator"]}, fields=["parent"])
	central_delivery = [user.get("parent") for user in central_delivery]
	return central_delivery

@frappe.whitelist()
def validate_if_current_user_is_author():
	if "Central Delivery" in frappe.get_roles():
		return "success"
	else:
		return frappe.db.get_value("Training", {"owner":frappe.session.user, "training_status":"Published"}, "name")

@frappe.whitelist()
def get_training_list(doctype, txt, searchfield, start, page_len, filters):
	cond = ''
	if "Central Delivery" in frappe.get_roles():
		return frappe.db.sql(get_training_query(cond, txt))
	else:
		cond = "and owner = '{0}'".format(frappe.session.user)
		return frappe.db.sql(get_training_query(cond, txt), as_list=1)


def get_training_query(cond, txt):
	return """  select name from 
				`tabTraining`
				where training_status = 'Published'
				and name like '{txt}'
				{cond}  limit 20 """.format(cond = cond, txt = "%%%s%%" % txt )


@frappe.whitelist()
def get_employee_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(get_emp_query(filters.get("training_name"),txt),as_list=1)


def get_emp_query(training_name, txt):
	return """  select name, employee_name from 
				`tabEmployee` emp
				where NOT EXISTS ({cond})
				and user_id not in ('Administrator', '{usr}')
				and (name like '{txt}' or employee_name like '{txt}')
				limit 20 """.format(cond = get_sub_query(training_name), txt = "%%%s%%" % txt, usr= frappe.session.user )


def get_sub_query(training_name):
	return """  select * 
				from `tabAnswer Sheet` ans   
				where ans.answer_sheet_status in ("New", "Open", "Pending")
				and ans.student_name = emp.user_id
				and ans.training_name = '{0}'
				order by ans.creation desc limit 1  """.format(training_name) 




# def get_sub_query(training_name):
# 	return """ select ( select tsa.training_requester from `tabTraining Subscription Approval` tsa  
# 					where tsa.request_status in ("Open", "Accepted") and tsa.training_name = '{0}'
# 					and tsa.training_requester= emp.user_id order by creation desc limit 1) as emp_user_id from 
# 		`tabEmployee` emp """.format(training_name)

def get_filtered_employee(cond, txt):
	cond = cond if cond else "''"
	return """  select name, employee_name from 
				`tabEmployee`
				where user_id not in ({cond})
				and user_id not in ('Administrator', '{usr}')
				and (name like '{txt}' or employee_name like '{txt}')
				limit 20 """.format(cond = cond, txt = "%%%s%%" % txt, usr= frappe.session.user )

@frappe.whitelist()
def create_training_download_log(training_name, ans_sheet):
	tdl = frappe.new_doc("Training Download Log")
	tdl.user_id = frappe.session.user
	tdl.training_name = training_name
	tdl.downloaded_datetime = now()
	tdl.answer_sheet_link = ans_sheet
	tdl.save(ignore_permissions=True)



@frappe.whitelist()
def get_my_trainings():
	response_data = frappe.db.sql("""  select tr.training_name, tr.training_path, 
						ans.answer_sheet_status, ans.name as ans_sheet, ans.creation,
						ans.percentage_score from
					`tabAnswer Sheet` ans join `tabTraining` tr
					on ans.training_name = tr.name
					where student_name = %s  order by ans.creation desc""",(frappe.session.user), as_dict=1)
	get_meta_data_of_response(response_data)
	return response_data

@frappe.whitelist()
def get_meta_data_of_response(response_data):
	mapper = {"New":"Not Completed", "Pending":"Partial Completed", "Open":"Test Completed", "Closed":"Result Declared"}
	for response in response_data:
		response["download_flag"] = frappe.db.get_value("Training Download Log", {"training_name":response.get("training_name"), 
															"user_id":frappe.session.user, "answer_sheet_link":response.get("ans_sheet")}, "name")
		response["assessment_status"] = mapper.get(response.get("answer_sheet_status")) if response.get("answer_sheet_status") else ""
		response["tooltip_title"] = "{0} test Completed".format(response.get("training_name")) if response.get("answer_sheet_status") in ["Open", "Closed"] else " Test allowed after training download !!!!"
		response["sub_date"] = formatdate(response.get("creation"))


@frappe.whitelist()
def check_answer_sheet_status(ans_sheet):
	return frappe.db.get_value("Answer Sheet", {"name":ans_sheet}, 'answer_sheet_status')
