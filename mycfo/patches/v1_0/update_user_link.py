import frappe

def execute():
	frappe.db.sql(""" update `tabTraining` set user = owner """)
	frappe.db.sql(""" update `tabIP File` set user = owner """)
