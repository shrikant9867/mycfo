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
					"name": "Training",
					"description": _("Upload Training from here.")
				},
				{
					"type": "doctype",
					"name": "Training Approver",
					"description": _("Approve Trainings from here.")
				},
				{
					"type": "doctype",
					"name": "Assessment",
					"description": _("Make Assessment for trainings.")
				}
				
			]
		},
		{
			"label": _("Page"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "training-dashboard",
					"icon": "icon-sitemap",
					"label": _("Training Search Dashboard"),
					"route": "training-dashboard",
					"description": _("Search or Assign trainings from here")
				}
			]
		}	

	]