# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, flt, getdate, comma_and, cint

class ProjectCommercial(Document):
	def validate(self):
		if self.p_type == 'Fixed + Variable':
			self.validate_fixed_variable_type()
		self.validate_project_value()

	def validate_project_value(self):
		total = 0.00
		if self.get('amount_details'):
			for d in self.get('amount_details'):
				if d.name:
					total+= d.amount
		if self.p_value <= total:
			frappe.msgprint("Project value must be less than the total amount description in the amount details child table",raise_exception=1)

	def validate_fixed_variable_type(self):
		if self.p_value:
			if self.fix_val and self.var_val:
				if flt(self.p_value) != (flt(self.fix_val) + flt(self.var_val)):
					frappe.msgprint("For project type Fixed + Variable,total of fixed and variable value must be equal to the project value",raise_exception=1)
