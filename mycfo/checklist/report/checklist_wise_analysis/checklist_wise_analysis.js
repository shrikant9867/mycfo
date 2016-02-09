// Copyright (c) 2013, Indictrans and contributors
// For license information, please see license.txt

frappe.query_reports["Checklist Wise Analysis"] = {
	"filters": [
				{
			"fieldname":"checklist",
			"label": __("Checklist Requisition"),
			"fieldtype": "Link",
			"options": "Checklist Requisition",
			"width": "80"
		},
		{
			"fieldname":"checklist_status",
			"label": __("Status"),
			"fieldtype": "Select",
			"options": ["","Open", "Closed","WIP","Completed","Hold"]
		}
	]
}
