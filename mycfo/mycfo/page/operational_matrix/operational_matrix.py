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
def get_operational_matrix_details(customer=None,project_id=None,operational_matrix=None,target_doc=None,ignore_permissions=False):
	if not frappe.db.get_value("Operation And Project Commercial",{'project_commercial':project_id,'operational_id':operational_matrix,'customer':customer},'name'):
		doclist = get_mapped_doc("Operational Matrix", operational_matrix, {
				"Operational Matrix": {
					"doctype": "Operation And Project Commercial"
				},
				"Operation Details": {
					"doctype": "Operation And Project Details",
				}
			}, target_doc, ignore_permissions=ignore_permissions)

		doclist.project_commercial = project_id
		doclist.customer = customer
		doclist.save(ignore_permissions)

	elif frappe.db.get_value("Operation And Project Commercial",{'project_commercial':project_id,'operational_id':operational_matrix,'customer':customer,'operational_matrix_status':'Deactive'},'name'):
		name = frappe.db.get_value("Operation And Project Commercial",{'project_commercial':project_id,'operational_id':operational_matrix,'customer':customer,'operational_matrix_status':'Deactive'},'name')
		frappe.db.sql("""update `tabOperation And Project Commercial` set operational_matrix_status='Active'
						where name='%s'"""%name)
		frappe.db.commit()
		frappe.msgprint("Specified operation matrix '%s' is get linked for  project id '%s' and customer '%s' please check below records."%(operational_matrix,project_id,customer))
	else:
		frappe.msgprint("Specified operation matrix '%s' is already linked for  project id '%s' and customer '%s'."%(operational_matrix,project_id,customer))

	last_final_data = get_operational_matrix_data(customer)
	return {"final_data": last_final_data['final_data']}

@frappe.whitelist()
def get_filtered_data(customer=None,project_id=None,operational_matrix=None):
	om_name = frappe.db.sql("""select name from `tabOperation And Project Commercial`  where operational_matrix_status='Active' and  %s """
		%get_item_conditions(customer,project_id,operational_matrix),as_list=1,debug=1)
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
	
def get_item_conditions(customer,project_id,operational_matrix):
	conditions = []
	if customer:
		conditions.append("customer='{0}'".format(customer))
	if project_id:
		conditions.append("project_commercial='{0}'".format(project_id))
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

