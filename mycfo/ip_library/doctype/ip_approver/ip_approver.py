# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import shutil
import subprocess
from frappe.utils import today, getdate
import subprocess
import shlex
import os

class IPApprover(Document):		

	def validate(self):
		if self.request_type != "Upgrade Validity" and self.approver:		# This (self.approver) condition  is to check whether the request is by EL or not.
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
		cond  = " file_status = '{0}' ".format(file_status)
		self.update_ip_file(cond)
		if not self.comment_flag and self.approver_status:
			self.init_for_add_comment(file_status)
			self.comment_flag = self.approver_status
					
	

	def process_data_before_notification(self, approver, comments):
		self.file_rejected = "Yes"
		args, email = self.get_requester_data()
		appr_fnm, appr_lstnm = frappe.db.get_value("User", {"name":approver}, ["first_name", "last_name"])
		approver_full_name = appr_fnm + "  " + appr_lstnm if appr_lstnm else ""
		args["approver"] = approver_full_name
		args["comments"] = comments
		self.send_notification("IP Document {0} Rejected".format(self.file_name), email, 
									"templates/ip_library_templates/user_notification.html",args)


	
	def send_notification(self, subject, email, template, args):
		frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))		

		
	
	def before_submit(self):
		self.validate_validity_end_date()
		self.validate_for_central_delivery()
		if self.request_type != "Upgrade Validity":
			self.check_for_edit_and_new_request()
		else:
			self.check_for_validity_upgrade()

	def validate_validity_end_date(self):
		if getdate(self.validity_end_date) < getdate(today()):
			frappe.throw("Validity End Date must be greater than Current Date.")

	def validate_for_central_delivery(self):
		if not self.central_delivery or not self.central_delivery_status:
			frappe.throw("Central delivery & Central Delivery status is mandatory to submit document.")		

	def check_for_edit_and_new_request(self):
		if self.central_delivery_status == "Approved":
			extension = "." + self.file_extension if self.file_extension else ""
			self.current_status = "Published"
			self.init_update_ip_file(extension)
			request_type = {"New":"Published", "Edit":"Republished"}
			self.init_for_add_comment(request_type.get(self.request_type))
			edited_file_path = frappe.get_site_path("public", self.file_path)
			self.validate_file_path_exists(edited_file_path)
			shutil.copy(edited_file_path, frappe.get_site_path("public", "files", "mycfo", "published_file", self.file_type, self.file_name + extension))
			self.create_compatible_odf_fromat()
			self.prepare_for_published_notification()
			frappe.msgprint("Document {0} {1} successfully.".format(self.file_name, request_type.get(self.request_type)))
			# if os.path.isfile(edited_file_path):
			# 	os.remove(edited_file_path)
		else:
			self.current_status = "Rejected by CD"
			request_type = {"New":["Rejected by CD", 0], "Edit":["Rejected by CD (Edit)", 1]}
			ip_file_cond = """ file_status = "{0}", published_flag = {1}, new_file_path = "", approver_link= "" """.format(request_type.get(self.request_type)[0], request_type.get(self.request_type)[1])
			self.update_ip_file(ip_file_cond)
			self.init_for_add_comment(request_type.get(self.request_type)[0])
			self.process_data_before_notification(self.central_delivery, self.central_delivery_comments)	

	def validate_file_path_exists(self, edited_file_path):
		if not os.path.isfile(edited_file_path):
			frappe.throw("File path not found.IP File can not be published.")


	def check_for_validity_upgrade(self):
		if self.central_delivery_status == "Approved":
			self.current_status = "Published"
			cond  = " file_status = 'Validity Upgraded', validity_end_date= '{0}', request_type = 'Upgrade Validity'  ".format(self.validity_end_date)
			self.init_for_add_comment("Validity Upgraded")
		else:
			self.current_status = "Rejected by CD"
			cond  = " file_status = 'Rejected by CD (Validity)', request_type = 'Upgrade Validity' "
			self.init_for_add_comment("Rejected by CD (Validity)")
		self.update_ip_file(cond)
		self.init_for_validity_notification()
					
	
	
	def prepare_for_published_notification(self):
		if "Central Delivery" not in frappe.get_roles(self.ip_file_requester):			# condition to check if requester is central delivery or not
			args, email = self.get_requester_data()
			self.send_notification("IP Document {0} Published".format(self.file_name), email, 
										"templates/ip_library_templates/cd_upload_notification.html",args)

	

	def get_requester_data(self):
		email, first_name, last_name = frappe.db.get_value("User", {"name":self.ip_file_requester}, ["email", "first_name", "last_name"])
		args = {"file_name":self.file_name, "first_name":first_name, "last_name":last_name}
		return args, email


	def init_update_ip_file(self, extension):
		file_path = '/'.join(["files", "mycfo", "published_file", self.file_type, self.file_name + extension])
		request_type = {"New":"Published", "Edit":"Republished"}
		file_status = request_type.get(self.request_type)
		ip_file_cond = self.get_updated_ip_file_cond(file_path, file_status)
		self.update_ip_file(ip_file_cond)

	
	def get_file_status(self):
		if self.request_type == "New":
			my_dict = {"Approved":"Approved by Approver", "Rejected":"Rejected by Approver"}	
			return my_dict.get(self.approver_status, "New Upload Pending")
		elif self.request_type == "Edit":
			my_dict = {"Approved":"Approved by Approver (Edit)", "Rejected":"Rejected by Approver (Edit)"}	
			return my_dict.get(self.approver_status, "Edit Pending")
					

	
	def get_updated_ip_file_cond(self, file_path, file_status):
		file_dict = {
			"approver_link":"",
			"new_file_path":"",
			"skill_matrix_120":frappe.db.escape(self.skill_matrix_120),
			"skill_matrix_18":frappe.db.escape(self.skill_matrix_18),
			"industry":frappe.db.escape(self.industry),
			"source":frappe.db.escape(self.source),
			"description":frappe.db.escape(self.file_description) if self.file_description else "",
			"validity_end_date":self.validity_end_date,
			"security_level":self.level_of_approval,
			"file_path":file_path,
			"file_status":file_status,
			"uploaded_date":today(),
			"published_flag":1,
			"customer":frappe.db.escape(self.customer),
			"file_approver":self.approver or "",
			"employee_name":self.employee_name
		}
		cond = ""
		cond_list  = [ "{0} = '{1}' ".format(key, value)  for key, value in file_dict.items()]
 		cond  = ','.join(cond_list)
		return cond	


	def update_ip_file(self, ip_file_cond):
		query = """ update `tabIP File` set  {0} where name = '{1}' """.format(ip_file_cond, self.ip_file)
		frappe.db.sql(query)
	

	def init_for_add_comment(self, file_status):
		comment = "File status Changed to {0} for request type {1}.".format(file_status, self.request_type)
		frappe.get_doc("IP File", self.ip_file).add_comment(comment)


	def init_for_validity_notification(self):
		template = "/templates/ip_library_templates/upgrade_validity_notification.html"
		subject = "IP Document Upgrade Validity Notification"
		file_owner = frappe.db.get_value("IP File", {"name":self.ip_file}, 'owner')
		email_recipients = frappe.db.get_values("User", {"name":["in", [self.ip_file_requester, file_owner] ]}, ["email"], as_dict=1)
		email = list(set([ recipient.get("email") for recipient in email_recipients if recipient.get("email") ] ))
		args = {"status":self.central_delivery_status, "comments":self.central_delivery_comments, "file_name":self.file_name}
		self.send_notification(subject, email, template, args)	

	def create_compatible_odf_fromat(self):
		mapper = self.get_extension_mapper()
		if self.file_extension != "zip" and self.file_extension:
			try:
				extension = mapper.get(self.file_extension, "pdf")
				viewer_path = frappe.get_site_path('/'.join(["public", "files", "mycfo", "published_file", self.file_type, self.file_name + "_viewer." + extension]))
				file_path = '/'.join(["files", "mycfo", "published_file", self.file_type, self.file_name + "." + self.file_extension])
				if self.file_extension  == "pdf":
					file_viewer_path = "assets/mycfo/ViewerJS/index.html#../../../../"  + file_path
				else:
					file_path = frappe.get_site_path("public", file_path)	
					if extension != "html":
						file_viewer_path = "assets/mycfo/ViewerJS/index.html#../../../../"  + '/'.join(["files", "mycfo", "published_file", self.file_type, self.file_name + "_viewer." + extension])
					else:
						viewer_path = frappe.get_site_path('/'.join(["public", "files", "mycfo", "published_file", self.file_type, self.file_name, self.file_name + "_viewer." + extension]))
						file_viewer_path = '/'.join(["files", "mycfo", "published_file", self.file_type, self.file_name, self.file_name + "_viewer." + extension])
						dir_path = frappe.get_site_path("public", "files", "mycfo", "published_file", self.file_type, self.file_name)
						if os.path.isdir(dir_path):
							shutil.rmtree(dir_path, ignore_errors=True)
					args = ['unoconv', '-f', str(extension) , '-T', '9', '-o', str(viewer_path), str(file_path)]
					subprocess.check_call(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)	
				self.update_ip_file(" file_viewer_path = '%s' "%file_viewer_path)	
			except Exception, e:
				frappe.throw(e)

	def get_extension_mapper(self):
		return {"gif":"pdf", "jpg":"pdf", "jpeg":"pdf", "png":"pdf", "svg":"pdf",
					"doc":"pdf", "docx":"pdf", "xls":"html", "xlsx":"html", "xlsm":"html",
					"ppt":"pdf", "pptx":"pdf", "pdf":"pdf", "txt":"pdf", "csv":"ods"}

				
			



@frappe.whitelist()
def get_central_delivery_user(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(""" 
							select  usr.name, usr.first_name
							from `tabUserRole` rol
							join `tabUser` usr
							on rol.parent = usr.name
							where rol.role = "Central Delivery"
							and usr.name != 'Administrator'
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



def get_permission_query_conditions(user):
	roles = frappe.get_roles()
	emp_name = frappe.db.get_value("Employee",{"user_id":frappe.session.user}, "name")
	if "Central Delivery" not in roles and frappe.session.user != "Administrator":
		cond = " where approver = '{0}' ".format(emp_name)
		ip_files = frappe.db.sql(""" select name from `tabIP Approver` {0} """.format(cond), as_dict=1)
		ip_files = "', '".join([ipf.get("name") for ipf in ip_files if ipf])
		return """(`tabIP Approver`.name in ('{files}') )""".format(files = ip_files)