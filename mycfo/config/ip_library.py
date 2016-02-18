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
				},
				{
					"type": "doctype",
					"name": "IP Archiver",
					"description": _("Archive IP File from here.")
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
			"label": _("IP Library"),
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
		},
		{
			"label": _("Standard Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "ip-library-reports",
					"icon": "icon-sitemap",
					"label": _("Graphical Reports"),
					"description": _("Graphical Report for Request and IP Library"),
				}
			]
		}
	]