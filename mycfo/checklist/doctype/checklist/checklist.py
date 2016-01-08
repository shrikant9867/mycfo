# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Checklist(Document):

	def validate(self):
		self.build_notification()

	def build_notification(self):
		if self.checklist_for:
			employee = frappe.get_doc("Employee",self.checklist_for)
			self.notify_employee(employee.user_id,"Checklist Created","Checklist Assigned")

	def notify_employee(self,receiver,subj,msg):
		"""
			send mail notification
		"""	
		frappe.sendmail(receiver, subject=subj, message =msg)

	# def make_todo(self):
	# if self.flags.dont_make_task: return
	
	# # task_names = []
	# # for t in self.cr_task:
	# if self.checklist_for:
	# 	todo = frappe.new_doc("ToDo")
	# 	todo.description = self.name

	# 	todo.update({
	# 		# ct:cr
	# 		"title": t.task_name,
	# 		"status": t.status,
	# 		"expected_start_date": t.start_date,
	# 		"expected_end_date": t.end_date
	# 		# "description": t.description,
	# 	})

	# 	task.flags.ignore_links = True
	# 	task.flags.from_project = True
	# 	task.save(ignore_permissions = True)
	# 	task_names.append(task.name)
			