# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import cstr, flt, get_datetime, get_time, getdate
class NegativeHoursError(frappe.ValidationError): pass
from frappe.model.document import Document
class ChecklistTimeLog(Document):

	def validate(self):
		self.set_status()
		self.validate_timings()
		
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
	

