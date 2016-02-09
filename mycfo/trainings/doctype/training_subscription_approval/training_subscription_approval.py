# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class TrainingSubscriptionApproval(Document):
	
	def validate(self):
		pass

	def before_submit(self):
		self.validate_for_central_delivery_status()
		self.initiate_for_request_submission()


	def validate_for_central_delivery_status(self):
		if not self.central_delivery_status:
			frappe.throw("Central delivery Status is mandatory to submit training request.")
			
	def initiate_for_request_submission(self):
		mapper = {"Accepted":self.accept_request, "Rejected":self.reject_request}
		mapper.get(self.central_delivery_status)()

	def accept_request(self):
		self.request_status = "Accepted"
		request_type_dict = {"Forced Training":["/templates/training_templates/assigned_training_notification.html", [self.training_requester] ], 
								"Unforced Training":["/templates/training_templates/training_request_notification.html", self.get_central_delivery() ]
							}
		template = request_type_dict.get(self.request_type)[0]
		recipients = request_type_dict.get(self.request_type)[1]
		self.create_answer_sheet()
		self.send_mail(template, recipients)

	def create_answer_sheet(self):
		as_data = frappe.get_doc("Assessment", {"name":self.assessment})
		new_as_data = self.get_assessment_dict(as_data)
		ans_key = frappe.new_doc("Answer Sheet")
		ans_key.answer_sheet_status = "New"
		ans_key.student_name = self.training_requester
		ans_key.training_subscription = self.name
		ans_key.update(new_as_data)
		ans_key.save(ignore_permissions=1)

	def get_assessment_dict(self, as_data):
		return {
					"total_questions":as_data.get("total_questions"), 
					"total_marks":as_data.get("total_marks"), 
					"table_5":as_data.get("table_5"), 
					"training_name":as_data.get("training_name"), 
					"assessment_evaluator":as_data.get("assessment_evaluator"),
					"subjective_flag":as_data.get("subjective_flag")
				}

	def reject_request(self):
		self.request_status = "Rejected"
		template = "/templates/training_templates/training_request_notification.html"	
		self.send_mail(template)

	def get_central_delivery(self):
		central_delivery = frappe.get_list("UserRole", filters={"role":"Central Delivery","parent":["!=", "Administrator"]}, fields=["parent"])
		central_delivery = [user.get("parent") for user in central_delivery]
		return central_delivery	

	def send_mail(self, template, recipients):
		subject = "Training Document Notification"
		first_nm, last_nm = frappe.db.get_value("User", {"name":self.training_requester}, ["first_name", "last_name"])
		args = {"training_name":self.training_name, "cd":frappe.session.user, "first_name":first_nm, 
					"last_name":last_nm if last_nm else "", "comments":self.central_delivery_comments, "status":self.request_status }
		frappe.sendmail(recipients= recipients, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))
		




