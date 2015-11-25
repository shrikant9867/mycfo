# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class OperationalMatrix(Document):
	def validate(self):
		if self.operational_matrix_status == 'Deactive':
			self.delink_operational_matrix()
		self.validate_employee_child_table()
		if self.get('operation_details'):
			self.validate_duplicate_entry()

	def delink_operational_matrix(self):
		operational_data = frappe.db.sql("""select name from `tabOperation And Project Commercial` where operational_matrix_status='Active'
											and operational_id='%s'"""%self.name,as_list=1)
		if(len(operational_data))>0:
			for operationa_name in operational_data:
				frappe.db.sql("""update `tabOperation And Project Commercial` set operational_matrix_status='Deactive'
						where name='%s'"""%operationa_name[0])
				frappe.db.commit()


	def validate_employee_child_table(self):
		if not self.get('operation_details'):
			frappe.msgprint("At least one entry is mandetory in Operation Matrix child table.",raise_exception=1)

	def validate_duplicate_entry(self):
		pass