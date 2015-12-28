# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
#from erpnext.utilities.address_and_contact import load_address_and_contact
import json

class FFWW(Document):
	def validate(self):
		self.validate_designation()
		self.validate_ffww()
		self.validate_duplication_emailid()
		self.validate_dupicate_designation()
		self.set_fww_name()
		if self.contact:
			self.update_contact_status()

	def on_update(self):
		# if any extra row is added in contact details child table same data will be reflected in contact doctype against same contact.
		if self.get('more_contact_details'):
			for d in self.get('more_contact_details'):
				if d.ffww == 'New FFWW 1' or self.name:
					if d.contact_name:
						contact = frappe.get_doc("Contact Details", d.contact_name)
						contact.ffww = self.name
						contact.save()
					else:
						main_contact = frappe.get_doc('Contact',self.contact)
						ch = main_contact.append('contacts', {})
						ch.contact_type = d.contact_type
						ch.country_name = d.country_name
						ch.country_code = d.country_code
						ch.mobile_no = d.mobile_no
						ch.email_id = d.email_id
						ch.landline = d.landline
						ch.ffww = self.name
						main_contact.save()
						if ch.name:
							ffww_contact = frappe.get_doc("FFWW Contact Details", d.name)
							ffww_contact.contact_name = ch.name
							ffww_contact.save()

					if d.name and d.ffww == 'New FFWW 1':
						ffww_contact = frappe.get_doc("FFWW Contact Details", d.name)
						ffww_contact.ffww = self.name
						ffww_contact.save()
					

	def validate_designation(self):
		if not self.get('designation'):
			frappe.msgprint("At least one designation must be specified in designation child table",raise_exception=1)

	def validate_ffww(self):
		if frappe.db.sql("""select name from `tabFFWW` where customer='%s' and contact='%s' and  name!='%s'"""%(self.customer,self.contact,self.name)):
			name = frappe.db.sql("""select name from `tabFFWW` where customer='%s' and contact='%s' 
							and name!='%s'"""%(self.customer,self.contact,self.name),as_list=1)
			frappe.msgprint("Customer %s already linked with contact %s in record %s"%(self.customer,self.contact,name[0][0]),raise_exception=1)

	def validate_dupicate_designation(self):
		designation_list = []
		if self.get('designation'):
			for d in self.get('designation'):
				if d.designation not in designation_list:
					designation_list.append(d.designation)
				else:
					frappe.msgprint("Duplicate designation name is not allowed",raise_exception=1)
					break

	def validate_duplication_emailid(self):
		email_list = []
		if self.get('more_contact_details'):
			for d in self.get('more_contact_details'):
				if d.email_id not in email_list:
					email_list.append(d.email_id)
				else:
					frappe.msgprint("Duplicate Email ID is not allowed",raise_exception=1)
					break

	def update_contact_status(self):
		contact = frappe.get_doc('Contact',self.contact)
		contact.status = 'Active'
		contact.save()

	def set_fww_name(self):
		self.ffww_record = self.name

	def clear_child_table(self):
		self.set('more_contact_details', [])

# Create address............................................
@frappe.whitelist()
def make_address(source_name, target_doc=None):
	return _make_address(source_name, target_doc)

def _make_address(source_name, target_doc=None, ignore_permissions=False):
	def set_missing_values(source, target):
		pass

	doclist = get_mapped_doc("FFWW", source_name,
		{"FFWW": {
			"doctype": "Address",
			"field_map": {
				"contact": "contact"
				# "company_name": "customer_name",
				# "contact_no": "phone_1",
				# "fax": "fax_1"
			}
		}}, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

	return doclist

@frappe.whitelist()
def make_contact(contact=None):
	contact_details = []
	contact_details = frappe.db.get_values('Contact Details',{'parent':contact},['contact_type','email_id','mobile_no','country_code','ffww','name','country_name'])
	if len(contact_details)>0:
		return contact_details
	else:
		return contact_details

def get_active_customers(doctype, txt, searchfield, start, page_len, filters):
	from frappe.desk.reportview import get_match_cond
	txt = "%{}%".format(txt)
	return frappe.db.sql("""select distinct customer
		from `tabProject Commercial`
		where docstatus < 2
		and customer is not null
			and project_status='Active'""")