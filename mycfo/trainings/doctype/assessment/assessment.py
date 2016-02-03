# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Assessment(Document):
	
	def validate(self):
		self.validate_for_answers()
		self.total_marks = sum([row.total_marks for row in self.table_5])
		self.total_questions = len(self.table_5)


	def validate_for_answers(self):
		for row in self.table_5:
			if row.question_type == "Objective":
				if not row.option_a or not row.option_b or not row.option_c or not row.option_d:
					frappe.throw("Options A,B,C,D are mandatory for objective type question for row no {0}".format(row.idx)) 
				if not row.objective_answer or (row.objective_answer == 'E' and not row.option_e):
					frappe.throw("Please provide valid answer for row no {0}".format(row.idx))
			if not row.total_marks:
				frappe.throw("Total Marks for question should be non-zero digit for row no {0}".format(row.idx))
