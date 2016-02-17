frappe.require("assets/help_desk/js/graphical_report.js");

frappe.pages['checklist-report'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Graphical Report',
		single_column: true
	});

	opts = {
		title_mapper: {
			"tat-checklist-requisition": "TAT For Checklist Requisition",
			"total-checklist-requisition": "Total Checklist Requisition",
		},
		stacked_percent_chart: ["TAT For Checklist Requisition", "Total Checklist Requisition"],
		default_rpt: "tat-closed-tickets",
		sidebar_items: {
			data: [
				{
					"icon": "icon-star",
					"id": "tat-checklist-requisition",
					"label": "TAT For Checklist Requisition"
				},
				{
					"icon": "icon-star",
					"id": "total-checklist-requisition",
					"label": "Total Checklist Requisition"
				}
			]
		}
	}

	// new report.graphicalReports(wrapper, page, opts)
}