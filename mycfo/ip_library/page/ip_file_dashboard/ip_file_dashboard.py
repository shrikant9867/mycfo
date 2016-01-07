from __future__ import unicode_literals
import frappe
from frappe.utils import flt, cstr, cint, time_diff_in_hours, now, time_diff
from frappe import _
import json
import math
import re



@frappe.whitelist()
def get_global_search_suggestions(filters):
	query = """  select  file_name from `tabIP File` where file_status in ('Published', 'Republished')
						and file_name like '%{0}%' 
						union select name from `tabSkill Matrix 18` where name like '%{0}%'
						union select name from `tabSkill Matrix 120` where name like '%{0}%'
						union select name  from `tabProject Commercial` where name like '%{0}%'	
						union select name from `tabDocument Type` where name like '%{0}%'
		""".format(filters)
	suggestions = frappe.db.sql(query, as_list=1)
	security_levels = [ [level] for level in ["0-Level", "1-Level", "2-Level"] if re.search(filters, level, re.IGNORECASE)]	
	suggestions.extend(security_levels)
	suggestions = [suggestion[0] for suggestion in suggestions]
	return suggestions




@frappe.whitelist()
def get_published_ip_file(search_filters):
	search_filters = json.loads(search_filters)
	limit_query = "LIMIT 2 OFFSET {0}".format(search_filters.get("page_no") * 2 )
	my_query = """ select * from `tabIP File` ipf
						where ipf.file_status in ('Published', 'Republished') 
						and ( ipf.skill_matrix_18 like '%{0}%' or ipf.file_name like '%{0}%' 
						or ipf.project like '%{0}%' or ipf.security_level like '%{0}%' 
						or ipf.skill_matrix_120 like '%{0}%' )  """.format(search_filters.get("filters"))
	
	total_records = get_total_records(my_query)
	response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
	get_request_download_status(response_data)
	total_pages = math.ceil(total_records[0].get("count",0)/2.0)
	return response_data, total_pages 


def get_total_records(my_query):
	return frappe.db.sql(my_query.replace("*", "count(*) as count", 1), as_dict=1, debug=1)



def get_sub_query_of_request_status(file_name):
	return """ select  ipd.approval_status, ipd.validity_end_date , ipd.name
						from `tabIP Download Approval` ipd
						where ipd.file_name = '{0}'
						and ipd.ip_file_requester = '{1}'
						and ipd.approval_status != 'Expired'
						order by ipd.creation desc limit 1	""".format(file_name, frappe.session.user)



def get_request_download_status(response_data):
	for response in response_data:
		sub_query = get_sub_query_of_request_status(response.get("file_name"))
		result = frappe.db.sql(sub_query, as_dict=1)
		response["download_validity_end_date"] = result[0].get("validity_end_date") if result else ""
		response["approval_status"] = result[0].get("approval_status") if result else ""
		response["download_count"] = frappe.get_list("IP Download Log", fields=["count(*)"], filters={ "file_name":response.get("file_name") }, as_list=True)[0][0] 
		response["avg_ratings"] = frappe.get_list("IP Review", fields=["ifnull(avg(ratings),0.0)"], filters={ "file_name":response.get("file_name") }, as_list=True)[0][0]
		response["comments"] = frappe.db.sql(""" select user_id, comments, ratings  from `tabIP Review` where  file_name = %s""",(response.get("file_name")),as_dict=1)	 
		response["download_flag"] = frappe.db.get_value("IP Download Log", {"file_name":response.get("file_name"), "user_id":frappe.session.user}, "name")



@frappe.whitelist()
def get_latest_uploaded_documents(search_filters):
	search_filters = json.loads(search_filters)
	limit_query = "LIMIT 2 OFFSET {0}".format(search_filters.get("page_no") * 2 )
	my_query = get_latest_query()
	total_records = get_total_records(my_query)
	response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
	get_request_download_status(response_data)
	total_pages = math.ceil(total_records[0].get("count",0)/2.0)
	return response_data, total_pages 


def get_latest_query():
	return """ select * from `tabIP File` ipf 
						where ipf.file_status in ('Published', 'Republished') 
						and DATEDIFF(CURDATE(), ipf.uploaded_date) < 15 order by uploaded_date desc """

@frappe.whitelist()
def get_latest_upload_count():
	counts = {}
	latest_query = get_latest_query()
	counts["latest_records"] = get_total_records(latest_query)[0]["count"]
	pending_requests_query = get_pending_request_query()
	counts["pending_requests"] = len(pending_requests_query)
	downloads_query = get_downloads_query()
	counts["total_downloads"] = len(downloads_query)
	return counts

# """
# 	Return request status for ip document
# 	0 status means user can make new request for Download
# 	1 status means user can download document
# 	2 status means user can not create new request for download
# 	beacuse existing request is pending.

# """
# def get_request_status(file_name):
# 	query = """ select docstatus, modified 
# 										from `tabIP Download Approval` 
# 										where file_name = '{0}'
# 										and ip_file_requester = '{1}'
# 										order by creation desc limit 1
# 										""".format(file_name, frappe.session.user)
# 	request_status = frappe.db.sql(query, as_dict=1)
# 	status = 0
# 	if request_status:
# 		if request_status[0].get("docstatus"):
# 			print [now(), request_status[0].get("modified")]
# 			time_difference = time_diff(now(), request_status[0].get("modified"))
# 			print type(time_difference)
# 			print time_difference
# 		elif request_status[0].get("docstatus") == 0:
# 			status = 2					
# 	return status	


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
def create_ip_download_request(ip_file_name):
	file_data = frappe.db.get_value("IP File", {"name":ip_file_name}, '*', as_dict=True)
	if not frappe.db.get_value("IP Download Approval", {"file_name":file_data.get("file_name"), 
								"ip_file_requester":frappe.session.user, "approval_status":"Pending"}, "name"):
		ipa = frappe.new_doc("IP Download Approval")
		ipa.file_name = file_data.get("file_name")
		ipa.file_description = file_data.get("file_description")
		ipa.file_type = file_data.get("file_type")
		ipa.project = file_data.get("project")
		ipa.industry = file_data.get("industry")
		ipa.department = file_data.get("department")
		ipa.skill_matrix_18 = file_data.get("skill_matrix_18")
		ipa.skill_matrix_120 = file_data.get("skill_matrix_120")
		ipa.file_path = file_data.get("file_path")
		ipa.approver = ""
		ipa.ip_file_requester = frappe.session.user
		ipa.level_of_approval = file_data.get("security_level")
		ipa.approval_status = "Pending" 
		ipa.save(ignore_permissions=True)
		prepare_for_todo_creation(file_data)
		return "success"


def prepare_for_todo_creation(file_data):
	users = get_user_with_el_roles(file_data.get("project"))
	if file_data.get("security_level") ==  "2-Level":
		central_delivery = frappe.get_list("UserRole", filters={"role":"Central Delivery","parent":["!=", "Administrator"]}, fields=["parent"])
		central_delivery = [user.get("parent") for user in central_delivery]
		users.extend(central_delivery)
	make_todo(users, file_data)	


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


def make_todo(users, file_data):
	template = "/templates/ip_library_templates/download_request_notification.html"
	subject = "IP Document Download Request Notification"
	for usr in users:
		todo = frappe.new_doc("ToDo")
		todo.description = "Approve the download request of user {0} for file {1}".format(frappe.session.user, file_data.get("file_name"))
		todo.reference_type = "Project Commercial"
		todo.reference_name = file_data.get("project")
		todo.role = "EL"
		todo.owner = usr
		todo.status = "Open"
		todo.priority = "High"
		todo.save(ignore_permissions=True)
	args = {"user_name":frappe.session.user, "file_name":file_data.get("file_name")}	
	frappe.sendmail(recipients=users, sender=None, subject=subject,
		message=frappe.get_template(template).render(args))	

@frappe.whitelist()
def create_ip_download_log(file_name):
	idl = frappe.new_doc("IP Download Log")
	idl.user_id = frappe.session.user
	idl.file_name = file_name
	idl.downloaded_datetime = now()
	idl.save(ignore_permissions=True)


@frappe.whitelist()
def get_my_download(search_filters):
	search_filters = json.loads(search_filters)
	result = get_downloads_query()
	response_data, total_pages = prepare_response_data(search_filters, result)
	print "in get download"
	print response_data
	return response_data, total_pages 	

def get_downloads_query():
	return frappe.db.sql(""" select name, file_name, approval_status, validity_end_date from `tabIP Download Approval` 
					where approval_status="Download Allowed" and ip_file_requester=%s 
					and validity_end_date > %s
					order by creation desc """,(frappe.session.user, now()), as_dict=1, debug=1)



def get_request_status(response_data, result_data):
	for response in response_data:
		result = filter(lambda record: record.get("file_name") == response.get("file_name"), result_data)
		response["download_validity_end_date"] = result[0].get("validity_end_date") if result else ""
		response["approval_status"] = result[0].get("approval_status") if result else ""
		response["download_count"] = frappe.get_list("IP Download Log", fields=["count(*)"], filters={ "file_name":response.get("file_name") }, as_list=True)[0][0] 
		response["avg_ratings"] = frappe.get_list("IP Review", fields=["ifnull(avg(ratings),0.0)"], filters={ "file_name":response.get("file_name") }, as_list=True)[0][0]
		response["comments"] = frappe.db.sql(""" select user_id, comments, ratings  from `tabIP Review` where  file_name = %s""",(response.get("file_name")),as_dict=1)	 
		response["download_flag"] = frappe.db.get_value("IP Download Log", {"file_name":response.get("file_name"), "user_id":frappe.session.user}, "name")


@frappe.whitelist()
def get_my_pending_requests(search_filters):
	search_filters = json.loads(search_filters)
	result = get_pending_request_query()
	response_data, total_pages = prepare_response_data(search_filters, result)
	frappe.errprint(response_data)
	return response_data, total_pages


def prepare_response_data(search_filters, result):
	response_data, total_pages = [], 0
	file_name = ','.join('"{0}"'.format(record.get("file_name")) for record in result )
	if file_name:
		my_query = "select * from `tabIP File` where file_name in ({0}) ".format(file_name)
		limit_query = "LIMIT 2 OFFSET {0}".format(search_filters.get("page_no") * 2 )
		total_records = get_total_records(my_query)
		response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
		get_request_status(response_data, result)
		total_pages = math.ceil(total_records[0].get("count",0)/2.0)
	return response_data, total_pages 	


def get_pending_request_query():
	return frappe.db.sql(""" select name, file_name, approval_status, validity_end_date from `tabIP Download Approval` 
					where approval_status="Pending" and ip_file_requester=%s 
					order by creation desc """,(frappe.session.user), as_dict=1, debug=1)