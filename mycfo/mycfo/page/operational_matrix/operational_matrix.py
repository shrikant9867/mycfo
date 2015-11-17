import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
import datetime
import json


@frappe.whitelist()
def get_operational_matrix_data(customer=None):
	om_name = frappe.db.sql("""select * from `tabOperational Matrix` where customer='%s' order by creation desc"""%customer,as_dict=1)
	if len(om_name)>0:
		return {"final_data": om_name}