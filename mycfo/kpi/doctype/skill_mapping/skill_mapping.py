# -*- coding: utf-8 -*-
# Copyright (c) 2015, indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import flt, getdate, nowdate, now_datetime
from frappe import msgprint, _
from frappe.utils import flt, getdate, nowdate
from datetime import date
import json

class SkillMapping(Document):
	def update_skill_mapping_details(self, args):
		self.set('skill_mapping_details', [])
		for data in args.get('data'):
			if data.get('industry')!=None:
				nl = self.append('skill_mapping_details',{})
				print data, "in dattaaaaaaaa"
				nl.skill = data.get('master_industry')
				nl.sub_skill = data.get('industry')
				nl.beginner = data.get('beginner')
				nl.imtermediatory = data.get('imtermediatory')
				nl.expert = data.get('expert')
				nl.none_field = data.get('none_field')
		self.save()
		frappe.msgprint("Skill Mapping Details Saved")

	def validate(self):
		pass

@frappe.whitelist()
def get_sample_data():
	return {
	"get_sample_data": frappe.db.sql("""select skill_matrix_18,sub_skill from `tabSkill Matrix 120` order by skill_matrix_18 asc, sub_skill asc""", as_list=1)
	}

@frappe.whitelist()
def get_sample_data_from_table(doc_name):
	return {
	"get_sample_data": frappe.db.sql("""select skill,sub_skill,none_field,beginner,imtermediatory,expert from `tabSkill Mapping Details` where parent='%s' order by skill asc, sub_skill asc"""%doc_name, as_list=1)
	}
