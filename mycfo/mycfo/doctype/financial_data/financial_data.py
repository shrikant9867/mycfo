# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class FinancialData(Document):
	def validate(self):
		self.validate_fund_name()
		self.validate_shareholders_name()
		self.validate_yearlydata_against_customer()

	def validate_fund_name(self):
		fund_list = []
		if self.get('name_of_fund'):
			for d in self.get('name_of_fund'):
				if d.name_of_fund not in fund_list:
					fund_list.append(d.name_of_fund)
				else:
					frappe.msgprint("No duplicate fund name is allowed",raise_exception=1)
					break


	def validate_shareholders_name(self):
		shareholder_list = []
		if self.get('shareholders_detail'):
			for d in self.get('shareholders_detail'):
				if d.shareholder_name not in shareholder_list:
					shareholder_list.append(d.shareholder_name)
				else:
					frappe.msgprint("No duplicate shareholder name is allowed",raise_exception=1)
					break

	def validate_yearlydata_against_customer(self):
		if frappe.db.sql("""select name from `tabFinancial Data` where name!='%s' and customer='%s' and financial_year='%s'"""%(self.name,self.customer,self.financial_year)):
			name = frappe.db.sql("""select name from `tabFinancial Data` where name!='%s' and customer='%s' and financial_year='%s'"""%(self.name,self.customer,self.financial_year),as_list=1)
			frappe.msgprint(" Entry for financial year '%s' against the customer = '%s' is already created"%(self.financial_year,self.customer),raise_exception=1)