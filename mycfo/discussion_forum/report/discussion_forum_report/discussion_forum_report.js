// Copyright (c) 2013, Indictrans and contributors
// For license information, please see license.txt

frappe.query_reports["Discussion Forum Report"] = {
	"filters": [
		{
			"fieldname":"report_type",
			"label": __("Report Type"),
			"Placeholder":"Report Type",
			"fieldtype": "Select",
			"options":"\nDiscussion Topic Report\nUser Comment Report",
			"reqd": 1,
			"width": "60px"
		},
		{
			"fieldname":"start_time",
			"label": __("Start time"),
			"fieldtype": "Datetime",
			"default":frappe.datetime.now_datetime(),
			"reqd": 1,
			"width": "60px"
		},
		{
			"fieldname":"end_time",
			"label": __("End Time"),
			"fieldtype": "Datetime",
			"reqd": 1,
			"default":frappe.datetime.now_datetime(),
			"width": "60px"
		}
	]
}
