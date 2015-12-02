# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class FinancialData(Document):
	def validate(self):
		#self.validate_fund_name()
		self.validate_shareholders_name()
		self.validate_yearlydata_against_customer()
		if self.is_pe_vc == 'Yes':
			self.validate_fund_type()
		self.validate_fiscal_year()

	def validate_fund_name(self):
		fund_list = []
		if self.get('name_of_fund'):
			for d in self.get('name_of_fund'):
				if d.fund_type:
					if not d.name_of_fund:
						frappe.msgprint("Please specify Fund Name against the Fund Type '%s'"%d.fund_type,raise_exception=1)
				if d.fund_type not in fund_list:
					fund_list.append(d.fund_type)

				else:
					frappe.msgprint("No duplicate fund type is allowed",raise_exception=1)
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
			frappe.msgprint(" Entry for Financial Year '%s' against the Customer = '%s' is already created"%(self.financial_year,self.customer),raise_exception=1)


	def validate_fund_type(self):
		if not len(self.get('name_of_fund'))>0:
			frappe.msgprint("At least one Fund Details entry is mandatory in Fund Child table.",raise_exception=1)


	def validate_fiscal_year(self):
		#pass
		fiscal_year = frappe.db.sql("""select value from `tabSingles` where doctype='Global Defaults' and field='current_fiscal_year'""",as_list=1)
		if fiscal_year:
			if self.financial_year >= fiscal_year[0][0]:
				frappe.msgprint("No permission to create Financial Data for Current and Future Fiscal Year also.")

def get_shareholders(doctype, txt, searchfield, start, page_len, filters):
	# from frappe.desk.reportview import get_match_cond
	# txt = "%{}%".format(txt)
	return frappe.db.sql("""select distinct f.name
		from `tabFFWW` f , `tabFFWW Designation` d
		where f.docstatus < 2
		and f.contact is not null
			and f.name = d.parent
			and f.name in (select parent from `tabFFWW Designation` where designation='Share Holder')""",as_list=1)



def get_promoters(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	return frappe.db.sql("""select distinct f.name
		from `tabFFWW` f , `tabFFWW Designation` d
		where f.docstatus < 2
		and f.contact is not null
			and f.name = d.parent
			and f.name in (select parent from `tabFFWW Designation` where designation='Promoter')""")