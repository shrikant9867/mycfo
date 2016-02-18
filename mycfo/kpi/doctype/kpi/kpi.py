# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class KPI(Document):
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
								and opd.email_id != %(user)s  
								and opc.customer = %(customer)s
								and (emp.name like %(txt)s
								or emp.employee_name like %(txt)s)
								limit 20
	 		""", {
			'txt': "%%%s%%" % txt,
			'customer':filters.get("customer"),
			"user":frappe.session.user}, as_list=1)
