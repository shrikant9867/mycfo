frappe.pages['Project Commercial'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Project Commercial',
		single_column: true
	});

	$("<div class='user-settings' \
		style='padding: 15px;'></div>").appendTo(page.main);

	wrapper.project = new Project(wrapper);
}


Project = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.filters = {};
		this.make();
		this.refresh();
	},

	make: function() {
		var me = this;
		me.filters.customer = me.wrapper.page.add_field({
					fieldname: "customer",
					label: __("Customer"),
					fieldtype: "Link",
					options: "Customer"
		});

		if(frappe.route_options)
			me.filters.customer.input.value= frappe.route_options['customer']

	},

	refresh: function() {
		var me = this;
		me.render()
	},

	render: function() {
		var me = this;
		console.log("in render")
		console.log(me.filters.customer.input.value)

	},




})



