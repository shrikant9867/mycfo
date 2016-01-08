# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe.utils import nowdate, getdate
from frappe.model.document import Document
from frappe.utils import now_datetime
from datetime import datetime, timedelta

class ChecklistRequisition(Document):
	
	def onload(self):
		if not self.get("cr_task"):
			for task in self.get_tasks():
				print task.name
				self.append("cr_task", {
					"task_name": task.title,
					"status": task.status,
					"start_date": task.expected_start_date,
					"end_date": task.expected_end_date,
					"task_id": task.name
				})

	def __setup__(self):
		self.onload()

	def get_tasks(self):
		return frappe.get_all("Checklist Task", "*", {"project": self.name}, order_by="expected_start_date asc")


	def validate(self):
		self.sync_tasks()
		self.cr_task = []

	def sync_tasks(self):
		if self.flags.dont_sync_tasks: return
		
		task_names = []
		for t in self.cr_task:
			if t.task_id:
				task = frappe.get_doc("Checklist Task", t.task_id)
			else:
				task = frappe.new_doc("Checklist Task")
				task.project = self.name

			task.update({
				# ct:cr
				"title": t.task_name,
				"status": t.status,
				"expected_start_date": t.start_date,
				"expected_end_date": t.end_date
				# "description": t.description,
			})

			task.flags.ignore_links = True
			task.flags.from_project = True
			task.save(ignore_permissions = True)
			task_names.append(task.name)

	# def update_checklist_requisition(self):
	# 	self.flags.dont_sync_tasks = True
	# 	self.save()	

@frappe.whitelist()
def get_tasks(doc):
	current_doc = json.loads(doc)
	checklist_doc = frappe.get_doc("Checklist",current_doc.get("checklist_name"))
	checklist_list = []
	for task in checklist_doc.get("task"):
		checklist_list.append({'task_name':task.task_name,'start_date':datetime.now().strftime("%Y-%m-%d"),'end_date':get_end_date(task.tat)})
	return checklist_list

def get_end_date(tat):
	due_date = datetime.now() + timedelta(hours=tat)
	holiday	= get_holiday(due_date)
	tat_with_holiday = holiday*24 + tat - 24
	due_date_with_holiday = datetime.now() + timedelta(hours=tat_with_holiday)
	return due_date_with_holiday.strftime("%Y-%m-%d")

def get_holiday(due_date):
	tot_hol = frappe.db.sql("""select count(*) from `tabHoliday List` h1,`tabHoliday` h2 
	where h2.parent = h1.name and h1.name = 'Mycfo' and h2.holiday_date >= %s and  h2.holiday_date <= %s""",(nowdate(),due_date.strftime("%Y-%m-%d")))
	return tot_hol[0][0]
