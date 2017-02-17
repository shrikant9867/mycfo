from __future__ import unicode_literals
import frappe
from frappe.utils import flt, cstr, cint, time_diff_in_hours, now, time_diff, add_days
from frappe import _
import json
import math
import re
from mycfo.mycfo_utils import get_central_delivery



@frappe.whitelist()
def get_global_search_suggestions(filters):
	query = """  select  file_name from `tabIP File` where ( published_flag = 1 or file_status = 'Archived' )
						and file_name like '%{0}%' 
						union select name from `tabSkill Matrix 18` where name like '%{0}%'
						union select name from `tabSkill Matrix 120` where name like '%{0}%'
						union select name from `tabDocument Type` where name like '%{0}%'
						union select name from `tabCustomer` where name like '%{0}%'
						union select name from `tabIndustry` where name like '%{0}%'
						union select name from `tabIP Tags` where name like '%{0}%'
		""".format(filters)
	suggestions = frappe.db.sql(query, as_list=1)
	security_levels = [ [level] for level in ["0-Level", "1-Level", "2-Level"] if re.search(filters, level, re.IGNORECASE)]	
	suggestions.extend(security_levels)
	suggestions = [suggestion[0] for suggestion in suggestions]
	return suggestions




@frappe.whitelist()
def get_published_ip_file(search_filters):
	search_filters = json.loads(search_filters)
	limit_query = "LIMIT 5 OFFSET {0}".format(search_filters.get("page_no") * 5 )

	if search_filters['filters'] :
		ip_file_filters = ','.join('"{0}"'.format(w) for w in search_filters['filters'] )
		my_query = """ select
						*
					from 
					(   select 	ipf.new_file_path, ipf.skill_matrix_120, ipf.file_name, ipf.file_extension, ipf.creation,
								ipf.modified, ipf.file_status, ipf.owner, ipf.document_type, ipf.modified_by, ipf.published_flag, ipf.source,
								ipf.security_level, ipf.docstatus, ipf.file_path, ipf.file_approver, ipf.description, ipf.skill_matrix_18,
								ipf.validity_end_date, ipf.request_type, ipf.user, ipf.employee_name, ipf.file_viewer_path,
								ipf.customer, ipf.name, ipf.industry, ipf.uploaded_date, ipf.approver_link
						from `tabIP File` ipf 
						left join `tabIP File Tags` ipt
						on ipt.parent = ipf.name
							where ( ipf.published_flag = 1 or ipf.file_status = 'Archived' )
							and ( ipf.skill_matrix_18 in ({0}) or ipf.file_name in ({0}) 
							or ipf.security_level in ({0}) or ipf.customer in ({0}) 
							or ipf.industry in ({0}) or ipf.skill_matrix_120 in ({0}) 
							or ipf.document_type in ({0}) or ipt.ip_tags in ({0}) )  
					) as new_tbl
					group by new_tbl.name order by new_tbl.uploaded_date desc
					""".format(ip_file_filters)
	else :
		my_query = ip_file_search_without_filters()

	total_records = get_total_records(my_query)
	response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
	get_request_download_status(response_data)
	total_pages = math.ceil(len(total_records)/5.0)
	
	return response_data, total_pages 


def get_total_records(my_query):
	return frappe.db.sql(my_query.replace("*", "count(*) as count", 1), as_dict=1)


def ip_file_search_without_filters():
	return  """ select new_file_path, skill_matrix_120, file_name, file_extension, creation,
					modified, file_status, owner, document_type, modified_by, published_flag, source,
					security_level, docstatus, file_path, file_approver, description, skill_matrix_18,
					validity_end_date, request_type, user, employee_name, file_viewer_path,
					customer, name, industry, uploaded_date, approver_link from `tabIP File` 
					order by uploaded_date desc """
	 

def get_sub_query_of_request_status(file_name):
	return """ select  ipd.approval_status, ipd.validity_end_date , ipd.name
						from `tabIP Download Approval` ipd
						where ipd.file_name = '{0}'
						and ipd.ip_file_requester = '{1}'
						and ipd.approval_status != 'Expired'
						order by ipd.creation desc limit 1	""".format(frappe.db.escape(file_name), frappe.session.user)



def get_request_download_status(response_data):
	for response in response_data:
		sub_query = get_sub_query_of_request_status(response.get("file_name"))
		result = frappe.db.sql(sub_query, as_dict=1)
		response["download_validity_end_date"] = result[0].get("validity_end_date") if result else ""
		response["approval_status"] = result[0].get("approval_status") if result else ""
		response["download_form"] = result[0].get("name") if result else ""
		get_comments_reviews(response)
	


@frappe.whitelist()
def get_latest_uploaded_documents(search_filters):
	search_filters = json.loads(search_filters)
	limit_query = "LIMIT 5 OFFSET {0}".format(search_filters.get("page_no") * 5 )
	my_query = get_latest_query()
	total_records = get_total_records(my_query)
	response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
	get_request_download_status(response_data)
	total_pages = math.ceil(total_records[0].get("count",0)/5.0)
	return response_data, total_pages 


def get_latest_query():
	return """ select * from `tabIP File` ipf 
						where ipf.published_flag = 1 
						and DATEDIFF(CURDATE(), ipf.uploaded_date) < 15 order by uploaded_date desc """

@frappe.whitelist()
def get_latest_upload_count():
	counts = {}
	latest_query = get_latest_query()
	counts["latest_records"] = get_total_records(latest_query)[0]["count"]
	pending_requests_query = get_pending_request_query()
	counts["pending_requests"] = len(frappe.db.sql(pending_requests_query, as_dict=1))
	downloads_query = get_downloads_query()
	counts["total_downloads"] = len(frappe.db.sql(downloads_query, as_dict=1))
	return counts

	


def get_search_conditions(search_filters):
	search_mapper = {"project_id":"ipf.project", "skill_matrix_18":"ipf.skill_matrix_18", "skill_matrix_120":"ipf.skill_matrix_120", 
						"security_level":"ipf.security_level", "file_name":"ipf.name"}
	cond = "and "
	for key,value in search_mapper.items():
		cond += "{0} like '%{1}%' or".format(value, search_filters.get("filters"))
	return cond		


@frappe.whitelist()
def create_ip_file_feedback(request_data):
	request_data = json.loads(request_data)
	if not frappe.db.get_value("IP Review", {"user_id":frappe.session.user, "file_name":request_data.get("file_name")}, "name"):
		ipr = frappe.new_doc("IP Review")
		ipr.user_id = frappe.session.user
		ipr.ratings = flt(request_data.get("ratings"))
		ipr.comments = request_data.get("comments")
		ipr.file_name = request_data.get("file_name")
		ipr.save(ignore_permissions=True)
	else:
		ipr = frappe.get_doc("IP Review", {"user_id":frappe.session.user, "file_name":request_data.get("file_name")})
		ipr.comments = request_data.get("comments")
		ipr.ratings = flt(request_data.get("ratings"))
		ipr.save(ignore_permissions=True)


@frappe.whitelist()
def create_ip_download_request(ip_file_name, customer, approver):
	file_data = frappe.db.get_value("IP File", {"name":ip_file_name}, '*', as_dict=True)
	check_for_existing_download_approval_form(file_data)
	if not frappe.db.get_value("IP Download Approval", {"file_name":file_data.get("file_name"), 
								"ip_file_requester":frappe.session.user, "approval_status":"Pending"}, "name"):
		ipa = frappe.new_doc("IP Download Approval")
		ipa.file_name = file_data.get("file_name")
		ipa.file_description = file_data.get("file_description")
		ipa.file_type = file_data.get("file_type")
		ipa.customer = customer
		ipa.industry = file_data.get("industry")
		ipa.department = file_data.get("department")
		ipa.skill_matrix_18 = file_data.get("skill_matrix_18")
		ipa.skill_matrix_120 = file_data.get("skill_matrix_120")
		ipa.file_path = file_data.get("file_path")
		ipa.approver = approver or ""
		ipa.employee_name = frappe.db.get_value("Employee", {"name":approver}, 'employee_name') if approver else ""
		ipa.ip_file_requester = frappe.session.user
		ipa.level_of_approval = file_data.get("security_level")
		ipa.approval_status = "Pending" 
		ipa.save(ignore_permissions=True)
		prepare_for_todo_creation(file_data, approver,customer)
		return "success"


def check_for_existing_download_approval_form(file_data):
	idp_list = frappe.db.get_values("IP Download Approval", {"file_name":file_data.get("file_name"), 
				"ip_file_requester":frappe.session.user, "approval_status":"Download Allowed"}, 'name', as_dict=1)
	idp_name = ','.join('"{0}"'.format(idp.get("name")) for idp in idp_list if idp)
	if idp_name:
		query = """  update `tabIP Download Approval`  
							set validity_end_date = null , approval_status = 'Expired', 
							modified = '{0}'   
			where name in ({1}) """.format(now(), idp_name)
		frappe.db.sql(query)	



def prepare_for_todo_creation(file_data, emp_id,customer):
	users = []
	user_id = frappe.db.get_value("Employee", emp_id, 'user_id') if emp_id else ""
	users.append(user_id) if user_id else ""
	if file_data.get("security_level") ==  "2-Level" or not user_id:
		central_delivery = get_central_delivery()
		users.extend(central_delivery)
	make_todo(users, file_data,customer)	


def get_user_with_el_roles(project):
	result = frappe.db.sql(""" select distinct(emp.user_id)
								from `tabOperation And Project Details` opd
								join `tabOperation And Project Commercial` opc
								on opd.parent = opc.name
								join `tabEmployee` emp
								on  emp.name  = opd.user_name 
								where opd.role in ("EL")
								and opc.project_commercial = %(project)s
	 		""", {'project':project}, as_list=1)
	result = [record[0] for record in result if record]
	return result


def make_todo(users, file_data,customer):
	template = "/templates/ip_library_templates/download_request_notification.html"
	subject = "IP File Download Request"
	for usr in users:
		todo = frappe.new_doc("ToDo")
		todo.description = "Approve the download request of user {0} for file {1}".format(frappe.session.user, file_data.get("file_name"))
		todo.reference_type = "Customer"
		todo.reference_name = file_data.get("customer")
		todo.role = "EL"
		todo.owner = usr
		todo.status = "Open"
		todo.priority = "High"
		todo.save(ignore_permissions=True)
	args = {"user_name":frappe.session.user, "file_name":file_data.get("file_name"),"customer":file_data.get("customer")}
	frappe.sendmail(recipients=users, sender=None, subject=subject,
		message=frappe.get_template(template).render(args))	

@frappe.whitelist()
def create_ip_download_log(file_name, download_form, validity):
	start_download_validity_count_down(download_form, validity)
	idl = frappe.new_doc("IP Download Log")
	idl.user_id = frappe.session.user
	idl.full_name = get_full_name_of_user()
	idl.file_name = file_name
	idl.downloaded_datetime = now()
	idl.save(ignore_permissions=True)

def get_full_name_of_user():
	first_name, last_name = frappe.db.get_value("User", {"name":frappe.session.user}, ["first_name", "last_name"])
	return   first_name + " " + last_name  if last_name else first_name	


@frappe.whitelist()
def get_my_download(search_filters):
	search_filters = json.loads(search_filters)
	download_query = get_downloads_query()
	response_data, total_pages = prepare_response_data(search_filters, download_query)
	return response_data, total_pages 	

def get_downloads_query():
	return """ select ipf.*, ipd.name as download_form, ipd.file_name, ipd.approval_status, ipd.validity_end_date as download_validity from `tabIP Download Approval` ipd
					join `tabIP File` ipf 
					on ipf.name = ipd.file_name
					where ipd.approval_status="Download Allowed" and ipd.ip_file_requester='{0}' 
					order by ipd.creation desc """.format(frappe.session.user)



def get_request_status(response_data):
	for response in response_data:
		response["download_validity_end_date"] = response.get("download_validity", "")
		response["approval_status"] = response.get("approval_status", "")
		response["download_form"] = response.get("download_form", "")
		get_comments_reviews(response)


@frappe.whitelist()
def get_my_pending_requests(search_filters):
	search_filters = json.loads(search_filters)
	pending_query = get_pending_request_query()
	response_data, total_pages = prepare_response_data(search_filters, pending_query)
	return response_data, total_pages


def prepare_response_data(search_filters, query):
	response_data, total_pages = [], 0
	limit_query = "LIMIT 5 OFFSET {0}".format(search_filters.get("page_no") * 5 )
	total_records = len(frappe.db.sql(query, as_dict=1))
	response_data = frappe.db.sql(query + limit_query, as_dict=True)
	get_request_status(response_data)
	total_pages = math.ceil(total_records/5.0)
	return response_data, total_pages 	


def get_pending_request_query():
	return """ select ipf.*, ipd.name as download_form, ipd.file_name, ipd.approval_status, ipd.validity_end_date as download_validity from `tabIP Download Approval` ipd
							join `tabIP File` ipf 
							on ipf.name = ipd.file_name
							where ipd.approval_status in ("Pending", "Approved by Approver", "Rejected by Approver") and ipd.ip_file_requester='{0}'
							order by ipd.creation desc """.format(frappe.session.user)



@frappe.whitelist()
def get_customers_of_user(doctype, txt, searchfield, start, page_len, filters):
	query = """ select distinct(opc.project_commercial) from 
						`tabOperation And Project Commercial` opc left join
						`tabOperation And Project Details` opd 
						on opc.name = opd.parent
						where opd.email_id = '{0}'
						and opc.customer like '%{1}%' limit 20""".format(frappe.session.user, txt)
	return frappe.db.sql(query, as_list=1)



def start_download_validity_count_down(ip_download_approver, validity_end_date):
	if not validity_end_date and ip_download_approver:
		validity_end_time = add_days(now(), 2)
		frappe.db.sql("update `tabIP Download Approval` set validity_end_date=%s where name = %s",
						(validity_end_time, ip_download_approver))



def get_comments_reviews(response):
	response["download_count"] = frappe.get_list("IP Download Log", fields=["count(*)"], filters={ "file_name":response.get("file_name") }, as_list=True)[0][0] 
	response["avg_ratings"] = frappe.get_list("IP Review", fields=["ifnull(avg(ratings),0.0)"], filters={ "file_name":response.get("file_name") }, as_list=True)[0][0]
	response["comments"] = frappe.db.sql(""" select ipr.user_id, ipr.comments, ipr.ratings, concat(usr.first_name , ' ',usr.last_name) as full_name  
												from `tabIP Review` ipr  left join `tabUser` usr 
												on usr.name = ipr.user_id   
												where  file_name = %s""",(response.get("file_name")),as_dict=1)	 
	response["download_flag"] = frappe.db.get_value("IP Download Log", {"file_name":response.get("file_name"), "user_id":frappe.session.user}, "name")
	response["panel_class"] = "panel panel-primary ip-file-panel" if response.get("published_flag") else "panel panel-archive ip-file-panel"
	get_feed_back_questionnaire_form(response)


def get_feed_back_questionnaire_form(response):
	cond_dict = {"user":frappe.session.user, "ip_file":response.get("file_name")}
	if "Central Delivery" not in frappe.get_roles():
		feedback = """ select  ipd.name
						from `tabIP Download Approval` ipd
						where ipd.file_name = '{0}'
						and ipd.ip_file_requester = '{1}'
						and ipd.approval_status in ('Download Allowed', 'Expired')
						order by ipd.creation desc limit 1	""".format(frappe.db.escape(response.get("file_name")), frappe.session.user)
		fdbk_response = frappe.db.sql(feedback, as_dict=1)
		if fdbk_response:
			response["download_feedback_form"] = fdbk_response[0].get("name", "")
			cond_dict.update({"ip_download_request":fdbk_response[0].get("name", "")}) 
	response["feedback_form"] = frappe.db.get_value("IP File Feedback", cond_dict, "name")


def get_customer_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(""" select name from `tabCustomer` 
								where name like %(txt)s limit 10 """, {"txt":"%%%s%%" % txt }, as_list=1)

@frappe.whitelist()
def validate_user_is_el(customer):
	employee = frappe.db.get_value("Employee", {"user_id":frappe.session.user}, "name")
	response = frappe.db.sql(""" select  distinct(opd.user_name), emp.employee_name
								from `tabOperation And Project Details` opd
								join `tabOperation And Project Commercial` opc
								on opd.parent = opc.name
								join `tabEmployee` emp
								on  emp.name  = opd.user_name 
								where opd.role in ("EL")
								and opd.user_name = '%s'  
								and opc.operational_matrix_status = "Active"
								and opc.customer = '%s' """%(employee, customer), as_list=1)

	return {"is_el":1} if len(response) else {"is_el":0}


@frappe.whitelist()
def get_feedback_questionnaire():
	qtns = frappe.get_all("IP Questionnaire", filters={"parent":"IP File Questionnaire", "status":1}, fields=["*"])
	return qtns

@frappe.whitelist()
def create_feedback_questionnaire_form(answer_dict, download_request, ip_file):
	answer_dict = json.loads(answer_dict)
	fdbk = frappe.get_doc({
		"doctype": "IP File Feedback",
		"user":frappe.session.user,
		"user_answers":answer_dict,
		"ip_file":ip_file,
		"ip_download_request":download_request or ""
	})
	fdbk.flags.ignore_permissions = True
	fdbk.insert()
	return "success"