from __future__ import unicode_literals
import frappe
from frappe.utils import flt, cstr, cint, time_diff_in_hours, now, time_diff, add_days
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
	limit_query = "LIMIT 2 OFFSET {0}".format(search_filters.get("page_no") * 2 )
	my_query = """ select * from `tabTraining` tr
						where 
						( tr.skill_matrix_18 like '%{0}%' or tr.name like '%{0}%' 
						or tr.skill_matrix_120 like '%{0}%' or tr.document_type like '%{0}%' )  order by ipf.uploaded_date desc """.format(search_filters.get("filters"))
	
	total_records = get_total_records(my_query)
	response_data = frappe.db.sql(my_query + limit_query, as_dict=True)
	get_request_download_status(response_data)
	total_pages = math.ceil(total_records[0].get("count",0)/2.0)
	return response_data, total_pages 