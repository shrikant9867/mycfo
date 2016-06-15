from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Skill Mapping"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Skill Mapping",
					"description": _("Skill Mapping Details"),
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Resource Pool",
					"description": _("Resource Pool"),
					"doctype": "Skill Mapping",
				},
				{
					"type": "page",
					"name": "kpi-report",
					"icon": "icon-sitemap",
					"label": _("KPI Graphical Reports"),
					"description": _("Graphical Report for KPI"),
				}
			]
		},
		{
			"label": _("Skill Mapping Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "report",
					"name": "Skill Mapping Report",
					"is_query_report": True,
					"doctype": "Skill Mapping",
					"description": _("Skill mapping report comprises total, sum & average of skill")
				},
				{
					"type": "report",
					"name": "Employee Skill Mapping",
					"is_query_report": True,
					"doctype": "Skill Mapping",
					"description": _("Employee skill maaping details")
				}
			]
		}
	]
