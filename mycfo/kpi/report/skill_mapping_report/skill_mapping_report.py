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
	result = frappe.db.sql("""
							select tmp.skill_matrix_18, tmp.skill_matrix_120,
							tmp.total_skill, tmp.sum_total_skill, (tmp.sum_total_skill / tmp.total_skill) as average_Skill 
							from (
									select skmt.skill_matrix_18, skmt.name as skill_matrix_120,
									count(smd.name) as total_skill,
									( sum(smd.beginner) * 1 + sum(smd.imtermediatory) * 2 + sum(smd.expert) * 3) as sum_total_skill
									from `tabSkill Matrix 120` skmt
									join `tabSkill Mapping Details` smd 
									on skmt.name = smd.sub_skill 
									and smd.parenttype = "Skill Mapping"
									group by skmt.name order by skmt.skill_matrix_18    ) as tmp """, as_list=1)
	return result

def get_columns():
	return [
		_("Skill Matrix 18") + ":Link/:200",
		_("Skill Matrix 120") + ":Link/:300",
		_("Count of Total Skill") + ":Int:150",
		_("Sum of Total Skill") + ":Int:150",
		_("Average Total Skill") + ":Float:150"		
	] 
