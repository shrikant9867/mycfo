# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, flt, getdate, comma_and, cint,add_months
import datetime

class ProjectCommercial(Document):
	def validate(self):
		if self.p_type == 'Fixed + Variable':
			self.validate_fixed_variable_type()
		self.validate_project_value()
		if self.project_status == 'Terminate' or self.project_status == 'Close':
			self.delink_projectid()

	def validate_project_value(self):
		total = 0.00
		if self.get('table_17'):
			for d in self.get('table_17'):
				if d.amount:
					total+= d.amount
		if flt(self.p_value) != total:
			frappe.msgprint("Project value must be equal to the total of all amount specified in the amount details child table.",raise_exception=1)

	def delink_projectid(self):
		commercial_data = frappe.db.sql("""select name from `tabOperation And Project Commercial` where operational_matrix_status='Active'
											and project_commercial='%s'"""%self.name,as_list=1)
		if(len(commercial_data))>0:
			for commercial_name in commercial_data:
				frappe.db.sql("""update `tabOperation And Project Commercial` set operational_matrix_status='Deactive'
						where name='%s'"""%commercial_name[0])
				frappe.db.commit()

	def validate_fixed_variable_type(self):
		if self.p_value:
			if self.fix_val and self.var_val:
				if flt(self.p_value) != (flt(self.fix_val) + flt(self.var_val)):
					frappe.msgprint("For project type Fixed + Variable,total of fixed and variable value must be equal to the project value",raise_exception=1)
				else:
					frappe.errprint("else")
					return {"status":True}


	def get_child_details(self,months=None):
		self.set('table_17', [])
		date_list = []
		start_date = getdate(self.start_date)
		start_month = start_date.month
		start_year = start_date.year
		due_amount = flt(flt(self.p_value)/cint(months))
		new_date = self.pick_date +'-'+ cstr(start_month) + '-' + cstr(start_year)
		final_date = getdate(datetime.datetime.strptime(cstr(new_date),'%d-%m-%Y'))
		date_list.append(final_date)
		if months == 1:
			self.create_child_record(due_amount,date_list)
		else:
			for i in range(1,months):
				date=add_months(final_date,1)
				frappe.errprint(["j",date])
				date_list.append(date)
				final_date=date
				frappe.errprint(date_list)
			self.create_child_record(due_amount,date_list)


	def get_child_details_for_fixed_variable(self,months=None):
		self.set('table_17', [])
		date_list = []
		start_date = getdate(self.start_date)
		start_month = start_date.month
		start_year = start_date.year
		due_amount = flt(flt(self.fix_val)/cint(months))
		new_date = self.fixed_pick_date +'-'+ cstr(start_month) + '-' + cstr(start_year)
		final_date = getdate(datetime.datetime.strptime(cstr(new_date),'%d-%m-%Y'))
		date_list.append(final_date)
		if months == 1:
			self.create_child_record(due_amount,date_list)
		else:
			for i in range(1,months):
				frappe.errprint(["months",months])
				date=add_months(final_date,1)
				frappe.errprint(["j",date])
				date_list.append(date)
				final_date=date
				frappe.errprint(["date_list",date_list])
			self.create_child_record(due_amount,date_list)


	def create_child_record(self,due_amount,date_list):
		frappe.errprint("create_child_record")
		if(len(date_list)>0):
			for i in date_list:
				frappe.errprint(["i",i])
				ch = self.append('table_17', {})
				ch.due_date = i
				ch.amount = due_amount


	def clear_child_table(self):
		self.set('table_17', [])
