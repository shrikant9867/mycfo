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
					"name": "Customer Skill Mapping",
					"description": _("Customer Skill Mapping Details"),
				},
				{
					"type": "doctype",
					"name": "KPI",
					"description": _("KPI Details"),
				},	
				{
					"type": "doctype",
					"name": "Customer Satisfaction Survey",
					"description": _("Customer Satisfaction Survey Details"),
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
		{
			"label": _("Standard Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "project-commercial-report",
					"icon": "icon-sitemap",
					"label": _("Graphical Reports"),
					"description": _("Graphical Report for Project Commercial")
				},
				{
					"type": "report",
					"name": "Login Report",
					"is_query_report": True,
					"doctype": "Login Log",
					"description": _("Login details report.")
				},
				{
					"type": "report",
					"name": "Customer Skill Mapping Report",
					"is_query_report": True,
					"doctype": "Customer Skill Mapping",
					"description": _("Customer Skill mapping report comprises total, sum & average of skill")
				},
				{
					"type": "report",
					"name": "Customer Skill Mapping",
					"label": "Customer Skill Mapping Analysis",
					"is_query_report": True,
					"doctype": "Customer Skill Mapping",
					"description": _("Customer skill maaping detailed analysis")
				},
				{
					"type": "report",
					"name": "Customer Operational Matrix",
					"label": "Customer Operational Matrix",
					"is_query_report": True,
					"doctype": "Operation And Project Commercial",
					"description": _("Customer Operational Matrix Details")
				},
				{
					"type": "report",
					"name": "EL Sign Off Report",
					"label": "EL Sign Off Report",
					"is_query_report": True,
					"doctype": "EL Sign Off Details",
					"description": _("EL Sign Off Details")
				},
				{
					"type": "report",
					"name": "Customer Operational Matrix Details",
					"label": "Customer Operational Matrix Details",
					"is_query_report": True,
					"doctype": "Operation And Project Commercial",
					"description": _("Customer Operational Matrix Details")
				}
			]
		}
	]