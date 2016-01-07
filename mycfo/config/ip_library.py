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
					"description": _("Upload Intellectual Property File Content")
				},
				{
					"type": "doctype",
					"name": "IP Approver",
					"description": _("Intellectual Property Approver")
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

	]