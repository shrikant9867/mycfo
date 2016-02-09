# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_colums()
	data = get_data(filters)
	return columns, data


def get_data(filters):
	if filters:
		result = frappe.db.sql("""select checklist_name,expected_start_date,end_date,count from `tabChecklist Requisition` 
			 {0} order by expected_start_date desc""".format(get_conditions(filters)),as_list=1)
		return result
	else:
		result = []
		return result

def get_conditions(filters):
	cond = ''
	if filters.get('checklist') and filters.get("checklist_status"):
		cond = "where name = '{0}' and checklist_status = '{1}'".format(filters.get('checklist'),filters.get('checklist_status'))
	elif filters.get('checklist'):
		cond = "where name ='{0}'".format(filters.get("checklist"))
	elif filters.get("checklist_status"):
		cond = "where checklist_status ='{0}'".format(filters.get("checklist_status"))				
	return cond	


def  get_colums():
	columns = [_("Checklist") + ":Data:250"] + [_("Start Date") + ":Date:250"] + \
	[_("End Date") + ":Date:250"] + [_("Actual Time(In Days)") + ":Int:150"]
	return columns	
	