# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import itertools
from frappe import _
import json
from frappe.model.naming import make_autoname
from frappe.utils import nowdate, getdate
from frappe.model.document import Document
from frappe.utils import now_datetime
from datetime import datetime, timedelta

class ChecklistRequisition(Document):
	
	def autoname(self):
		if self.checklist_status == "Open":
			self.name = make_autoname(self.checklist_name.upper()+ ' - ' +'.#####')		
	def onload(self):
		"""Load project tasks for quick view"""
		if not self.get("cr_task"):
			for task in self.get_tasks():
				self.append("cr_task", {
					"task_name": task.title,
					"status": task.status,
					"start_date": task.expected_start_date,
					"end_date": task.expected_end_date,
					"task_id": task.name,
					"des": task.des,
					"assignee": task.assignee,
					"user":task.user,
					"actual_end_date":task.end_date,
					"actual_time":task.actual_time
				})

	def __setup__(self):
		self.onload()

	def get_tasks(self):
		return frappe.get_all("Checklist Task", "*", {"project": self.name}, order_by="expected_start_date asc")	

	def validate(self):
		self.sync_tasks()
		self.make_todo()
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
				"expected_end_date": t.end_date,
				"des": t.des,
				"assignee":t.assignee,
				"user":t.user,
				"to_be_processed_for":self.to_be_processed_for,
				"process_description":self.process_description,
				"checklist_name":self.checklist_name,
			})

			task.flags.ignore_links = True
			task.flags.from_project = True
			task.save(ignore_permissions = True)
			t.task_id = task.name

	# def update_checklist_requisition(self):
	# 	print "update_checklist_requisition"
	# 	if self.cr_task:
	# 		for task in self.cr_task:
	# 			tl = frappe.db.sql("""select name,end_date from `tabChecklist Task` where name = '{0}'""".format(task.task_id),as_list=1)
	# 			print tl[0][0],tl[0][1]
	# 			update = frappe.db.sql("""update `tabRequisition Task` set actual_end_date = '{0}' where task_id ='{1}' and parent = '{2}' """.format(tl[0][1],tl[0][0],self.name))	
	# 			print update
	# 			return update
	
	def make_todo(self):
		if self.flags.dont_make_todo: return
		
		todo_names = []
		for task in self.cr_task:
			if task.task_id:
				task_id = frappe.get_doc("Checklist Task", task.task_id)
				todo = frappe.db.get_value("ToDo",{'reference_name':task.task_id,'reference_type':task_id.doctype},'name')
				# todo = frappe.db.sql("""select name as name from `tabToDo` where reference_type = '{0}' and reference_name = '{1}'""".format(task_id.doctype,task.task_id),as_dict=1)
				if todo:
					todo1 = frappe.get_doc("ToDo",todo)
					todo1.update({
					"role": task.assignee,
					"reference_type": "Checklist Task",
					"reference_name": task.task_id
					})
				else:
					self.init_make_todo(task)
	

	def init_make_todo(self,task):			
		todo = frappe.new_doc("ToDo")
		todo.description = self.name
		todo.update({
			# ct:cr
			# "owner": t.task_name,
			"role": task.assignee,
			"reference_type": "Checklist Task",
			"reference_name": task.task_id,
			"owner": task.user
		})
		todo.flags.ignore_links = True
		todo.flags.from_project = True
		todo.save(ignore_permissions = True)

		

	def get_tasks_detail(self):
		checklist_doc = frappe.get_doc("Checklist",self.checklist_name)
		checklist_list = []
		for task in checklist_doc.get("task"):
			checklist_list.append({'task_name':task.task_name,'start_date':datetime.now().strftime("%Y-%m-%d"),'end_date':self.get_end_date(task.tat),'des':task.des,'assignee':task.assignee})
		return checklist_list

	def get_end_date(self,tat):
		due_date = datetime.now() + timedelta(hours=tat)
		holiday	= self.get_holiday(due_date)
		tat_with_holiday = holiday*24 + tat
		due_date_with_holiday = datetime.now() + timedelta(hours=tat_with_holiday)
		return due_date_with_holiday.strftime("%Y-%m-%d")	

	def get_holiday(self,due_date):
		tot_hol = frappe.db.sql("""select count(*) from `tabHoliday List` h1,`tabHoliday` h2 
		where h2.parent = h1.name and h1.name = 'Mycfo' and h2.holiday_date >= %s and  h2.holiday_date <= %s""",(nowdate(),due_date.strftime("%Y-%m-%d")))
		return tot_hol[0][0]

	def get_status(self):
		status_of_all = frappe.db.sql("""select status from `tabChecklist Task`t1 where t1.project = '{0}'""".format(self.name),as_list=1)
		chain = itertools.chain(*status_of_all)
		sot =  list(chain)
		sot.count("Closed")
		if(("Open" not in sot)and("WIP" not in sot)and("Awaiting Inputs" not in sot)and("Completed" not in sot)and("Hold" not in sot)and("Not Required" not in sot)and("Deferred" not in sot)):
			return "Closed"
		if(("Open" not in sot)and("Closed" not in sot)and("Awaiting Inputs" not in sot)and("Completed" not in sot)and("Hold" not in sot)and("Not Required" not in sot)and("Deferred" not in sot)):
			return "WIP"
		if(("Open" not in sot)and("WIP" not in sot)and("Awaiting Inputs" not in sot)and("Closed" not in sot)and("Hold" not in sot)and("Not Required" not in sot)and("Deferred" not in sot)):
			return "Completed"		
		else:
			return "Open"

	def get_closed_task(self):
		status_of_all = frappe.db.sql("""select status from `tabChecklist Task`t1 where t1.project = '{0}'""".format(self.name),as_list=1)
		chain = itertools.chain(*status_of_all)
		sot =  list(chain)
		number_of_task = frappe.db.sql("""select count(*) from `tabChecklist Task`t1 where t1.project = '{0}'""".format(self.name),as_dict=1)
		self.counter = number_of_task[0]['count(*)']
		closed_task = "{1} / {0} Closed".format(self.counter,sot.count("Closed"))
		return closed_task

@frappe.whitelist()
def filter_user(doctype, txt, searchfield, start, page_len, filters):
	cr_task = filters['doc']['cr_task']
	user_list = frappe.db.sql("""select t1.email from `tabUser` t1,`tabUserRole` t2 
		where t1.name = t2.parent and t2.role = '{0}'""".format(cr_task[0]['assignee']),as_list =1)
	return user_list

# @frappe.whitelist()
# def get_cr_task_details(doc):
# 	current_doc = json.loads(doc)
																