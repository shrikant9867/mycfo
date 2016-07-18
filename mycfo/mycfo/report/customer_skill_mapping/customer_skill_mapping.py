# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _


def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_data(filters)
	return columns, data



def get_data(filters):
	result = []
	result = frappe.db.sql("""  select skmt.skill_matrix_18, skmt.name as skill_matrix_120, 
							sum(smd.none_field) as none_field, sum(smd.beginner) as beginner, sum(smd.imtermediatory) as intermediatory, sum(smd.expert) as expert  
							from `tabSkill Matrix 120` skmt
							join `tabSkill Mapping Details` smd 
							on skmt.name = smd.sub_skill 
							and smd.parenttype = "Customer Skill Mapping"
							group by skmt.name order by skmt.skill_matrix_18 """, as_list=1)
	return result

def get_columns():
	return [
		_("Skill Matrix 18") + ":Link/:200",
		_("Skill Matrix 120") + ":Link/:300",
		_("None") + ":Int:100",
		_("Beginner") + ":Int:100",
		_("Intermediatory") + ":Int:100",
		_("Expert") + ":Int:100"		
	]