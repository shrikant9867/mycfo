# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_colums()
	data = get_data(filters)
	return columns, data

def get_data(filters):
	result = frappe.db.sql("""select op.operational_id,op.operational_matrix_title,op.operational_matrix_status,op.customer,cu.pan_number,
								cu.tan_number, cu.cin_number, od.role,emp.employee_name,od.email_id
									from `tabOperation And Project Commercial` op,`tabCustomer` cu, `tabOperation Details` od, 
										`tabEmployee` emp									
										where cu.name = op.customer 
											and od.parent = op.operational_id 
											and emp.name = od.user_name 
											and od.role in ("EL","EM") order by op.operational_id """,as_list=1)
	return result


def get_colums():
	columns =  [
			_("Operational Matrix") + ":Link/Operational Matrix:120",
			_("OM Title") + ":Data:200",
			_("OM Status") + ":Data:100",
			_("Customer") + ":Link/Customer:170",
			_("PAN NO") + ":Data:100",
			_("TAN NO") + ":Data:100",
			_("CIN NO") + ":Data:170",
			_("Role") + ":Data:80",
			_("Employee Name") + ":Data:150",
			_("Email Id") + ":Data:200"
	]
	return columns
