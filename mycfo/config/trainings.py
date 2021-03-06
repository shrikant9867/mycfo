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
					"name": "Training Approver",
					"description": _("Approve Trainings from here.")
				},
				{
					"type": "doctype",
					"name": "Answer Sheet",
					"description": _("Evaluate answer sheet.")
				},
				{
					"type": "doctype",
					"name": "Training Feedback",
					"description": _("Check Training Feedback of users.")
				},
				{
					"type": "doctype",
					"name": "Training Subscription Approval",
					"description": _("Approve training subscription requests.")
				}
				
			]
		},
		{
			"label": _("Masters"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Training",
					"description": _("Upload Training from here.")
				},
				{
					"type": "doctype",
					"name": "Assessment",
					"description": _("Make Assessment for trainings.")
				},
				{
					"type": "doctype",
					"name": "Training Questionnaire",
					"description": _("Set Training Feedback Questionnaire.")
				}

			]
		},
		{
			"label": _("Training DB"),
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
		},
		{
			"label": _("Standard Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "training-report",
					"icon": "icon-sitemap",
					"label": _("Graphical Reports"),
					"description": _("Graphical Report for Trainings"),
				}
			]
		}	

	]