# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document



class TrainingApprover(Document):


	def before_submit(self):
		self.validate_for_central_delivery_status()
		self.init_for_training_publishing()


	def validate_for_central_delivery_status(self):
		if not self.central_delivery_status:
			frappe.throw("Central delivery status is mandatory to submit the document.")

	def init_for_training_publishing(self):
		mapper = {"Accepted":self.publish_training, "Rejected":self.reject_training}
		mapper.get(self.central_delivery_status)()

	
	def publish_training(self):
		self.training_status = "Published"
		training_data = self.get_training_data()
		self.update_training_data(training_data)
		self.update_assessment_evaluator()
		self.add_comment_to_training()
		template = "/templates/training_templates/training_published_notification.html"
		self.send_mail(template)


	def reject_training(self):
		self.training_status = "Rejected"
		self.update_training_data({"training_status":self.training_status})
		self.add_comment_to_training()
		template = "/templates/training_templates/training_rejection_notification.html"
		self.send_mail(template)
		
	
	def get_training_data(self):
		return {
			"description":self.description,
			"document_type":self.document_type,
			"validity_for_completion":self.validity_for_completion,
			"training_status":self.training_status,
			"industry":self.industry,
			"skill_matrix_120":self.skill_matrix_120,
			"skill_matrix_18":self.skill_matrix_18,
			"evaluator":self.evaluator,
			"evaluator_name":self.evaluator_name
		}	


	def send_mail(self, template):
		subject = "Training Document Notification"
		first_nm, last_nm = frappe.db.get_value("User", {"name":self.training_author}, ["first_name", "last_name"])
		args = {"training_name":self.training_name, "cd":frappe.session.user, 
					"first_name":first_nm, "last_name":last_nm , "comments":self.central_delivery_comments }
		frappe.sendmail(recipients= self.training_author, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))


	def update_training_data(self, training_data):
		tr = frappe.get_doc("Training", {"name":self.training_name})
		tr.update(training_data)
		tr.save(ignore_permissions = True)

	def add_comment_to_training(self):
		comment = "Training Document {0} status changed to {1}".format(self.training_name, self.training_status)
		frappe.get_doc("Training", self.training_name).add_comment(comment)

	def update_assessment_evaluator(self):
		asmt = frappe.get_doc("Assessment", self.assessment)
		asmt.assessment_evaluator = frappe.db.get_value("Employee", {"name":self.evaluator}, 'user_id')
		asmt.save(ignore_permissions=True)		