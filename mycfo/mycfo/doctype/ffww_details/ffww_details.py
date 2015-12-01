# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class FFWWDetails(Document):
	pass



modules = [] 	
doctypes = []
folders = []
single_type = []
parent_list = []
docnames = []
response = []

@frappe.whitelist()
def load_address_and_contact(record,key,key1,customer):
	ffww = frappe.db.get_value('FFWW',{'contact':record,'customer':customer},'name')

	contact_details = frappe.db.sql("""select contact_type,email_id,mobile_no from `tabContact Details` where 
									parent='%s' and ffww='%s'"""%(record,ffww),as_dict=1)
	personal_emailid = []
	personal_mobileno = []
	official_emailid = []
	official_mobileno = []

	if len(contact_details)>0:
		for i in contact_details:
			if i['contact_type'] == 'Personal':
				personal_emailid.append(i['email_id'])
				personal_mobileno.append(i['mobile_no'])
			else:
				official_emailid.append(i['email_id'])
				official_mobileno.append(i['mobile_no'])


	contact_list = frappe.get_all("Contact",
			fields="*", filters={key:record})

	from erpnext.utilities.doctype.address.address import get_address_display

	
	if ffww:
		addr_list = [a.update({"display": get_address_display(a)}) \
			for a in frappe.get_all("Address",
				fields="*", filters={key1: record,'ffww_record':ffww},
				order_by="is_primary_address desc, modified desc")]

	if len(contact_list)>0:
		contact_list[0].update({'personal_emailid':personal_emailid})
		contact_list[0].update({'personal_mobileno':personal_mobileno})
		contact_list[0].update({'official_emailid':official_emailid})
		contact_list[0].update({'official_mobileno':official_mobileno})
		args = {'contact_list':contact_list}
	else:
		args = {'contact_list':''}

	if len(addr_list)>0:
		#args = {'address_list':address_list}
		args['addr_list'] =  addr_list
	else:
		args['addr_list'] = ''

	if args:
		return args


@frappe.whitelist()
def load_operational_data(doc,key):
	doc = json.loads(doc)
	if doc.get('doctype') == "Operational Matrix Details":
		operational_matrix_list = frappe.get_all("Operational Matrix",
			fields="*", filters={key: doc.get('customer')})

		args = {'operational_matrix_list':operational_matrix_list}
		return args


@frappe.whitelist()
def get_children():
	args = frappe.local.form_dict
	response = []
	final_response = []
	docn = {}


	if args.get('parent') == 'Category':
		single_types = frappe.db.sql("""Select distinct name from `tabCategory` where is_child=0""",as_dict=1)
		[response.append({"value":d["name"],"expandable":1,"type":"Parent"}) for d in single_types]
		[single_type.append(d["name"]) for d in single_types]


	elif args.get('parent') in single_type:
		child_list = frappe.db.sql("""select distinct contact from `tabFFWW` where customer = '%s' and name in (select parent from `tabFFWW Designation` where designation='%s')"""%(args['customer'],args.get('parent')),as_dict=1)	
		child_name = frappe.db.sql("""select name from `tabCategory` where is_child=1 and parent_category='%s'"""%args.get('parent'),as_dict=1)
		[response.append({"value":d["contact"],"expandable":0,"type":"contact"}) for d in child_list]
		[response.append({"value":i["name"],"expandable":1,"type":"child"}) for i in child_name]
		[doctypes.append(d["name"]) for d in child_name]


	elif args.get('parent') in doctypes:
		doctypes_list = frappe.db.sql("""select distinct contact from `tabFFWW` where customer = '%s' and name in (select parent from `tabFFWW Designation` where designation='%s')"""%(args['customer'],args.get('parent')),as_dict=1)	
		[response.append({"value":d["contact"],"expandable":0,"type":"contact"}) for d in doctypes_list]
	

	return response