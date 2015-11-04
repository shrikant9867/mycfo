# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from erpnext.utilities.address_and_contact import load_address_and_contact
import json

class FFWW(Document):
	pass	

@frappe.whitelist()
def load_address_and_contact(doc,key):
	doc = json.loads(doc)
	if doc.get('doctype') == "FFWW":
		contact_list = frappe.get_all("Contact",
			fields="*", filters={key: doc.get('customer')})

		args = {'contact_list':contact_list}
		frappe.errprint(args)
		return args


@frappe.whitelist()
def load_operational_data(doc,key):
	doc = json.loads(doc)
	if doc.get('doctype') == "Operational Matrix Details":
		operational_matrix_list = frappe.get_all("Operational Matrix",
			fields="*", filters={key: doc.get('customer')})

		args = {'operational_matrix_list':operational_matrix_list}
		frappe.errprint(args)
		return args