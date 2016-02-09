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
					"name": "Customer",
					"description": _("Customer Details")
				},
				
				{
					"type": "doctype",
					"name": "FFWW",
					"description": _("FFWW Details"),
					"label":_("FFWW"),
				},
				{
					"type": "doctype",
					"name": "Operational Matrix",
					"description": _("Operational Matrix Details"),
				},
				{
					"type": "doctype",
					"name": "Project Commercial",
					"description": _("Project Commercial Details"),
				},
				{
					"type": "doctype",
					"name": "Financial Data",
					"description": _("Financial Details"),
				},
				{
					"type": "doctype",
					"name": "KPI",
					"description": _("KPI	 Details"),
				},	
				
			]
		},

		{
			"label": _("Masters"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Sector",
					"description": _("Sector"),
				},
				{
					"type": "doctype",
					"name": "Service Type",
					"description": _("Service Type"),
				},
				{
					"type": "doctype",
					"name": "Designation",
					"description": _("Designation"),
				},
				{
					"type": "doctype",
					"name": "Industry",
					"description": _("Industry Name"),
				},
								{
					"type": "doctype",
					"name": "Industry Group",
					"description": _("Industry Group"),
				},
				{
					"type": "doctype",
					"name": "Sub Industry",
					"description": _("Sub Industry Name"),
				},
				{
					"type": "doctype",
					"name": "Customer Segment",
					"description": _("Customer Segments"),
				},
				{
					"type": "doctype",
					"name": "Category",
					"description": _("Category"),
				},
			]
		},	

	]