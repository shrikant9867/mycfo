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


modules = [] 	
doctypes = []
folders = []
single_type = []
docnames = []
response = []
@frappe.whitelist()
def load_address_and_contact(record,key):
	frappe.errprint(["records",record])
	# doc = json.loads(doc)
	# if doc.get('doctype') == "FFWW":
	contact_list = frappe.get_all("Contact",
			fields="*", filters={key:record})

	if len(contact_list)>0:
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


@frappe.whitelist()
def get_children():
	args = frappe.local.form_dict
	response = []
	docn = {}

	if args.get('parent') == 'Designation':
		single_types = frappe.db.sql("""Select name from `tabDesignation`""",as_dict=1)
		[response.append({"value":d["name"],"expandable":1}) for d in single_types]
		[single_type.append(d["name"]) for d in single_types]

	elif args.get('parent') in single_type:
		doctypes_list = frappe.db.sql("""Select name from `tabContact` 
			where contact_designation_='%s' """%args.get('parent'),as_dict=1)	
		[response.append({"value":d["name"],"expandable":0}) for d in doctypes_list]

	return response