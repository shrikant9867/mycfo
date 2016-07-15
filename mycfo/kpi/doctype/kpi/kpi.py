# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class KPI(Document):
	
	def validate(self):
		if not self.get("__islocal"):
			total_weightage = sum([self.business_total_weightage, self.finance_total_weightage, self.people_total_weightage, self.process_total_weightage])
			if total_weightage != 100:
				frappe.throw("Total of Business weightage, Finance weightage, People weightage & Process weightage must be equal to 100. Currently, Total weightage equals to {0}.".format(total_weightage))

	def before_submit(self):
		employee = frappe.db.get_value("Employee", {"user_id":frappe.session.user}, "name")
		response = frappe.db.sql(""" select  distinct(opd.user_name), emp.employee_name 
									from `tabOperation And Project Details` opd
									join `tabOperation And Project Commercial` opc
									on opd.parent = opc.name
									join `tabEmployee` emp
									on  emp.name  = opd.user_name 
									where opd.role in ("EL")
									and opd.user_name = '%s'  
									and opc.customer = '%s' """%(employee, self.customer), as_list=1)
		roles = frappe.get_roles()
		is_central = 0
		if "Central Delivery" in roles:
			is_central = 1

		if is_central == 1:
			pass
		elif not(len(response)):
			frappe.throw("Only EL Can submit KPI")

	def on_submit(self):
		css_doc = frappe.new_doc("Customer Satisfaction Survey")
		css_doc.customer = self.customer
		css_doc.start_date = self.start_date
		css_doc.end_date = self.end_date
		css_doc.kpi = self.name
		css_doc.save(ignore_permissions=True)
		frappe.msgprint("Customer Satisfaction Survey "+css_doc.name + " is created.")

@frappe.whitelist()
def get_kpi_resouce_assigned_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(""" select  distinct(opd.user_name), emp.employee_name 
								from `tabOperation And Project Details` opd
								join `tabOperation And Project Commercial` opc
								on opd.parent = opc.name
								join `tabEmployee` emp
								on  emp.name  = opd.user_name 
								where opd.role in ("EL","EM","TM")
								and opc.customer = %(customer)s
								and (emp.name like %(txt)s
								or emp.employee_name like %(txt)s)
								limit 20
	 		""", {
			'txt': "%%%s%%" % txt,
			'customer':filters.get("customer"),
			"user":frappe.session.user}, as_list=1)

@frappe.whitelist()
def get_el_list(customer):
	customer_list = frappe.db.sql("""SELECT DISTINCT(customer) 
	from `tabOperation And Project Commercial`,`tabOperation And Project Details`,`tabEmployee` 
	WHERE  `tabOperation And Project Commercial`.name in 
	(SELECT parent from `tabOperation And Project Details` WHERE user_id = '{0}' and role ="EL")
	and customer ='{1}'""".format(frappe.session.user,customer),as_list=1)

	return len(customer_list)
