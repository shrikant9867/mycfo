from __future__ import unicode_literals
from frappe import _


def get_data(): 
	return [
		{	
			"label": _("Documents"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "discussion-forum",
					"label": _("Discussion Forum"),
					"description": _("Discussion Forum"),
				},
				{
					"type": "doctype",
					"name": "Discussion Topic",
				},
				{
					"type": "doctype",
					"name": "Topic Ratings",
				},
			]
		},
		{
			"label": _("Setup"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Discussion Category",
					"description": _("Discussion Category Type"),
				},
			]
		},
		{
			"label": _("Standard Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "report",
					"name": "Discussion Forum Report",
					"is_query_report": True,
					"doctype": "Discussion Topic"
				}
			]
		}
	]
