# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from datetime import datetime
import itertools
import json
from frappe.utils import cstr, flt, get_datetime, get_time, getdate
from datetime import datetime, timedelta
class NegativeHoursError(frappe.ValidationError): pass
from frappe.model.document import Document
class ChecklistTimeLog(Document):

	def validate(self):
		self.set_status()
		self.validate_timings()
		self.validate_time_logs()

	def on_submit(self):
		self.update_task_and_project()

	def on_cancel(self):
		self.update_task_and_project()

	def update_task_and_project(self):
		if self.task:
			task = frappe.get_doc("Checklist Task", self.task)
			task.update_time()
			task.save()

		# elif self.project:
		# 	frappe.get_doc("Checklist Requisition", self.project).update_project()
	def before_update_after_submit(self):
		self.set_status()

	def before_cancel(self):
		self.set_status()

	def set_status(self):
		self.status = {
			0: "Draft",
			1: "Submitted",
			2: "Cancelled"
		}[self.docstatus or 0]

	def validate_timings(self):
		if self.to_time and self.from_time and get_datetime(self.to_time) <= get_datetime(self.from_time):
			frappe.throw(_("To Time must be greater than From Time"), NegativeHoursError)
	
	def validate_time_logs(self):
		old_time_log = frappe.db.sql("""select from_time from `tabChecklist Time Log` where task = '{0}'""".format(self.task),as_list=1)		
		first_from_date = old_time_log
		if((len(first_from_date) > 1) and (get_datetime(self.from_time) <= get_datetime(first_from_date[0][0]))):
			frappe.throw(_("From time For This Task Will Be Greater Than {0}".format(first_from_date[0][0])))			

@frappe.whitelist()
def valid_dates(doc):
	current_doc = json.loads(doc)
	holiday_date = frappe.db.sql("""select holiday_date from `tabHoliday` h1,`tabHoliday List` h2 
		where h1.parent = h2.name and h2.name = 'Mycfo' order by holiday_date asc""",as_list=1)
	chain = itertools.chain(*holiday_date)
 	holiday = list(chain)
 	to_date = ''
 	from_date = ''
 	
	if current_doc.get('from_time'):
 		from_time = datetime.strptime(current_doc.get('from_time'), '%Y-%m-%d %H:%M:%S')
 		from_date = from_time.date()

 	if from_date in holiday:
		return "From Time In Holiday List"	

 	if current_doc.get('to_time'):	
 		to_time = datetime.strptime(current_doc.get('to_time'), '%Y-%m-%d %H:%M:%S')
 		to_date = to_time.date()

	if to_date in holiday:
		return "To Time In Holiday List"

@frappe.whitelist()
def valid_hours(doc):
	current_doc = json.loads(doc)
	if current_doc.get('from_time') and current_doc.get('to_time'):
		from_date = datetime.strptime(current_doc.get('from_time'), '%Y-%m-%d %H:%M:%S')
		to_date = datetime.strptime(current_doc.get('to_time'), '%Y-%m-%d %H:%M:%S')
		holiday_count = frappe.db.sql("""select count(*) from `tabHoliday List` h1,`tabHoliday` h2 
		where h2.parent = h1.name and h1.name = 'Mycfo' and h2.holiday_date >= %s and  h2.holiday_date <= %s""",(from_date.date(),to_date.date()),as_list=1)		
		return holiday_count[0][0]	
		
		