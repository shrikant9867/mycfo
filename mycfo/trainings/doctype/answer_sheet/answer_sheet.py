# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class AnswerSheet(Document):

	
	def before_save(self):
		if self.answer_sheet_status == "Open":
			self.calculate_score()

	def before_submit(self):
		self.validate_for_answer_sheet()
		self.answer_sheet_status = "Closed"
		self.update_training_subscription_form()

	def validate_for_answer_sheet(self):
		if self.answer_sheet_status != "Open":
			frappe.throw("Answer Sheet with Open status are only allowed to submit.")		

	def calculate_score(self):
		for row in self.table_5:
			if row.marks_obtained > row.total_marks:
				frappe.throw("Marks obtained for question {0} must be less than total marks.".format(row.idx))
			if row.question_type == 'Objective':
				row.marks_obtained = row.total_marks if row.user_answer == row.objective_answer else 0
		self.marks_obtained = sum([row.marks_obtained for row in self.table_5 if row.marks_obtained])
		self.percentage_score = round(float(self.marks_obtained) / float(self.total_marks) * 100, 2)


	def update_training_subscription_form(self):
		frappe.db.sql("update `tabTraining Subscription Approval` set request_status = 'Expired' where name = %s", (self.training_subscription))



def get_permission_query_conditions(user):
	roles = frappe.get_roles()
	if "Central Delivery" not in roles and frappe.session.user != "Administrator":		
		return """(`tabAnswer Sheet`.assessment_evaluator = "{user}" )""".format(user = frappe.session.user)	