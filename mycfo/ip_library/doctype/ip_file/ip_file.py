# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cint
import base64
import json
import os


class IPFile(Document):
	
	def validate(self):
		self.validate_for_file_data()
		self.store_document()
		self.create_request_for_ip_approval()
		self.update_file_status()

	
	def validate_for_file_data(self):
		if not self.file_data and cint(self.get("__islocal")):
			frappe.throw("Please upload the IP document for publishing.")
		# elif not self.new_file_path and not cint(self.get("__islocal")):
		# 	frappe.throw("Please upload the IP document for publishing.")
				


	def store_document(self):
		self.create_directory()
		try:
			if self.file_data:
				print "in ip file data"
				print self.file_extension
				print self.file_data.get("file_ext")
				base64_data = self.file_data.get("file_data").encode("utf8")				
				base64_data = base64_data.split(',')[1]
				base64_data = base64.b64decode(base64_data) 
				extension = "." + self.file_extension if self.file_extension else ""
				file_path = frappe.get_site_path("public","files", "mycfo", "edited_file", self.document_type, self.file_name + extension)
				with open(file_path, "wb+") as fi_nm:
					fi_nm.write(base64_data)
				self.new_file_path = '/'.join(["files", "mycfo", "edited_file", self.document_type, self.file_name + extension])
		except Exception,e:
			print e
			print frappe.get_traceback()
			frappe.throw("File Upload Error")

			
	def create_directory(self):
		if not os.path.exists(frappe.get_site_path("public", "files", "mycfo")):
			os.makedirs(frappe.get_site_path("public", "files", "mycfo", "edited_file"))
			os.mkdir(frappe.get_site_path("public", "files", "mycfo", "published_file"))
		if not os.path.exists(frappe.get_site_path("public", "files", "mycfo", "edited_file", self.document_type)):	
			os.makedirs(frappe.get_site_path("public", "files", "mycfo", "edited_file", self.document_type))
			os.mkdir(frappe.get_site_path("public", "files", "mycfo", "published_file", self.document_type))
				

	

	def create_request_for_ip_approval(self):
		if not self.approver_link and self.file_data:
			status_dict = {"New":"New Upload Pending", "Edit":"Edit Pending"}
			ipa = frappe.new_doc("IP Approver")
			ipa.request_type = self.request_type
			ipa.file_name = self.file_name
			ipa.file_extension = self.file_extension
			ipa.file_description = self.description
			ipa.file_type = self.document_type
			ipa.project = self.project
			ipa.source = self.source
			ipa.industry = self.industry
			ipa.skill_matrix_18 = self.skill_matrix_18
			ipa.skill_matrix_120 = self.skill_matrix_120
			ipa.approver = self.file_approver
			ipa.validity_end_date = self.validity_end_date
			ipa.file_path = self.new_file_path
			ipa.ip_file_requester = frappe.session.user
			ipa.ip_file = self.name
			ipa.save(ignore_permissions=True)
			self.approver_link = ipa.name
			self.file_data = ""
			self.file_status = status_dict.get(self.request_type)
			self.prepare_for_approver_notification()
		elif self.file_data:
			status_dict = {"New":"New Upload Pending", "Edit":"Edit Pending"}
			ipa = frappe.get_doc("IP Approver", self.approver_link)		
			ipa.file_path = self.new_file_path
			ipa.save(ignore_permissions=True)
			self.file_data = ""
			self.file_status = status_dict.get(self.request_type)
			self.prepare_for_approver_notification()
		
	
	def update_file_status(self):
		pass
		# if self.approver_link:
		# 	request_type, docstatus = frappe.db.get_value("IP Approver", self.approver_link, ["request_type", "docstatus"])	
		# 	if not docstatus:
		# 		status_dict = {"New":"New Upload Pending", "Edit":"Edit Pending"}
		# 	else:
		# 		status_dict = {"New":"Published", "Edit":"Republished"}
		# 	self.file_status = status_dict.get(request_type)

	
	
	def prepare_for_approver_notification(self):
		full_name, email_id = frappe.db.get_value("Employee", self.file_approver, ["employee_name", "user_id"])
		central_delivery = frappe.get_list("UserRole", filters={"role":"Central Delivery","parent":["!=", "Administrator"]}, fields=["parent"])
		central_delivery = [user.get("parent") for user in central_delivery]
		central_delivery.append(email_id)
		self.send_mail(central_delivery)

	
	def send_mail(self, email):
		template = "/templates/ip_library_templates/approver_notification.html"
		subject = "IP Document Upload Notification"
		args = {"user_name":frappe.session.user, "file_name":self.file_name}
		frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))		





@frappe.whitelist()
def get_approver_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(""" select  distinct(opd.user_name), emp.employee_name 
								from `tabOperation And Project Details` opd
								join `tabOperation And Project Commercial` opc
								on opd.parent = opc.name
								join `tabEmployee` emp
								on  emp.name  = opd.user_name 
								where opd.role in ("EL")
								and opc.project_commercial = %(project)s
								and (emp.name like %(txt)s
								or emp.employee_name like %(txt)s)
								limit 20
	 		""", {
			'txt': "%%%s%%" % txt,
			'project':filters.get("project")}, as_list=1)
