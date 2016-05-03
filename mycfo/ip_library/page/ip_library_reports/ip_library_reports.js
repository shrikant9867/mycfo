frappe.require("assets/help_desk/js/graphical_report.js");

frappe.pages['ip-library-reports'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Graphical Reports',
		single_column: false
	});

	opts = {
		title_mapper: {
			"industry-document-type": "Database Count Industry & Document Type",
			"pending-files-industry": "Industry Wise Pending Files For Approval",
			"upload-trends": "Upload Trends",
			"download-trends": "Download Trends",
			"user-upload-trend": "User Wise Upload Trends",
			"user-download-trend": "User Wise Upload Trends",
			"ip-file-distribution": "IP File Distribution"
		},
		stacked_chart: ["Database Count Industry & Document Type", "Industry Wise Pending Files For Approval"],
		line_chart: ["Upload Trends", "Download Trends", "User Wise Upload Trends", "User Wise Upload Trends"],
		pie_chart: ["IP File Distribution"],
		default_rpt: "industry-document-type",
		sidebar_items: {
			data: [
				{
					"icon": "icon-star",
					"id": "industry-document-type",
					"label": "Database Count Industry & Document Type"
				},
				{
					"icon": "icon-star",
					"id": "pending-files-industry",
					"label": "Industry Wise Pending Files For Approval"
				},
				{
					"icon": "icon-star",
					"id": "upload-trends",
					"label": "Upload Trends"
				},
				{
					"icon": "icon-star",
					"id": "download-trends",
					"label": "Download Trends"
				},
				{
					"icon": "icon-star",
					"id": "user-upload-trend",
					"label": "User Wise Upload Trends"
				},
				{
					"icon": "icon-star",
					"id": "user-download-trend",
					"label": "User Wise Upload Trends"
				},
				{
					"icon": "icon-star",
					"id": "ip-file-distribution",
					"label": "IP File Distribution"
				}
			]
		}
	}

	new report.graphicalReports(wrapper, page, opts)
}