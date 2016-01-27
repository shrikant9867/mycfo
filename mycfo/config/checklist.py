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
			"label": _("Main Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Process Wise Tasks",
					"description": _("Tasks Details"),
				},
				{
					"type": "doctype",
					"name": "Process Templates",
					"description": _("Process Details"),
				}
			]
		},	

	]