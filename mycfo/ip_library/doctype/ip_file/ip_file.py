# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cint , getdate
import base64
import json
import os
from mycfo.mycfo_utils import get_central_delivery


class IPFile(Document):
	
	def validate(self):
		self.validate_for_duplicate_file_name()
		self.validity_for_cd_users()
		self.validate_for_file_data()
		self.store_document()
		self.create_request_for_ip_approval()

	def validate_for_duplicate_file_name(self):
		if cint(self.get("__islocal")):
			if frappe.db.get_value("IP File", {"name":self.file_name}, "name"):
				frappe.throw("Ip File with same name already exists.")
			

	def validity_for_cd_users(self):
		if not len(get_central_delivery()):		
			frappe.throw("There are no Central Delivery users in system.Please upload IP File later.")
	

	def init_for_add_comment(self):
		self.add_comment("File status Changed to {0} for request_type {1}".format(self.file_status, self.request_type))	

	
	def validate_for_file_data(self):
		if not self.file_data and cint(self.get("__islocal")):
			frappe.throw("Please upload the IP document for publishing.")
				

	def store_document(self):
		self.create_directory()
		try:
			if self.file_data and self.request_type not in ["Archive", "Upgrade Validity"]:
				base64_data = self.file_data.get("file_data").encode("utf8")				
				base64_data = base64_data.split(',')[1]
				base64_data = base64.b64decode(base64_data) 
				extension = "." + self.file_extension if self.file_extension else ""
				file_path = frappe.get_site_path("public","files", "mycfo", "edited_file", self.document_type, self.file_name + extension)
				with open(file_path, "wb+") as fi_nm:
					fi_nm.write(base64_data)
				self.new_file_path = '/'.join(["files", "mycfo", "edited_file", self.document_type, self.file_name + extension])
		except Exception,e:
			frappe.throw("File Upload Error")

			
	def create_directory(self):
		if not os.path.exists(frappe.get_site_path("public", "files", "mycfo")):
			os.makedirs(frappe.get_site_path("public", "files", "mycfo", "edited_file"))
			os.mkdir(frappe.get_site_path("public", "files", "mycfo", "published_file"))
		if not os.path.exists(frappe.get_site_path("public", "files", "mycfo", "edited_file", self.document_type)):	
			os.makedirs(frappe.get_site_path("public", "files", "mycfo", "edited_file", self.document_type))
			os.mkdir(frappe.get_site_path("public", "files", "mycfo", "published_file", self.document_type))
				

	

	def create_request_for_ip_approval(self):
		status_dict = {"New":"New Upload Pending", "Edit":"Edit Pending"}
		if not self.approver_link and self.file_data and self.request_type not in ["Archive", "Upgrade Validity"]:
			ipa = self.create_ip_approver_form(self.validity_end_date, self.new_file_path)
			self.approver_link = ipa.name
			self.file_status = status_dict.get(self.request_type)
			self.prepare_for_approver_notification()
			self.init_for_add_comment()
		elif self.file_data and self.approver_link:
			ipa = frappe.get_doc("IP Approver", self.approver_link)		
			ipa.file_path = self.new_file_path
			ipa.save(ignore_permissions=True)
			self.file_status = status_dict.get(self.request_type)
			self.init_for_add_comment()
			self.prepare_for_approver_notification()
		self.file_data = ""

		
	
	def init_for_validity_upgradation(self):
		self.request_type = "Upgrade Validity"
		validity = getdate(self.new_validity)
		self.create_ip_approver_form(validity, self.file_path)
		self.file_status = "Upgrade Validity Pending"
		self.new_validity = ""
		self.init_for_add_comment()
		self.prepare_for_cd_notification()
		self.save()		

	
	def create_ip_approver_form(self, validity_end_date, file_path):
		ipa = frappe.new_doc("IP Approver")
		ipa.request_type = self.request_type
		ipa.current_status = "Open"
		ipa.file_name = self.file_name
		ipa.file_extension = self.file_extension
		ipa.file_description = self.description
		ipa.file_type = self.document_type
		ipa.customer = self.customer
		ipa.source = self.source
		ipa.industry = self.industry
		ipa.skill_matrix_18 = self.skill_matrix_18
		ipa.skill_matrix_120 = self.skill_matrix_120
		if self.request_type != "Upgrade Validity":
			ipa.approver = self.file_approver
			ipa.employee_name = self.employee_name
		else:
			ipa.approver = ""
			ipa.level_of_approval = self.security_level
		ipa.validity_end_date = validity_end_date
		ipa.file_path = self.new_file_path
		ipa.ip_file_requester = frappe.session.user
		ipa.ip_file = self.name
		ipa.level_of_approval = self.security_level
		ipa.flags.ignore_mandatory = True
		ipa.save(ignore_permissions=True)
		return ipa	


	def prepare_for_cd_notification(self):
		template = "/templates/ip_library_templates/upgrade_validity_request_notification.html"
		subject = "IP Document Upgrade Validity Notification"
		central_delivery = self.get_central_delivery()
		cc = [ frappe.db.get_value("User", {"name":self.owner } ,"email") ] if frappe.session.user != self.owner else []
		args = {"user_name":frappe.session.user, "file_name":self.file_name }
		frappe.sendmail(recipients=central_delivery, sender=None, subject=subject,
			message=frappe.get_template(template).render(args), cc=cc)	



	def prepare_for_approver_notification(self):
		full_name, user_id = frappe.db.get_value("Employee", self.file_approver, ["employee_name", "user_id"])
		central_delivery = self.get_central_delivery()
		central_delivery.append( frappe.db.get_value("User",{"name":user_id}, "email") )
		self.send_mail(central_delivery)

	def get_central_delivery(self):
		central_delivery = frappe.db.sql(""" select distinct usr.email from `tabUser` usr 
							left join `tabUserRole` usr_role 
							on usr_role.parent = usr.name
							where usr.name != "Administrator"
							and usr_role.role = "Central Delivery"  """, as_dict=1)
		central_delivery = [user.get("email") for user in central_delivery if user.get("email")]
		return central_delivery	

	
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
								and opd.email_id != %(user)s  
								and opc.customer = %(customer)s
								and (emp.name like %(txt)s
								or emp.employee_name like %(txt)s)
								limit 20
	 		""", {
			'txt': "%%%s%%" % txt,
			'customer':filters.get("customer"),
			"user":frappe.session.user}, as_list=1)



@frappe.whitelist()
def init_for_archive_request(doc):
	doc = json.loads(doc)
	validate_for_archive_request(doc)
	create_archive_request(doc)
	send_archive_notification(doc)
	comment = "File status Changed to Archive Pending for request type Archive."
	frappe.get_doc("IP File", doc.get("file_name")).add_comment(comment)


def validate_for_archive_request(doc):
	if doc.get("file_status") not in ["Published", "Republished", "Rejected by CD (Archive)", "Rejected by CD (Edit)", "Rejected by CD (Validity)", "Validity Upgraded"]:
		frappe.throw("File Status must be published or republished to archive document.")


def create_archive_request(doc):
	ip_arch = frappe.new_doc("IP Archiver")
	ip_arch.request_type = "Archive"
	ip_arch.current_status = "Open"
	ip_arch.file_name = doc.get("file_name")
	ip_arch.file_description = doc.get("description")
	ip_arch.file_type = doc.get("document_type")
	ip_arch.customer = doc.get("customer")
	ip_arch.source = doc.get("source")
	ip_arch.industry = doc.get("industry")
	ip_arch.skill_matrix_18 = doc.get("skill_matrix_18")
	ip_arch.skill_matrix_120 = doc.get("skill_matrix_120")
	ip_arch.validity_end_date = doc.get("validity_end_date")
	ip_arch.level_of_approval = doc.get("security_level")
	ip_arch.file_path = doc.get("file_path")
	ip_arch.ip_file_owner = doc.get("owner")
	ip_arch.ip_file = doc.get("name")
	ip_arch.archive_requester = frappe.session.user
	ip_arch.flags.ignore_mandatory = True
	ip_arch.save(ignore_permissions=True)


def send_archive_notification(doc):
	template = "/templates/ip_library_templates/archive_request_notification.html"
	subject = "IP Document Archive Request Notification"
	central_delivery = frappe.db.sql(""" select distinct usr.email from `tabUser` usr 
							left join `tabUserRole` usr_role 
							on usr_role.parent = usr.name
							where usr.name != "Administrator"
							and usr_role.role = "Central Delivery"  """, as_dict=1)
	central_delivery = [user.get("email") for user in central_delivery if user.get("email")]
	args = {"user_name":frappe.session.user, "file_name":doc.get("file_name")}
	cc = [ frappe.db.get_value("User", {"name":doc.get("owner") } ,"email") ] if frappe.session.user != doc.get("owner") else []
	frappe.sendmail(recipients=central_delivery, sender=None, subject=subject,
			message=frappe.get_template(template).render(args), cc=cc)	


def get_permission_query_conditions(user):
	roles = frappe.get_roles()
	if "Central Delivery" not in roles and frappe.session.user != "Administrator":
		emp_name = frappe.db.get_value("Employee",{"user_id":frappe.session.user}, "name")
		ip_files = frappe.db.sql(""" select name from `tabIP File` where owner = '{0}' or file_approver = '{1}' """.format(frappe.session.user, emp_name),as_dict=1)
		ip_files = "', '".join([ipf.get("name") for ipf in ip_files if ipf])
		return """(`tabIP File`.name in ('{files}') )""".format(files = ip_files)


@frappe.whitelist()
def get_customer_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql(""" select  name, customer_group 
								from `tabCustomer` 
								where (name like %(txt)s
								or customer_group like %(txt)s)
								limit 20
	 		""", {'txt': "%%%s%%" % txt}, as_list=1)