# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class IPArchiver(Document):
	
	def before_submit(self):
		self.validate_for_status()
		self.set_current_status()
		self.update_ip_file_status()
		self.send_archive_notification()

	def validate_for_status(self):
		if not self.central_delivery_status:
			frappe.throw("Central Delivery Status is mandatory to submit the docuemnt")


	def set_current_status(self):
		status_mapper = {"Approved":"Archived", "Rejected":"Rejected"}
		self.current_status = status_mapper.get(self.central_delivery_status)
		self.file_path = ""
	
	def update_ip_file_status(self):
		file_status_mapper = {"Archived":["Archived", 0], "Rejected":["Rejected by CD (Archive)", 1]}
		query = " update `tabIP File` set file_status= '{0}' , published_flag = {1} where  name = '{2}' ".format(
						file_status_mapper.get(self.current_status)[0], file_status_mapper.get(self.current_status)[1], self.ip_file)
		frappe.db.sql(query)
		self.prepare_for_add_comment(file_status_mapper.get(self.current_status)[0])


	def prepare_for_add_comment(self, file_status):
		comment = "File status Changed to {0} for request type Archive.".format(file_status)
		frappe.get_doc("IP File", self.ip_file).add_comment(comment)


	def send_archive_notification(self):
		template = "/templates/ip_library_templates/archive_notification.html"
		subject = "IP Document Archive Notification"
		email = list(set([self.archive_requester, self.ip_file_owner]))
		args = {"status":self.central_delivery_status, "comments":self.central_delivery_comments, "file_name":self.file_name}
		frappe.sendmail(recipients=email, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))	
