import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime
import json


@frappe.whitelist()
def get_operational_matrix_data(customer=None):
	om_name = frappe.db.sql("""select name from `tabOperation And Project Commercial` where customer='%s' order by creation desc"""%customer,as_list=1)
	final_data = []
	if len(om_name)>0:
		for name in om_name:
			frappe.errprint(name)
			om_data = frappe.db.sql("""select * from `tabOperation And Project Commercial` where name='%s'"""%(name[0]),as_dict=1,debug=1)
			om_child_table = frappe.db.sql("""select role,user_name,email_id,contact from `tabOperation And Project Details` where parent='%s'"""%name[0],as_dict=1)
			if om_child_table:
				if len(om_child_table)>0:
					om_data[0]['child_records'] = om_child_table
				if len(om_data)>0:
					final_data.append(om_data)

	if len(final_data)>0:
		frappe.errprint(final_data)
		return {"final_data": final_data}