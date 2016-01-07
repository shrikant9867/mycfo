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
					"name": "IP File",
					"description": _("Upload IP File Content from here.")
				},
				{
					"type": "doctype",
					"name": "IP Approver",
					"description": _("Publish/Republish IP File.")
				},
				{
					"type": "doctype",
					"name": "IP Download Approval",
					"description": _("Approve Download request of IP File.")
				}
				
			]
		},
		{
			"label": _("Masters"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Document Type",
					"description": _("Document Type"),
				},
				{
					"type": "doctype",
					"name": "Skill Matrix 18",
					"description": _("Skill Matrix 18"),
				},
				{
					"type": "doctype",
					"name": "Skill Matrix 120",
					"description": _("Skill Matrix 120"),
				}
			]
		},
		{
			"label": _("Page"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "ip-file-dashboard",
					"icon": "icon-sitemap",
					"label": _("Global IP File Search Dashboard"),
					"route": "ip-file-dashboard",
					"description": _("Search Ip File from here")
				}
			]
		}	

	]