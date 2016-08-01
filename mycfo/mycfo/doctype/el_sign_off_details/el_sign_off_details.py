# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import flt, cstr, today, now_datetime, now
import datetime

class ELSignOffDetails(Document):
	pass


@frappe.whitelist()
def get_info(customer, user):
	user_name = frappe.db.get_values("User", {"name":user}, ['first_name', 'last_name'], as_dict=True)
	if customer :
		els = frappe.new_doc("EL Sign Off Details")
		els.customer = customer
		if user_name and user_name[0]['last_name']:
			els.el_user = user_name[0]['first_name'] + " " + user_name[0]['last_name']
		elif user_name and user_name[0]['first_name']:
			els.el_user = user_name[0]['first_name']
		els.user_id = user
		els.sign_off_datetime = now()
		els.flags.ignore_permissions = 1
		els.save()
		return "Sign Off Entry Created"
	else:
		return "Entry Not Created"

@frappe.whitelist()
def send_notification_to_el_sign_off():
	from datetime import date
	from calendar import monthrange

	d = datetime.date.today()
	year = d.year
	check_day = cstr(d.month) + '-' + cstr(d.day)
	quarter_dates = ["3-20","6-20","9-20","12-20"]
	cust_dict = {}

	cust_list = frappe.db.sql("""select name from `tabCustomer`""")
	for c in cust_list:
		cust = frappe.db.sql("""select od.email_id, opc.name from 
				`tabOperation And Project Commercial` opc, `tabOperation And Project Details` od 
				where od.role = "EL" and operational_matrix_status = "Active" and opc.name = od.parent 
				and opc.customer = '%s' """%(c),as_list=1)
		el_user = []
		for c1 in cust:
			el_user.append(c1[0])
			cust_dict[c[0]] = el_user

	for q in quarter_dates:
		if q == check_day :
			if q == "3-20":
				quarter = 1
				first_month_of_quarter = 3 * quarter - 2
				last_month_of_quarter = 3 * quarter		
			elif q == "6-20":
				quarter = 2
				first_month_of_quarter = 3 * quarter - 2
				last_month_of_quarter = 3 * quarter	
			elif q == "9-20":
				quarter = 3
				first_month_of_quarter = 3 * quarter - 2
				last_month_of_quarter = 3 * quarter
			else:
				quarter = 4
				first_month_of_quarter = 3 * quarter - 2
				last_month_of_quarter = 3 * quarter
				
			date_of_first_day_of_quarter = date(year, first_month_of_quarter, 1)
			date_of_last_day_of_quarter = date(year, last_month_of_quarter, monthrange(year, last_month_of_quarter)[1])

			for cust in cust_dict:
				sign_off_details = frappe.db.sql(""" select name from `tabEL Sign Off Details` 
					where sign_off_datetime between '%s' and '%s' and customer = '%s' """
					%(date_of_first_day_of_quarter, date_of_last_day_of_quarter, cust), as_list=1)
				
				if not sign_off_details:
					msg = """Dear User, \n\n You have not Authenticated and Updated the Customer - '%s' 
							in current quarter. Please Sign Off respective customer before end of the
							current quarter. \n\n Thank You. """%(cust)
					frappe.sendmail(cust_dict[cust], subject="Sign Off Delay Notification",message=msg)
