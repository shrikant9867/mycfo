import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, cstr, flt, now, getdate, add_months
from frappe.model.mapper import get_mapped_doc
import datetime
import json


@frappe.whitelist()
def get_operational_matrix_data(customer=None):
	om_name = frappe.db.sql("""select name from `tabOperation And Project Commercial` where customer='%s' and operational_matrix_status='Active' order by creation desc"""%customer,as_list=1)
	final_data = []
	if len(om_name)>0:
		for name in om_name:
			om_data = frappe.db.sql("""select * from `tabOperation And Project Commercial` where name='%s'"""%(name[0]),as_dict=1)
			om_child_table = frappe.db.sql("""select role,user_name,email_id,contact from `tabOperation And Project Details` where parent='%s'"""%name[0],as_dict=1)
			if om_child_table:
				if len(om_child_table)>0:
					om_data[0]['child_records'] = om_child_table
				else:
					final_data.append(om_data)
				if len(om_data)>0:
					final_data.append(om_data)
			else:
				final_data.append(om_data)

	else:
		return {"final_data": final_data}
	if len(final_data)>0:
		return {"final_data": final_data}

@frappe.whitelist()
def get_operational_matrix_details(customer=None,operational_matrix=None,target_doc=None,ignore_permissions=False):
	if not frappe.db.get_value("Operation And Project Commercial",{'operational_id':operational_matrix,'customer':customer},'name'):
		doclist = get_mapped_doc("Operational Matrix", operational_matrix, {
				"Operational Matrix": {
					"doctype": "Operation And Project Commercial"
				},
				"Operation Details": {
					"doctype": "Operation And Project Details",
				}
			}, target_doc, ignore_permissions=ignore_permissions)

		doclist.customer = customer
		doclist.save(ignore_permissions)

	elif frappe.db.get_value("Operation And Project Commercial",{'operational_id':operational_matrix,'customer':customer,'operational_matrix_status':'Deactive'},'name'):
		name = frappe.db.get_value("Operation And Project Commercial",{'operational_id':operational_matrix,'customer':customer,'operational_matrix_status':'Deactive'},'name')
		frappe.db.sql("""update `tabOperation And Project Commercial` set operational_matrix_status='Active'
						where name='%s'"""%name)
		frappe.db.commit()
		frappe.msgprint("Specified operation matrix '%s' is get linked  to customer '%s' please check below records."%(operational_matrix,customer))
	else:
		frappe.msgprint("Specified operation matrix '%s' is already linked to customer '%s'."%(operational_matrix,customer))

	last_final_data = get_operational_matrix_data(customer)
	return {"final_data": last_final_data['final_data']}

@frappe.whitelist()
def get_filtered_data(customer=None,operational_matrix=None):
	om_name = frappe.db.sql("""select name from `tabOperation And Project Commercial`  where operational_matrix_status='Active' and  %s """
		%get_item_conditions(customer,operational_matrix),as_list=1)
	final_data = []
	if len(om_name)>0:
		for name in om_name:
			om_data = frappe.db.sql("""select * from `tabOperation And Project Commercial` where name='%s'"""%(name[0]),as_dict=1)
			om_child_table = frappe.db.sql("""select role,user_name,email_id,contact from `tabOperation And Project Details` where parent='%s'"""%name[0],as_dict=1)
			if om_child_table:
				if len(om_child_table)>0:
					om_data[0]['child_records'] = om_child_table
				else:
					final_data.append(om_data)
				if len(om_data)>0:
					final_data.append(om_data)
			else:
				final_data.append(om_data)

	if len(final_data)>0:
		return {"final_data": final_data}
	
def get_item_conditions(customer,operational_matrix):
	conditions = []
	if customer:
		conditions.append("customer='{0}'".format(customer))
	if operational_matrix:
		conditions.append("operational_id='{0}'".format(operational_matrix))

	return "  "+" and ".join(conditions) if conditions else ""



@frappe.whitelist()
def deactivate_records(operational_record=None,customer=None):
	if operational_record:
		frappe.db.sql("""update `tabOperation And Project Commercial` set operational_matrix_status='Deactive'
						where name='%s'"""%operational_record)
		frappe.db.commit()
	if customer:
		last_final_data = get_operational_matrix_data(customer)
		if last_final_data:
			return {"final_data": last_final_data['final_data']}
		else:
			return None

@frappe.whitelist()
def get_operational_matrix(operational_matrix=None):
	om_child_table = frappe.db.sql("""select role,user_name,email_id,contact from `tabOperation Details` where parent='%s'"""%operational_matrix,as_dict=1)
	if len(om_child_table)>0:
		return {'final_data': om_child_table}

@frappe.whitelist()
def get_unlinked_operation_matrix(doctype, txt, searchfield, start, page_len, filters):
	return 	frappe.db.sql("""  select om.name, om.operational_matrix_title 
						from `tabOperational Matrix` om 
						where om.name not in ( select operational_id from 
											`tabOperation And Project Commercial` 
											where operational_matrix_status = 'Active' and customer = %(customer)s  ) 
						and ( om.name like %(txt)s or  om.operational_matrix_title like %(txt)s ) limit 20 """,
						{ 'txt': "%%%s%%" % txt, 'customer':filters.get("customer") } ,as_list=1 )
