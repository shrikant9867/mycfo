# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import itertools
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
		if not self.get("cr_task"):
			for task in self.get_tasks():
				self.append("cr_task", {
					"task_name": task.title,
					"status": task.status,
					"start_date": task.expected_start_date,
					"end_date": task.expected_end_date,
					"task_id": task.name,
					"des": task.des
				})
		self.update_checklist_requisition()

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
				"expected_end_date": t.end_date,
				"des": t.des,
			})

			task.flags.ignore_links = True
			task.flags.from_project = True
			task.save(ignore_permissions = True)
			task_names.append(task.name)

	def update_checklist_requisition(self):
		for t in self.cr_task:
			if t.task_id:
				task = frappe.get_doc("Checklist Task", t.task_id)
				if(task.actual_start_date):
					t.actual_start_date = task.actual_start_date;
					t.actual_end_date = task.actual_end_date;
					t.actual_time = task.actual_time;		
					t.status = task.status;
					t.des = task.final_comments				
					
	def get_tasks_detail(self):
		checklist_doc = frappe.get_doc("Checklist",self.checklist_name)
		checklist_list = []
		for task in checklist_doc.get("task"):
			checklist_list.append({'task_name':task.task_name,'start_date':datetime.now().strftime("%Y-%m-%d"),'end_date':self.get_end_date(task.tat),'des':task.des})
		return checklist_list

	def get_end_date(self,tat):
		due_date = datetime.now() + timedelta(hours=tat)
		holiday	= self.get_holiday(due_date)
		tat_with_holiday = holiday*24 + tat - 24
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
		closed_task = "{1} / {0} Closed".format(self.counter,sot.count("Closed"))
		return closed_task		