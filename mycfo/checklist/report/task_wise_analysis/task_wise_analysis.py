# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt

def execute(filters=None):
	columns, data = [], []
	columns = get_colums()
	data = get_data(filters)
	return columns, data

def get_data(filters):
	if filters:
		result = frappe.db.sql("""select title,checklist_name,expected_start_date,expected_end_date,end_date,count,tat from `tabChecklist Task` 
		{0} order by expected_start_date desc""".format(get_conditions(filters)),as_list=1,debug=1)
		return result
	else:
		result = []
		return result		

def get_conditions(filters):
	cond = ''
	if filters.get('checklist_requisition') and filters.get('status') and filters.get('user'):
		cond = "where project = '{0}' and status = '{1}' and user = '{2}'".format(filters.get('checklist_requisition'),filters.get('status'),filters.get('user'))

	elif filters.get('checklist_requisition') and filters.get('status'):
		cond = "where project = '{0}' and status = '{1}'".format(filters.get('checklist_requisition'),filters.get('status'))

	elif filters.get('checklist_requisition') and filters.get('user'):
		cond = "where project = '{0}' and user = '{1}'".format(filters.get('checklist_requisition'),filters.get('user'))

	elif filters.get('status') and filters.get('user'):
		cond = "where status = '{0}' and user = '{1}'".format(filters.get('status'),filters.get('user'))

	elif filters.get('user'):
		cond = "where user = '{0}'".format(filters.get('user'))

	elif filters.get('checklist_requisition'):
		cond = "where project = '{0}' ".format(filters.get("checklist_requisition"))

	elif filters.get('status'):
		cond = "where status='{0}'".format(filters.get("status"))	
	return cond


def  get_colums():
	columns = [_("Task Name") + ":Data:140"] + [_("Process/Checklist Name") + ":Data:180"] + [_("Planned Start Date") + ":Date:140"] + \
	[_("Planned End Date") + ":Date:140"] + [_("Actual End Date") + ":Date:140"] + \
	[_("Actual Time(In Hours)") + ":Int:170"] + [_("TAT(In Hours)") + ":Int:110"]
	return columns


