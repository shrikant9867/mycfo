# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Assessment(Document):
	
	def validate(self):
		self.validate_for_answers()
		self.set_subjective_flag()
		self.total_marks = sum([row.total_marks for row in self.table_5])
		self.total_questions = len(self.table_5)


	def set_subjective_flag(self):
		for row in self.table_5:
			if row.question_type == 'Subjective':
				self.subjective_flag = "Yes"
				break
		else:
			self.subjective_flag = "No" 				

	def validate_for_answers(self):
		mapper  ={"A":"option_a", "B":"option_b", "C":"option_c", "D":"option_d", "E":"option_e"}
		for row in self.table_5:
			if row.question_type == "Objective":
				if not row.objective_answer or not row.get(mapper.get(row.objective_answer)):
					frappe.throw("Please provide valid answer for row no {0}".format(row.idx))
			if not row.total_marks:
				frappe.throw("Total Marks for question should be non-zero digit for row no {0}".format(row.idx))



def get_permission_query_conditions(user):
	roles = frappe.get_roles()
	if "Central Delivery" not in roles and frappe.session.user != "Administrator":		
		return """(`tabAssessment`.owner = "{user}" )""".format(user = frappe.session.user)	