from __future__ import unicode_literals
from frappe import _


def get_data(): 
	return [
		{	
			"label": _("Documents"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Checklist Requisition",
					"description": _("Run Checklist")
				},
				{
					"type": "doctype",
					"name": "Checklist Task",
					"description": _("Task Details")
				}
				# {
				# 	"type": "doctype",
				# 	"name": "Checklist Time Log",
				# 	"description": _("Time Log Details"),
				# }	
			]
		},
		{
			"label": _("Masters"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Checklist",
					"description": _("Checklist Details"),
				}
			]
		},
		{
			"label": _("Standard Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Checklist Requisition Analysis",
					"description": _("Process/Checklist Report"),
					"doctype": "Checklist Requisition",
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Task Wise Analysis",
					"description": _("Tasks Report"),
					"doctype": "Checklist Task",
				}
			]
		},	

	]