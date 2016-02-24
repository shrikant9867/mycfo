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
		self.validate_child_table_duplication()
		if self.get('operation_details'):
			self.validate_duplicate_entry()
		self.update_child_table_of_ompc()	

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

	def validate_child_table_duplication(self):
		record_list = []
		details_dict = {}
		details = {}
		if self.get('operation_details'):
			for d in self.get('operation_details'):
				details = {}
				details[d.role] = d.user_name
				if details not in record_list:
					record_list.append(details)
				else:
					frappe.msgprint("No duplicate record is allowed to be enter in Operation Details child table",raise_exception=1)

	def update_child_table_of_ompc(self):
		if self.operation_details:
			ompc = frappe.db.sql("""select t1.name from `tabOperation And Project Commercial`t1,
									`tabOperational Matrix`t2 
									where t1.operational_id = t2.name 
									and t2.name = '{0}'""".format(self.name),as_list=1)
			ompc_list = [e[0] for e in ompc]
			
			opm = ''
			for omp in ompc_list:
				om_pc = frappe.get_doc("Operation And Project Commercial",omp)
				om_pc.set("operation_details", [])
				for item in self.operation_details:
					child = om_pc.append("operation_details", {})
					child.role = item.role
					child.email_id = item.email_id
					child.user_name = item.user_name
					child.contact = item.contact	 
				om_pc.save(ignore_permissions = True)

	def validate_duplicate_entry(self):
		pass