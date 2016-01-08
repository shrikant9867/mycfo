# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import shutil
import subprocess
from frappe.utils import today

class IPApprover(Document):
	
	
	def validate(self):
		pass


	def on_update(self):
		self.check_if_file_rejected()
		self.set_current_status_of_approval()
		self.update_ip_file_status()

	
	def check_if_file_rejected(self):
		if self.approver_status == "Rejected" and self.file_rejected != "Yes":
			approver = frappe.db.get_value("Employee", self.approver, ["user_id"])
			self.process_data_before_notification(approver, self.approver_comments)		

	
	def set_current_status_of_approval(self):
		if self.approver_status == "Approved":
			self.current_status = "Approved by Approver"
		elif self.approver_status == "Rejected":
			self.current_status = "Rejected by Approver"

	
	def update_ip_file_status(self):
		file_status = self.get_file_status()
		self.update_ip_file({"file_status":file_status})
					
	

	def process_data_before_notification(self, approver, comments):
		self.file_rejected = "Yes"
		args, email = self.get_requester_data()
		appr_fnm, appr_lstnm = frappe.db.get_value("User", {"name":approver}, ["first_name", "last_name"])
		approver_full_name = appr_fnm + "  " + appr_lstnm if appr_lstnm else ""
		args["approver"] = approver_full_name
		args["comments"] = comments
		self.send_notification("IP Docuemnt {0} Rejected".format(self.file_name), email, 
									"templates/ip_library_templates/user_notification.html",args)


	
	def send_notification(self, subject, email, template, args):
		frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))		

		
	
	def before_submit(self):
		if self.central_delivery_status == "Approved":
			extension = "." + self.file_extension if self.file_extension else ""	 
			shutil.move(frappe.get_site_path("public", self.file_path), frappe.get_site_path("public", "files", "mycfo", "published_file", self.file_type, self.file_name + extension))
			self.prepare_for_published_notification()
			self.current_status = "Published"
			self.init_update_ip_file(extension)
			request_type = {"New":"Published", "Edit":"Republished"}
			frappe.msgprint("Document {0} {1} successfully.".format(self.file_name, request_type.get(self.request_type)))	
		else:
			self.process_data_before_notification(self.central_delivery, self.central_delivery_comments)
			self.current_status = "Rejected by CD"
			self.update_ip_file({"file_status":"Rejected by CD"})	
	
	
	
	def prepare_for_published_notification(self):
		args, email = self.get_requester_data()
		self.send_notification("IP Docuemnt {0} Published".format(self.file_name), email, 
									"templates/ip_library_templates/cd_upload_notification.html",args)

	

	def get_requester_data(self):
		email, first_name, last_name = frappe.db.get_value("User", {"name":self.ip_file_requester}, ["email", "first_name", "last_name"])
		args = {"file_name":self.file_name, "first_name":first_name, "last_name":last_name}
		return args, email


	def init_update_ip_file(self, extension):
		file_path = '/'.join(["files", "mycfo", "published_file", self.file_type, self.file_name + extension])
		new_path = ""
		request_type = {"New":"Published", "Edit":"Republished"}
		file_status = request_type.get(self.request_type)
		ip_file_dict = self.get_updated_ip_file_dict(file_path, file_status)
		self.update_ip_file(ip_file_dict)
		# frappe.db.sql(""" update `tabIP File` set 
		# 					approver_link = "", file_path = %s, new_file_path = "", 
		# 					validity_end_date = %s, file_status = %s , security_level = %s, 
		# 					uploaded_date = %s where name = %s """, 
		# 					(file_path, self.validity_end_date, request_type.get(self.request_type), self.level_of_approval, today(), self.ip_file))

	
	def get_file_status(self):
		if self.request_type == "New":
			return self.approver_status if self.approver_status else "New Upload Pending"
		else:
			my_dict = {"Approved":"Approved by Approver (Edit)", "Rejected":"Rejected by Approver (Edit)"}	
			return my_dict.get(self.approver_status, "Edit Pending")	

	def get_updated_ip_file_dict(self, file_path, file_status):
		return {
			"approver_link":""
			"new_file_path":""
			"skill_matrix_120":self.skill_matrix_120
			"skill_matrix_18":self.skill_matrix_18
			"industry":self.industry
			"project":self.project
			"source":self.source
			"description":self.file_description
			"validity_end_date":self.validity_end_date
			"security_level":self.level_of_approval
			"file_path":file_path
			"file_status":file_status
			"uploaded_date":today()

		}


	def update_ip_file(self, ip_file_dict):
		ipf = frappe.get_doc("IP File", self.ip_file)
		ipf.update(ip_file_dict)
		ipf.save()		
	

	# def create_document_thumbnail(self):
	# 	try:
	# 		self.create_directory()
	# 		subprocess.check_call("unoconv -f pdf {0}  {1}".
	# 									format(frappe.get_site_path("public", "files", "mycfo", "mycfo_thumbnails"),
	# 											frappe.get_site_path("public", self.file_path)))
	# 		file_name = self.get_file_name("pdf")
	# 		image_filename = self.get_file_name("jpg")
	# 		with Image(filename=frappe.get_site_path("public", "files", "mycfo", "mycfo_thumbnails", filename)) as img:
	# 			img.save(filename = frappe.get_site_path("public", "files", "mycfo", "mycfo_thumbnails", image_filename))
	# 	except Exception,e:
	# 		pass	

	# def get_file_name(self, extension):
	# 	file_name = self.filename.split('.')
	# 	filename[-1] = extension
	# 	filename = '.'.join(filename)
	# 	return filename
				

	# def create_directory(self):
	# 	if not os.path.exists(frappe.get_site_path("public", "files", "mycfo", "mycfo_thumbnails")):
	# 		os.mkdir(frappe.get_site_path("public", "files", "mycfo", "mycfo_thumbnails"))






@frappe.whitelist()
def get_central_delivery_user(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(""" 
							select  usr.name, usr.first_name
							from `tabUserRole` rol
							join `tabUser` usr
							on rol.parent = usr.name
							where rol.role = "Central Delivery"
							and (usr.name like %(txt)s
								or usr.first_name like %(txt)s)
							limit 20

			""",{'txt': "%%%s%%" % txt})

@frappe.whitelist()
def get_user_with_el_roles(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql("""  
							select
							distinct emp.name, emp.employee_name
							from `tabOperation And Project Commercial` opc
							join `tabOperation And Project Details` opd
							on opd.parent = opc.name
							join `tabEmployee` emp
							on emp.name = opd.user_name
							and opd.role = "EL"
							and  project_commercial = %(project)s
							and (emp.name like %(txt)s
								 or emp.employee_name like %(txt)s )
							limit 20 """, {"project":filters.get("project_id"), "txt": "%%%s%%" % txt})
