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
								od.role,od.user_name,od.email_id
									from `tabOperation And Project Commercial` op,`tabCustomer` cu, `tabOperation Details` od 
										where cu.name = op.customer and od.parent = op.operational_id 
											and od.role in ("EL","EM") order by op.operational_id """,as_list=1)
	
	return result


def get_colums():
	columns =  [
			_("Operational Matrix") + ":Link/Operational Matrix:120",
			_("OM Title") + ":Data:200",
			_("OM Status") + ":Data:100",
			_("Customer") + ":Link/Customer:170",
			_("Pan Number") + ":Data:120",
			_("Role") + ":Data:80",
			_("Name") + ":Link/Employee:100",
			_("Email Id") + ":Data:200"
	]
	return columns
