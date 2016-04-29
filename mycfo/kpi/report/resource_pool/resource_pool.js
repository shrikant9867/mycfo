// Copyright (c) 2013, Indictrans and contributors
// For license information, please see license.txt

frappe.query_reports["Resource Pool"] = {
	"filters": [
		{
			"fieldname":"status",
			"label": __("Employess Status"),
			"Placeholder":"Employess Status",
			"fieldtype": "Select",
			"options":"\nActive\nLeft",
			"default": "Active",
			"width": "60px"
		},

	]
}
