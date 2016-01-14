# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import json
from frappe.utils import getdate, date_diff, add_days, cstr
from frappe.model.document import Document

class ChecklistTask(Document):

	def get_feed(self):
		return '{0}: {1}'.format(_(self.status), self.title)

	def validate(self):
		self.validate_status()
		self.validate_dates()
	
	def on_submit(self):
		if(self.status != "Closed"):
			frappe.throw(_("Task Status is Not Closed So Cannot Submit Task."))			

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

	def update_time(self):
		tl = frappe.db.sql("""select min(from_time) as start_date, max(to_time) as end_date,
			sum(hours) as time from `tabChecklist Time Log` where task = %s and docstatus=1"""
			,self.name, as_dict=1)[0]
		if self.status == "Open":
			self.status = "WIP"	
		self.actual_time= tl.time
		self.actual_start_date= tl.start_date
		self.actual_end_date= tl.end_date

@frappe.whitelist()
def get_timelog(doc):
	current_doc = json.loads(doc)
	timelog = frappe.db.sql("""select name from `tabChecklist Time Log` where task = '{0}'""".format(current_doc['name']),as_list=1)
	if(not timelog):
		return "Not Allowed Without Create Time Log Cannot Closed Task" 