frappe.require("assets/help_desk/js/graphical_report.js");
frappe.pages['training-report'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Graphical Reports',
		single_column: false
	});


		opts = {
		title_mapper: {
			"training-distribution": "Training Distribution"
		},
		stacked_chart: [],
		line_chart: [],
		pie_chart: ["Training Distribution"],
		default_rpt: "training-distribution",
		sidebar_items: {
			data: [
				{
					"icon": "icon-star",
					"id": "training-distribution",
					"label": "Training Distribution"
				}
			]
		}
	}

	new report.graphicalReports(wrapper, page, opts)
}