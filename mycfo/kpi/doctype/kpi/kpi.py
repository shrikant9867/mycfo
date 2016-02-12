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
