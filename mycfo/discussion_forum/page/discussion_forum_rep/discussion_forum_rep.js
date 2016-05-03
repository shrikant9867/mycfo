frappe.require("assets/help_desk/js/graphical_report.js");
frappe.pages['discussion-forum-rep'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Graphical Reports',
		single_column: false
	});


		opts = {
		title_mapper: {
			"discussion-topic": "Discussion Topics"
		},
		stacked_chart: [],
		line_chart: [],
		pie_chart: ["Discussion Topics"],
		default_rpt: "discussion-topic",
		sidebar_items: {
			data: [
				{
					"icon": "icon-star",
					"id": "discussion-topic",
					"label": "Discussion Topics"
				}
			]
		}
	}

	new report.graphicalReports(wrapper, page, opts)
}