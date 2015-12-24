# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CountryCode(Document):
	def validate(self):
		self.validate_country_code()


	def validate_country_code(self):
		name = frappe.db.sql("""select name from `tabCountry Code` where country_code='%s' and name!='%s' 
							"""%(self.country_code,self.name),as_list=1)
		if name:
			frappe.msgprint("Country code '%s' is already specified for the country '%s' "%(self.country_code,self.country_name),raise_exception=1)
