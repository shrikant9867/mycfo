# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
from frappe import _

def get_data():
	roles = frappe.get_roles(frappe.session.user)
	if 'Prospect' not in (roles):
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
			"type": "page",
			"label": _("IP Library"),
			"link":"ip-file-dashboard"
		},
		"Trainings":{
			"color": "#4aa3df",
			"icon": "octicon octicon-device-camera-video",
			"type": "page",
			"label": _("Trainings"),
			"link":"training-dashboard"
		},	
		"Discussion Forum": {
			"color": "#8e44ad",
			"icon": "octicon octicon-organization",
			"type": "page",
			"label": _("Discussion Forum"),
			"link":"discussion-forum"
		}
	}

	else:
		return {
			"Skill Mapping": {
				"color": "grey",
				"icon": "icon-th",
				"type": "doctype",
				"label": "Skill Mapping",
				"link": "List/Skill Mapping",
				"description": _("Skill Mapping Details"),
			},
			"Resource Pool":{
				"color": "blue",
				"icon": "icon-list",
				"type": "page",
				"label": _("Resource Pool"),
				"link":"resourcepool"
			}
		}
