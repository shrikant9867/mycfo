# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import itertools
from frappe.model.document import Document

class Checklist(Document):

	def validate(self):
		self.build_notification()
		self.make_todo()	
		self.get_number_of_task()

	def build_notification(self):
		if self.task:
			for t in self.task:
				print t.assignee
				user_list = frappe.db.sql("""select t1.email from `tabUser` t1,`tabUserRole` t2 
					where t1.name = t2.parent and t2.role = '{0}'""".format(t.assignee),as_list =1)
				chain = itertools.chain(*user_list)
		 		user =  list(chain)
				self.notify_employee(user,"Checklist Created","Checklist Assigned")
				# self.counter = 1
				# frappe.db.set_value("Checklist",self.name,"counter",1)

	def notify_employee(self,receiver,subj,msg):
		"""
			send mail notification
		"""	
		frappe.sendmail(receiver, subject=subj, message =msg)

	def make_todo(self):
		if self.flags.dont_make_todo: return
		
		todo_names = []
		for t in self.task:
			todo = frappe.new_doc("ToDo")
			todo.description = t.task_name

			todo.update({
				# ct:cr
				# "owner": t.task_name,
				"role": t.assignee,
				"reference_type": self.doctype,
				"reference_name": self.name
			})
			todo.flags.ignore_links = True
			todo.flags.from_project = True
			todo.save(ignore_permissions = True)
			todo_names.append(todo.name)
	
	def get_number_of_task(self):
		number_of_task = frappe.db.sql("""select count(*) from `tabProcess Task` where parent = '{0}' """.format(self.name),as_dict=1)
		print number_of_task[0]['count(*)']
		self.counter = number_of_task[0]['count(*)']
		# frappe.db.set_value("Checklist",self.name,"counter",number_of_task[0]['count(*)'])
		print self.counter
