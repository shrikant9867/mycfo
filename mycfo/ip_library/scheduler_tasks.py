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
							where file_status in ("Published", "Republished") 
							and DATEDIFF(validity_end_date, CURDATE()) = %s and security_level != '0-Level' """,(day_diff), as_dict=1)
		send_mail(result)

		
def send_mail(result):
	subject = "IP Document Expiry Notification"
	template = "/templates/ip_library_templates/ip_library_expiry_notification.html"
	for response in result:
		first, last = frappe.db.get_value("User", {"email":response.get("owner")}, ["first_name", "last_name"])
		response["first_name"] = first
		response["last_name"] = last 
		frappe.sendmail(recipients=response.get("owner"), sender=None, subject=subject,
			message=frappe.get_template(template).render(response))


def archive_document():
	result = frappe.db.sql(""" select name,file_name, validity_end_date from `tabIP File` 
							where file_status in ("Published", "Republished") 
							and validity_end_date < CURDATE() and security_level != '0-Level' """, as_dict=1, debug=1)

	result = ','.join('"{0}"'.format(record.get("name")) for record in result if record)
	print result
	if result:
		frappe.db.sql(""" update `tabIP File` set file_status = 'Archived' 
							where name in (%s) """,(result))


