from __future__ import unicode_literals
import frappe

from frappe.utils import get_datetime, now



def get_central_delivery():
	central_delivery = frappe.db.sql(""" select distinct usr.email from `tabUser` usr 
								left join `tabUserRole` usr_role 
								on usr_role.parent = usr.name
								where usr.name != "Administrator"
								and usr_role.role = "Central Delivery"  """, as_dict=1)
	central_delivery = [user.get("email") for user in central_delivery if user.get("email")]
	return central_delivery



def make_login_log():	
	log = frappe.new_doc("Login Log")
	log.user = frappe.session.user
	log.login_time = now()
	log.sid = frappe.session.sid
	log.save(ignore_permissions=True)


def update_login_log():
	log = frappe.db.get_value("Login Log", {"sid":frappe.session.sid}, "name")
	if log:
		frappe.db.sql("""  update `tabLogin Log` set log_out_time = %s where name = %s """, (now(), log) )
		frappe.db.commit()