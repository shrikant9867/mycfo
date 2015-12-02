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
			self.validate_total_of_both_type()
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

	def validate_total_of_both_type(self):
		fixed_total = 0.0
		variable_total = 0.0
		if self.fixed_type == 'Milestone':
			if self.get('table_17'):
				for d in self.get('table_17'):
					if d.f_type == 'Fixed':
						fixed_total+=d.amount
					else:
						variable_total+=d.amount
				if flt(fixed_total) != flt(self.fix_val):
					frappe.msgprint("Total sum of amount for fixed type in child table must be equal to the Fixed Value specified",raise_exception=1)

				if flt(variable_total) != flt(self.var_val):
					frappe.msgprint("Total sum of amount for  variable type in child table must be equal to the Variable Value specified",raise_exception=1)

	def get_child_details(self,months=None):
		self.get_dates(months)

	def get_dates(self,months):
		self.set('table_17', [])
		date_list = []
		start_date = getdate(self.start_date)
		start_day  =  start_date.day
		start_month = start_date.month
		start_year = start_date.year
		frappe.errprint(months)
		due_amount = flt(flt(self.p_value)/cint(months))
		frappe.errprint(due_amount)
		new_date = self.pick_date +'-'+ cstr(start_month) + '-' + cstr(start_year)
		final_date = getdate(datetime.datetime.strptime(cstr(new_date),'%d-%m-%Y'))
		date_list.append(final_date)
		self.check_project_value(date_list,months,due_amount,final_date)

	def check_project_value(self,date_list,months,due_amount,final_date):
		if self.pro_per == 30 or self.pro_per == 31:
			months-=1
		if flt(self.p_value)%cint(months) == 0:
			frappe.errprint("in modulo zero")
			due_amount = due_amount
			if months == 1:
				self.create_child_record(due_amount,date_list)
			else:
				for i in range(1,months):
					date=add_months(final_date,1)
					date_list.append(date)
					final_date=date
				self.create_child_record(due_amount,date_list)
		else:
			frappe.errprint("in not mdoudlo zero")
			modulo_value = flt(self.p_value)%cint(months)
			monthly_amount = flt(flt(self.p_value - modulo_value)/cint(months))
			amount_list = []
			for i in range(0,months):
				if i == months-1:
					amount_list.append(flt(monthly_amount + modulo_value))
				else:
					amount_list.append(monthly_amount)
			if months == 1:
				self.create_child_record(due_amount,date_list)
			else:
				for i in range(1,months):
					date=add_months(final_date,1)
					date_list.append(date)
					final_date=date
				self.create_child1_record(amount_list,date_list)
		


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
		self.check_project_value_for_fix_varialble(date_list,final_date,months,due_amount)

	def check_project_value_for_fix_varialble(self,date_list,final_date,months,due_amount):
		if self.pro_per == 30 or self.pro_per == 31:
			months-=1
		if flt(self.fix_val)%cint(months) == 0:
			frappe.errprint("in modulo zero")
			due_amount = due_amount
			if months == 1:
				self.create_child_record(due_amount,date_list)
				if self.var_val:
					ch = self.append('table_17', {})
					ch.f_type='Variable'
					ch.amount = self.var_val
			else:
				for i in range(1,months):
					date=add_months(final_date,1)
					date_list.append(date)
					final_date=date
				self.create_child_record(due_amount,date_list)
				if self.var_val:
					ch = self.append('table_17', {})
					ch.f_type='Variable'
					ch.amount = self.var_val
		else:
			frappe.errprint("in not mdoudlo zero")
			modulo_value = flt(self.fix_val)%cint(months)
			monthly_amount = flt(flt(self.fix_val - modulo_value)/cint(months))
			amount_list = []
			for i in range(0,months):
				if i == months-1:
					amount_list.append(flt(monthly_amount + modulo_value))
				else:
					amount_list.append(monthly_amount)

			if months == 1:
				self.create_child_record(due_amount,date_list)
				if self.var_val:
					ch = self.append('table_17', {})
					ch.f_type='Variable'
					ch.amount = self.var_val
			else:
				for i in range(1,months):
					date=add_months(final_date,1)
					date_list.append(date)
					final_date=date
				self.create_child1_record(amount_list,date_list)
				if self.var_val:
					ch = self.append('table_17', {})
					ch.f_type='Variable'
					ch.amount = self.var_val




	def create_child_record(self,due_amount,date_list):
		if(len(date_list)>0):
			for i in date_list:
				ch = self.append('table_17', {})
				ch.f_type='Fixed'
				ch.due_date = i
				ch.amount = due_amount

	def create_child1_record(self,amount_list,date_list):
		if(len(date_list)>0):
			for i, date in enumerate(date_list):
				ch = self.append('table_17', {})
				ch.f_type='Fixed'
				ch.due_date = date
				ch.amount = amount_list[i]


	def clear_child_table(self):
		self.set('table_17', [])
