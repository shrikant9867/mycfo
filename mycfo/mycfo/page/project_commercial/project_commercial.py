import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime
import json

@frappe.whitelist()
def get_project_commercial_data(customer=None):
	pc_name = frappe.db.sql("""select name from `tabProject Commercial` where customer='%s' order by creation desc"""%customer,as_list=1)
	final_data = []
	if len(pc_name)>0:
		for name in pc_name:
			pc_data = frappe.db.sql("""select * from `tabProject Commercial` where name='%s'"""%(name[0]),as_dict=1,debug=1)

			pc_child_table = frappe.db.sql("""select amount,due_date from `tabBillings` where parent='%s'"""%name[0],as_dict=1)
			if pc_child_table:
				if len(pc_child_table)>0:
					pc_data[0]['child_records'] = pc_child_table
			if len(pc_data)>0:
				final_data.append(pc_data)

	if len(final_data)>0:
		return {"final_data": final_data}
