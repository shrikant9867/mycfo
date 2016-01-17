from __future__ import unicode_literals
from frappe.utils import now, today
import frappe



def update_ip_download_approval_status():
	sub_query = """ select name from `tabIP Download Approval` 
						where docstatus=1 and validity_end_date <= '{0}' """.format(now())

	response = frappe.db.sql(sub_query, as_list=1)
	ipd_name = ','.join('"{0}"'.format(record[0]) for record in response if record)
	if ipd_name:
		query = """  update `tabIP Download Approval`  
							set validity_end_date = null , approval_status = 'Expired', 
							modified = '{0}'   
			where name in ({1}) """.format(now(), ipd_name)
		frappe.db.sql(query)

def send_notification_for_expiry_of_document():
	for day_diff in [7, 3]:
		result = frappe.db.sql(""" select name, owner, file_name, validity_end_date from `tabIP File` 
							where published_flag = 1 
							and DATEDIFF(validity_end_date, CURDATE()) = %s  """,(day_diff), as_dict=1)
		send_mail(result)

		
def send_mail(result):
	subject = "IP Document Expiry Notification"
	template = "/templates/ip_library_templates/ip_library_expiry_notification.html"
	central_delivery = get_central_delivery()
	for response in result:
		first, last = frappe.db.get_value("User", {"email":response.get("owner")}, ["first_name", "last_name"])
		response["first_name"] = first
		response["last_name"] = last 
		frappe.sendmail(recipients=response.get("owner"), sender=None, subject=subject,
			message=frappe.get_template(template).render(response), cc=central_delivery)

def get_central_delivery():
	central_delivery = frappe.get_list("UserRole", filters={"role":"Central Delivery","parent":["!=", "Administrator"]}, fields=["parent"])
	central_delivery = [user.get("parent") for user in central_delivery]
	return central_delivery	

def archive_document():
	result = frappe.db.sql(""" select name,file_name, validity_end_date from `tabIP File` 
							where published_flag = 1 
							and validity_end_date < CURDATE() """, as_dict=1)

	result = ','.join('"{0}"'.format(record.get("name")) for record in result if record)
	if result:
		query = """ update `tabIP File` set file_status = 'Archived', published_flag = 0 
							where name in ({0}) """.format(result)
		frappe.db.sql(query)


