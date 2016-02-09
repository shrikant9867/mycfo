# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return {
		"mycfo": {
			"color": "grey",
			"icon": "icon-th",
			"type": "module",
			"label": _("Customer Details")
		},
		"Checklist":{
			"color": "blue",
			"icon": "icon-list",
			"type": "module",
			"label": _("Checklist")
		},
		"IP Library": {
			"color": "#8e44ad",
			"icon": "octicon octicon-database",
			"type": "module",
			"label": _("IP Library")
		},
		"Trainings":{
			"color": "#4aa3df",
			"icon": "octicon octicon-device-camera-video",
			"type": "module",
			"label": _("Trainings")
		},	
		"Discussion Forum": {
			"color": "#8e44ad",
			"icon": "octicon octicon-organization",
			"type": "page",
			"label": _("Discussion Forum"),
			"link":"discussion-forum"
		}
	}
