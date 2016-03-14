# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import now, add_days
from frappe.model.document import Document



class IPDownloadApproval(Document):

	def validate(self):
		self.set_current_status_of_request()

	def set_current_status_of_request(self):
		status_dict = {"Rejected":"Rejected by Approver", "Approved":"Approved by Approver"}
		self.approval_status = status_dict.get(self.approver_status, "Pending") 	


	def before_submit(self):
		self.validate_for_download_request_submission()
		self.prepare_for_user_notification()
		level_mapper = {"1-Level":self.set_approval_status_for_level1, "2-Level":self.set_approval_status_for_level2}
		level_mapper.get(self.level_of_approval)()

	def set_approval_status_for_level1(self):
		status_dict = {"Rejected":"Rejected", "Approved":"Download Allowed"}
		self.approval_status = status_dict.get(self.approver_status) 	


	def set_approval_status_for_level2(self):
		status_dict = {"Rejected":"Rejected", "Approved":"Download Allowed"}
		self.approval_status = status_dict.get(self.central_delivery_status)


	def prepare_for_user_notification(self):
		args, email = self.get_requester_data()
		level_mapper = {"1-Level":{"status":self.approver_status, "comments":self.approver_comments}, 
						"2-Level":{"status":self.central_delivery_status, "comments":self.central_delivery_comments}}	
		status_mapper = level_mapper.get(self.level_of_approval)
		args.update(status_mapper)
		self.send_notification("IP Document {0} {1}".format(self.file_name, args.get("status")), email, 
									"templates/ip_library_templates/download_request_approval.html",args)

	
	def get_requester_data(self):
		email, first_name, last_name = frappe.db.get_value("User", {"name":self.ip_file_requester}, ["email", "first_name", "last_name"])
		args = {"file_name":self.file_name, "first_name":first_name, "last_name":last_name}
		return args, email

	
	def validate_for_download_request_submission(self):
		roles = frappe.get_roles()
		validate_mapper = {"1-Level":self.validate_for_level_1_document, "2-Level":self.validate_for_level_2_document}
		validate_mapper.get(self.level_of_approval)(roles)

	
	
	def validate_for_level_1_document(self, roles):
		if "Central Delivery" in roles:
			frappe.throw("Central Delivery is not allowed to submit download request of Level-1 document")
		if not self.approver_status:
			frappe.throw("Approver Status is mandatory to submit download request of Level-1 document")	
	
	
	def validate_for_level_2_document(self, roles):
		if "Central Delivery" not in roles:
			frappe.throw("Only Central Delivery is allowed to submit download request of Level-2 document")
		self.validate_for_approval()
	
	def validate_for_approval(self):
		if self.central_delivery_status != self.approver_status:
			frappe.throw(" Approver Status & Central Delivery Status must be same to submit document ")
	
	
	def send_notification(self, subject, email, template, args):
		frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))


def get_permission_query_conditions(user):
	roles = frappe.get_roles()
	emp_name = frappe.db.get_value("Employee",{"user_id":frappe.session.user}, "name")
	if "Central Delivery" not in roles and frappe.session.user != "Administrator":
		cond = " where approver = '{0}' ".format(emp_name)
		ip_files = frappe.db.sql(""" select name from `tabIP Download Approval` {0} """.format(cond), as_dict=1)
		ip_files = "', '".join([ipf.get("name") for ipf in ip_files if ipf])
		return """(`tabIP Download Approval`.name in ('{files}') )""".format(files = ip_files)			  