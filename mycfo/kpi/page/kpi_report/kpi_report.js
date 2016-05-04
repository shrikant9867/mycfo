frappe.require("assets/help_desk/js/graphical_report.js");

frappe.pages['kpi-report'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Graphical Reports',
		single_column: false
	});

	opts = {
		title_mapper: {
			"skill-mapping-data": "Skill Mapping Report"
		},
		stacked_chart: [],
		line_chart: [],
		pie_chart: [],
		stacked_bar_chart:["Skill Mapping Report"],
		default_rpt: "skill-mapping-data",
		sidebar_items: {
			data: [
				{
					"icon": "icon-star",
					"id": "skill-mapping-data",
					"label": "Skill Mapping Report",
				}
			]
		}

	}

	new report.graphicalReports(wrapper, page, opts)
}