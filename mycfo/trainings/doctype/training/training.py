# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Training(Document):
	
	def validate(self):
		self.validate_for_assessments()
		self.validate_for_training_data()

	
	def validate_for_assessments(self):
		pass

	
	def validate_for_training_data(self):
		if cint(self.get("__islocal")) and not self.training_file_data:
			frappe.throw("Please Upload the Training data for generating request.")	
