# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_data(filters):
	result = frappe.db.sql('''SELECT opc.customer,
								opc.operational_id,
								opc.operational_matrix_status,
								opd.role,
								opd.user_name,
								opd.email_id,
								opd.contact
							from `tabOperation And Project Commercial` opc
							left join `tabOperation And Project Details` opd 
							on opd.parent = opc.name
							{0}
							 '''.format(get_conditions(filters)),as_list=1)
	return result

def get_conditions(filters):
	if filters:
		return "where opc.customer like '%%%s%%'"%filters['customer']
	else:
		return ""
	

def get_columns():
	return [
			_("Customer") + ":Link/Customer:150",
			_("Operational ID") + ":Link/Operational Matrix:110",
			_("OM Status") + ":Data:110",
			_("Role") + ":Data:110",
			_("Employee ID") + ":Link/Employee:100",
			_("Email ID") + ":Data:200",
			_("Contact") + ":Data:110",
	]