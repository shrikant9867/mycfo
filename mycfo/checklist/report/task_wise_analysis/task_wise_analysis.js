// Copyright (c) 2013, Indictrans and contributors
// For license information, please see license.txt

frappe.query_reports["Task Wise Analysis"] = {
	"filters": [
		{
			"fieldname":"checklist_requisition",
			"label": __("Checklist Requisition"),
			"fieldtype": "Link",
			"options": "Checklist Requisition",
			"width": "80"
		},
		{
			"fieldname":"status",
			"label": __("Task Status"),
			"fieldtype": "Select",
			"options": ["","Open", "Closed","WIP","Completed","Awaiting Inputs","Deferred","Not Required"]
		},
		{
			"fieldname":"user",
			"label": __("User/Assignee"),
			"fieldtype": "Link",
			"options": "User"
		}
	]
}
