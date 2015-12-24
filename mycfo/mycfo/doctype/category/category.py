# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.naming import make_autoname
from frappe.model.document import Document

class Category(Document):

	def validate(self):
		if self.is_child==0:
			self.validate_parent_category_name()
		if self.is_child==1:
			self.validate_child_category_name()
			self.validate_category_name()

	def on_update(self):
		pass


	def validate_parent_category_name(self):
		if not self.c_name:
			frappe.msgprint("Category name is mandatory",raise_exception=1)

	def validate_child_category_name(self):
		if not self.name1:
			frappe.msgprint("Category name is mandatory",raise_exception=1)

	def validate_category_name(self):
		if not self.parent_category:
			frappe.msgprint("If you are creating a child record in 'Category Master' then Parent Category is mandatory",raise_exception=1)
	def autoname(self):
		if self.is_child==0:
			self.name = self.c_name
		else:
			self.name = self.name1

