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


class Training(Document):
	
	def validate(self):
		self.validate_for_assessments()
		self.validate_for_training_data()
		self.store_training_data()

	
	def validate_for_assessments(self):
		pass

	
	def validate_for_training_data(self):
		if cint(self.get("__islocal")) and not self.training_file_data:
			frappe.throw("Please Upload the Training documents.")

	
	def store_training_data(self):
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
		except Exception,e:
			frappe.throw("Error Occured while storing training files")
		finally:
			tr_zip.close()

			



	def create_training_directory(self):
		if not os.path.exists(frappe.get_site_path("public", "files", "trainings")):
			os.mkdir(frappe.get_site_path("public", "files", "trainings"))

