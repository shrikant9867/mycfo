from __future__ import unicode_literals
import frappe



def get_central_delivery():
	central_delivery = frappe.db.sql(""" select distinct usr.email from `tabUser` usr 
								left join `tabUserRole` usr_role 
								on usr_role.parent = usr.name
								where usr.name != "Administrator"
								and usr_role.role = "Central Delivery"  """, as_dict=1)
	central_delivery = [user.get("email") for user in central_delivery if user.get("email")]
	return central_delivery