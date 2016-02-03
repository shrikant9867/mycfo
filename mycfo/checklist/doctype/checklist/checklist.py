# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import itertools
from frappe.model.document import Document

class Checklist(Document):
	pass

	# def validate(self):
	# 	self.build_notification()
	# 	self.make_todo()	

	# def build_notification(self):
	# 	if self.task:
	# 		for t in self.task:
	# 			print t.assignee
	# 			user_list = frappe.db.sql("""select t1.email from `tabUser` t1,`tabUserRole` t2 
	# 				where t1.name = t2.parent and t2.role = '{0}'""".format(t.assignee),as_list =1)
	# 			chain = itertools.chain(*user_list)
	# 	 		user =  list(chain)
	# 			self.notify_employee(user,"Checklist Created","Checklist Assigned")

	# def notify_employee(self,receiver,subj,msg):
	# 	"""
	# 		send mail notification
	# 	"""	
	# 	frappe.sendmail(receiver, subject=subj, message =msg)

	
