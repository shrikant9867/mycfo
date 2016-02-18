# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import cint
from frappe.model.document import Document
import zipfile
import json
import base64
import os
from mycfo.mycfo_utils import get_central_delivery


class Training(Document):
	
	def validate(self):
		self.validate_for_negative_completion_value()
		self.validity_for_cd_users()
		self.validate_for_training_data()
		self.store_training_data()

	def validate_for_negative_completion_value(self):
		if self.validity_for_completion <= 0:
			frappe.throw("Validity of training completion must be grater than 0 hours.")

	def validity_for_cd_users(self):
		if not len(get_central_delivery()):		
			frappe.throw("There are no Central Delivery users in system.Please upload training later.")

	def validate_for_training_data(self):
		if cint(self.get("__islocal")) and not self.training_file_data:
			frappe.throw("Please Upload the Training documents.")

	
	def store_training_data(self):
		if self.training_file_data:
			self.create_training_directory()
			training_files = json.loads(self.training_file_data)
			try:
				zip_path = frappe.get_site_path("public", "files", "trainings", self.training_name + '.zip')
				tr_zip = zipfile.ZipFile(zip_path, 'w')
				for training in training_files:
					base64_data = training.get("file_data").encode("utf8")
					base64_data = base64_data.split(',')[1]
					base64_data = base64.b64decode(base64_data)
					tr_zip.writestr(training.get("file_name"), base64_data)
				self.training_file_data = ""
				self.training_path = '/'.join(["files", "trainings", self.training_name + '.zip'])
				self.init_for_approver_form()	
			except Exception,e:
				frappe.throw("Error Occured while storing training files")
			finally:
				tr_zip.close()

			

	def create_training_directory(self):
		if not os.path.exists(frappe.get_site_path("public", "files", "trainings")):
			os.mkdir(frappe.get_site_path("public", "files", "trainings"))

	
	def init_for_approver_form(self):
		self.make_training_approver_form()
		self.send_cd_notification()
		self.add_comment("Training Document {0} status changed to pending".format(self.training_name))

	def make_training_approver_form(self):
		tr_appr = frappe.new_doc("Training Approver")
		tr_appr.update(self.get_training_approver_data())
		tr_appr.save(ignore_permissions=True)
		self.training_status = "Pending"

	
	def get_training_approver_data(self):
		return {
			"training_name":self.training_name,
			"training_documents":self.training_documents,
			"training_author":frappe.session.user,
			"description":self.description,
			"document_type":self.document_type,
			"validity_for_completion":self.validity_for_completion,
			"training_status":"Open",
			"industry":self.industry,
			"skill_matrix_120":self.skill_matrix_120,
			"skill_matrix_18":self.skill_matrix_18,
			"evaluator":self.evaluator,
			"evaluator_name":self.evaluator_name,
			"training_path":self.training_path,
			"assessment":self.assessment
		}

	
	def send_cd_notification(self):
		subject = "Training Document Notification"
		template = "/templates/training_templates/cd_training_notification.html"
		args = {"training_name":self.training_name,  "user_name":frappe.session.user }
		central_delivery = get_central_delivery()
		frappe.sendmail(recipients=central_delivery, sender=None, subject=subject,
			message=frappe.get_template(template).render(args))


	def after_insert(self):
		ass_mnt = frappe.get_doc("Assessment", self.assessment)
		ass_mnt.training_name = self.name
		ass_mnt.save(ignore_permissions=1)



def get_permission_query_conditions(user):
	if not user: user = frappe.session.user
	roles = frappe.get_roles()
	if "Central Delivery" not in roles and frappe.session.user != "Administrator":
		return """(`tabTraining`.owner = '{user}'  )""".format(user = frappe.session.user)