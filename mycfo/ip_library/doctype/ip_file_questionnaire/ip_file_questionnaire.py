# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class IPFileQuestionnaire(Document):
	
	def validate(self):
		self.validate_for_questions()
		self.validate_for_objective_questions()

	def validate_for_questions(self):
		if not self.questionnaire:
			frappe.throw("Questions are mandatory to save.")

	def validate_for_objective_questions(self):
		for row in self.questionnaire:
			options = [ row.get(option).strip() for option in ["option_a", "option_b", "option_c", "option_d", "option_e"] if row.get(option)]
			if row.question_type == "Objective":
				if not row.option_a or not row.option_b:
					frappe.throw("Option A and option B are mandatory for objective questions for row no {0}".format(row.idx))
				if len(set(options)) != len(options):
					frappe.throw("Duplicate answer not allowed for row no {0}".format(row.idx))
