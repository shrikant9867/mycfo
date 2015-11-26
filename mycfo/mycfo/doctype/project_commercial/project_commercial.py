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

		self.validate_due_date_in_childtable()

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
					self.fix_val=''
					self.var_val=''
					frappe.msgprint("For project type Fixed + Variable,total of Fixed and Variable Value must be equal to the Project value",raise_exception=1)
				else:
					return {"status":True}


	def validate_due_date_in_childtable(self):
		date_list = []
		if self.get('table_17'):
			for d in self.get('table_17'):
				if d.due_date:
					if d.due_date not in date_list:
						date_list.append(d.due_date)
					else:
						frappe.msgprint("Duplicate Due Date is not allowed in Amount Details child table",raise_exception=1)
						break



	def get_child_details(self,months=None):
		self.set('table_17', [])
		date_list = []
		start_date = getdate(self.start_date)
		start_day  =  start_date.day
		start_month = start_date.month
		start_year = start_date.year
		end_date = getdate(self.end_date)
		end_day = end_date.day
		end_month = end_date.month
		end_year = end_date.year
		due_amount = flt(flt(self.p_value)/cint(months))
		new_date = self.pick_date +'-'+ cstr(start_month) + '-' + cstr(start_year)
		final_date = getdate(datetime.datetime.strptime(cstr(new_date),'%d-%m-%Y'))
		# frappe.errprint(["final_date",final_date])
		# frappe.errprint(getdate(datetime.datetime.strptime(cstr(cstr(start_day) +'-'+ cstr(start_month) + '-' + cstr(start_year)),'%d-%m-%Y')))
		# frappe.errprint(getdate(datetime.datetime.strptime(cstr(cstr(end_day) +'-'+ cstr(end_month) + '-' + cstr(end_year)),'%d-%m-%Y')))
		date_list.append(final_date)
		if months == 1:
			self.create_child_record(due_amount,date_list)
		else:
			for i in range(1,months):
				date=add_months(final_date,1)
				date_list.append(date)
				final_date=date
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
				date=add_months(final_date,1)
				date_list.append(date)
				final_date=date
			self.create_child_record(due_amount,date_list)
			if self.var_val:
				ch = self.append('table_17', {})
				ch.amount = self.var_val




	def create_child_record(self,due_amount,date_list):
		if(len(date_list)>0):
			for i in date_list:
				ch = self.append('table_17', {})
				ch.due_date = i
				ch.amount = due_amount


	def clear_child_table(self):
		self.set('table_17', [])
