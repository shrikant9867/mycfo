from __future__ import unicode_literals
import frappe
from frappe.utils import cstr,now,add_days
import json

@frappe.whitelist()
def get_sample_data():
	# frappe.msgprint("in get sample data");
	return {
	"get_sample_data": frappe.db.sql("""select skill,sub_skill,none_field,beginner,imtermediatory,expert, parent as a,CASE WHEN skill !='' then (select employee from `tabSkill Mapping` where name=a)\
	            else null\
	       END AS Name,\
	       CASE WHEN skill !='' then (select industry from `tabSkill Mapping` where name=a)\
	            else null\
	       END AS ind\
	    from `tabSkill Mapping Details` where skill is not null order by sub_skill""", as_list=1)
	}