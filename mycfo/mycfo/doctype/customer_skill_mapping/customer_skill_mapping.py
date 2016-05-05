# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from mycfo.kpi.doctype.skill_mapping.skill_mapping import get_sample_data

class CustomerSkillMapping(Document):
	
	def update_skill_mapping_details(self, args):
		self.set('skill_mapping_details', [])
		for data in args.get('data'):
			if data.get('industry')!=None:
				smd = self.append('skill_mapping_details',{})
				smd.skill = data.get('master_industry')
				smd.sub_skill = data.get('industry')
				smd.beginner = data.get('beginner')
				smd.imtermediatory = data.get('imtermediatory')
				smd.expert = data.get('expert')
				smd.none_field = data.get('none_field')
		self.save()

	def before_insert(self):
		skill_data = get_sample_data()
		for data in skill_data.get("get_sample_data"):
			smd = self.append('skill_mapping_details',{})
			smd.skill = data[0]
			smd.sub_skill = data[1]


@frappe.whitelist()
def get_sample_data_from_table(doc_name):
	return {
		"get_sample_data": frappe.db.sql("""select skill,sub_skill,none_field,beginner,imtermediatory,expert from `tabSkill Mapping Details` where parent='%s' order by skill asc, sub_skill asc"""%doc_name, as_list=1)
	}


@frappe.whitelist()
def get_customer_skill_mapping(customer, group, segment):
	if frappe.db.get_value("Customer Skill Mapping", customer, "name"):
		csm = frappe.get_doc("Customer Skill Mapping", customer)
	else:
		csm = frappe.new_doc("Customer Skill Mapping")
		csm.customer = customer
		csm.customer_group = group
		csm.customer_segment = segment
	return csm.as_dict()