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
					"type": "page",
					"name": "resourcepool",
					"label": _("Resource Pool "),
					"description": _("Resource Pool Details"),
				},
			]
		},
	]
