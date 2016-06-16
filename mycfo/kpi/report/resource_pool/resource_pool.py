# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt

def execute(filters=None):
	columns, data = [], []
	columns = get_colums()
	data = get_data(filters)
	return columns, data

def get_data(filters):
	if 1==1:
		result = frappe.db.sql("""select emp,skill,sub_skill,
			none_field,beginner,imtermediatory,expert,emp_status
			  from (select 
			CASE WHEN skill !='' then (select employee_name from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)\
			    else null\
			END AS emp,\
			CASE WHEN skill !='' then (select industry from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)\
			    else null\
			END AS ind,\
			skill,sub_skill,none_field,beginner,imtermediatory,expert,
			CASE WHEN skill !='' then (select employee from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)\
			    else null\
			END AS emp_s,
			CASE WHEN skill !='' then (select status from `tabEmployee` where name=emp_s)\
			    else null\
			END AS emp_status\

		from `tabSkill Mapping Details` where skill is not null) as innerTable order by emp,skill,sub_skill""",as_list=1,debug=1)
	
		# result.append([])
		# result.append(["Total Item",str(total_item[0][0])])
		final_result_active = []
		final_result_left = []

		for i in result:
			if i[7] == "Active":
				final_result_active.append(i)
			if i[7] == "Left":
				final_result_left.append(i)

		if filters.get("status") == "Active":
			return final_result_active
		elif filters.get("status") == "Left":
			return final_result_left
		# return final_result
	else:
		final_result = []
		return final_result	

def get_total_item():
	return "11"

def  get_colums():
	columns = ["Employee::120"]+["Skill Matrix 18::165"]+ ["Skill Matrix 120::265"] +["None::130"]\
		+["Beginner::130"]+ ["Intermediatory::130"] +["Expert::130"] + ["Employee Status::130"] 
	return columns



# elif filters.get("status") == "Left":
	# 	print filters.get("status")
	# 	print "in left"
	# 	result = frappe.db.sql("""select * from (select 
	# 		CASE WHEN skill !='' then (select employee_name from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)
	# 		else "" END AS emp,
	# 		CASE WHEN skill !='' then (select industry from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)
	# 		else "" 
	# 		END AS ind,
	# 		skill as "Skill Matrix 18::140",
	# 		sub_skill as "Skill Matrix 120::150",
	# 		none_field as "None::130",
	# 		beginner as "Beginner::130",
	# 		imtermediatory as "Intermediatory::130",
	# 		expert as "Expert::130",
	# 		CASE WHEN skill !='' then (select employee from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)
	# 		else "null"
	# 		END AS emp_s,
	# 		CASE WHEN skill !='' then (select status from `tabEmployee` where name=emp_s)
	# 		else "null"
	# 		END AS emp_status
	# 	from `tabSkill Mapping Details` where skill is not null
	# 	order by sub_skill) as innerTable where emp_status = 'Left'""",as_list=1,debug=1)
	
	# if filters.get("status") == "Left":
	# 	result = frappe.db.sql("""select * from (select 
	# 		CASE WHEN skill !='' then (select employee_name from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)\
	# 		    else null\
	# 		END AS emp,\
	# 		CASE WHEN skill !='' then (select industry from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)\
	# 		    else null\
	# 		END AS ind,\
	# 		skill as "Skill Matrix 18::140",
	# 		sub_skill as "Skill Matrix 120::150",
	# 		none_field as "None::130",
	# 		beginner as "Beginner::130",
	# 		imtermediatory as "Intermediatory::130",
	# 		expert as "Expert::130",
	# 		CASE WHEN skill !='' then (select employee from `tabSkill Mapping` where name=`tabSkill Mapping Details`.parent)\
	# 		    else null\
	# 		END AS emp_s,\
	# 		CASE WHEN skill !='' then (select status from `tabEmployee` where name=emp_s)\
	# 		    else null\
	# 		END AS emp_status
	#     from `tabSkill Mapping Details` where skill is not null
	#     order by sub_skill) as innerTable where emp_status = 'Left'""",as_list=1,debug=1)
		# result = frappe.db.sql("""select 
		#     item_code "Item:Link/Item:150",
		#     inventory_maintained_by as "Inventory Maintained By::100",
		#     c_barcode as "Barcode::100",
		#     shortcode as "Shortcode::100",
		#     category as "Category::120",
		#     sub_category as "Sub Category::120",
		#     brand as "Brand::80",
		#     c.mrp as "MRP:Currency:100",
		#     c.retail_rate as "Retail Price:Currency:100",
		#     c.wholesale_rate as "Wholesale Price:Currency:100"
		# 	from
		#  `tabItem`b LEFT JOIN `tabItem Master Rate`c ON c.parent=b.name
		# order by item_code""",as_list=1,debug=1)
# def get_conditions(filters):
# 	cond = ''
# 	if filters.get('checklist_requisition') and filters.get('status') and filters.get('user'):
# 		cond = "where project = '{0}' and status = '{1}' and user = '{2}'".format(filters.get('checklist_requisition'),filters.get('status'),filters.get('user'))

# 	elif filters.get('checklist_requisition') and filters.get('status'):
# 		cond = "where project = '{0}' and status = '{1}'".format(filters.get('checklist_requisition'),filters.get('status'))

# 	elif filters.get('checklist_requisition') and filters.get('user'):
# 		cond = "where project = '{0}' and user = '{1}'".format(filters.get('checklist_requisition'),filters.get('user'))

# 	elif filters.get('status') and filters.get('user'):
# 		cond = "where status = '{0}' and user = '{1}'".format(filters.get('status'),filters.get('user'))

# 	elif filters.get('user'):
# 		cond = "where user = '{0}'".format(filters.get('user'))

# 	elif filters.get('checklist_requisition'):
# 		cond = "where project = '{0}' ".format(filters.get("checklist_requisition"))

# 	elif filters.get('status'):
# 		cond = "where status='{0}'".format(filters.get("status"))	
# 	return cond