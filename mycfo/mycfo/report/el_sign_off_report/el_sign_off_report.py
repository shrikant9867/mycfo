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
	result = []
	frappe.errprint(frappe.session.user)
	if frappe.session.user != "Administrator":
		result = frappe.db.sql("""select customer, sign_off_datetime, el_user, user_id from 
			`tabEL Sign Off Details` where owner = '%s' order by creation """%(frappe.session.user), as_list=1)
	else:
		result = frappe.db.sql("""select customer, sign_off_datetime, el_user, user_id from 
			`tabEL Sign Off Details` order by creation """, as_list=1)
	return result

def get_columns():
	return [
		_("Customer") + ":Link/Customer:250",
		_("Sign Off Datetime") + ":Datetime:200",
		_("EL User Name") + ":Data:200",
		_("EL User ID") + ":Link/User:250"	
	]