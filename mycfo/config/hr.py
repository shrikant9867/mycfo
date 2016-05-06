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
	]
