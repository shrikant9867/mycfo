# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import itertools
from frappe import _
import json
import datetime
from datetime import date
from datetime import datetime, timedelta
from frappe.utils import getdate, date_diff, add_days, cstr
from frappe.model.document import Document

class ChecklistTask(Document):
	def validate(self):
		self.validate_status()
		self.validate_dates()
	
	def on_submit(self):
		if(self.status != "Closed"):
			frappe.throw(_("Task Status is Not Closed So Cannot Submit Task."))				
		self.get_status_of_all()
		self.get_task_closed()

	def validate_dates(self):
		if self.expected_start_date and self.expected_end_date and getdate(self.expected_start_date) > getdate(self.expected_end_date):
			frappe.throw(_("'Expected Start Date' can not be greater than 'Expected End Date' For Task").format(self.name))

		if self.actual_start_date and self.actual_end_date and getdate(self.actual_start_date) > getdate(self.actual_end_date):
			frappe.throw(_("'Actual Start Date' can not be greater than 'Actual End Date'"))	

	def validate_status(self):
		if self.status!=self.get_db_value("status") and self.status == "Closed":
			for d in self.ct_depend_task:
				if frappe.db.get_value("Checklist Task", d.task, "status") != "Closed":
					frappe.throw(_("Cannot close task as its dependant task {0} is not closed.").format(d.task))
					self.status = "Open"

	# def update_time(self):
	# 	tl = frappe.db.sql("""select min(from_time) as start_date, max(to_time) as end_date,
	# 		sum(hours) as time from `tabChecklist Time Log` where task = %s and docstatus=1"""
	# 		,self.name, as_dict=1)[0]
	# 	if self.status == "Open":
	# 		self.status = "WIP"	
	# 	self.actual_time= tl.time
	# 	self.actual_start_date= tl.start_date
	# 	self.actual_end_date= tl.end_date

	def get_status_of_all(self):
		"""
		1.on_submit of task update checklist requisition
		"""
		checklist_requisition = frappe.get_doc("Checklist Requisition",self.project)
		status_list = []	
		for task in checklist_requisition.cr_task:
			status_list.append(task.status)
		if(status_list.count("Closed") == len(checklist_requisition.cr_task)):
			checklist_requisition.checklist_status = "Closed"
			frappe.db.set_value("Checklist Requisition",self.project,"checklist_status","Closed")
			Date = datetime.now()
			checklist_requisition.end_date == Date.now()
			frappe.db.set_value("Checklist Requisition",self.project,"end_date",Date.now())
			tot_holiday = frappe.db.sql("""select count(*) from `tabHoliday List` h1,`tabHoliday` h2 
				where h2.parent = h1.name and h1.name = 'Mycfo' and h2.holiday_date >= %s and  h2.holiday_date <= %s""",(checklist_requisition.expected_start_date,Date.now()))
			d1 = Date
			d = checklist_requisition.expected_start_date
			d2 = datetime.combine(d, datetime.min.time())		
			actual_time = abs((d2 - d1).days) - 1 - tot_holiday[0][0]
			checklist_requisition.count = actual_time
			frappe.db.set_value("Checklist Requisition",self.project,"count",actual_time)
	
	def get_task_closed(self):
		"""
		on_submit of each task
		For update Field name Task Closed IN checklist requisition
		"""
		checklist_requisition = frappe.get_doc("Checklist Requisition",self.project)
		counter = len(checklist_requisition.cr_task)
		closed_count = len(filter(lambda x: x.status=="Closed",checklist_requisition.cr_task))
		closed_task = "{1} / {0} Closed".format(counter,closed_count)
		checklist_requisition.task_closed = closed_task
		frappe.db.set_value("Checklist Requisition",self.project,"task_closed",closed_task)	

def get_permission_query_conditions(user):
	if not user: user = frappe.session.user

	if not user == "Administrator":
		return """(`tabChecklist Task`.user = '{0}')""".format(user)
		 
@frappe.whitelist()
def valid_hours(doc):
	current_doc = json.loads(doc)
	if current_doc.get('expected_start_date') and current_doc.get('end_date'):
		from_date = datetime.strptime(current_doc.get('expected_start_date'), '%Y-%m-%d')
		to_date = datetime.strptime(current_doc.get('end_date'), '%Y-%m-%d')
		# to_date = datetime.strptime(current_doc.get('end_date')[:-7], '%Y-%m-%d %H:%M:%S')
		holiday_count = frappe.db.sql("""select count(*) from `tabHoliday List` h1,`tabHoliday` h2 
		where h2.parent = h1.name and h1.name = 'Mycfo' and h2.holiday_date >= %s and  h2.holiday_date <= %s""",(from_date,to_date),as_list=1)
		return holiday_count[0][0]				 