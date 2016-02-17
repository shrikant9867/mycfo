frappe.require("assets/help_desk/js/graphical_report.js");

frappe.pages['project-commercial-report'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Graphical Reports',
		single_column: false
	});

	opts = {
		title_mapper: {
			"project-commercial-report": "Project Commertial",
		},
		combo_chart: ["Project Commertial"],
		default_rpt: "project-commercial-report",
		sidebar_items: {
			data: [
				{
					"icon": "icon-star",
					"id": "project-commercial-report",
					"label": "Project Commertial"
				}
			]
		}
	}

	new report.graphicalReports(wrapper, page, opts)
}