frappe.pages['training-dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Training Dashboard',
		single_column: true
	});

	frappe.breadcrumbs.add("Trainings");
	$("<div class='training-dashboard'</div>").appendTo(page.body);
	new TrainingDashboard(wrapper, page);
}


TrainingDashboard = Class.extend({
	init:function(wrapper, page){
		this.wrapper = wrapper;
		this.page = page;
		this.body = $(page.body).find(".training-dashboard");
		this.footer = $("<div class='training-footer'</div>").insertAfter(this.body)
		this.filters = {};
		this.make();
	},
	make:function(){
		this.render_filters();
		this.init_for_training_autocomplete();
		this.init_for_training_search();
	},
	render_filters:function(){
		var me = this;
		$("div.page-form.row").append("<div class='form-group frappe-control col-xs-4 col-xs-offset-1' id='training-search-div'><input type='text'\
			id='global_training_search' class ='form-control' placeholder='Search Trainings'></div>")
		search_filters = [
					{"name":"search", "fieldname":"search", "label":"Search", "fieldtype":"Button", "options":"" , "icon":"icon-search"},
					{"name":"search_type", "fieldname":"search_type", "label":"", "fieldtype":"Data", "options":"" , "icon":""}

				]

		 $.each(search_filters, function(index, filter){
			me.filters[filter["name"]] = me.wrapper.page.add_field({
				fieldname: filter.fieldname,
				label: __(filter.label),
				fieldtype: filter.fieldtype,
				options: filter.options,
				icon: filter.icon/*,
				input_css:filter.input_css*/
			});

		});
		$("[data-fieldname=search_type]").css("display", "none") 

	},
	init_for_training_autocomplete:function(){
		$(this.wrapper).find("#global_training_search").autocomplete({
			source:function(request, response){
				frappe.call({
					module:"mycfo.trainings",
					page: "training_dashboard",
					method: "get_global_search_suggestions",
					args:{"filters":request.term},
					callback:function(r){
						console.log(r.message)
						response(r.message)
					}
				})
			}
		});
	},
	init_for_training_search:function(){
		var me = this;
		me.filters.search.$input.on("click", function() {
			me.filters.search_type.input.value = "Normal Search";	
			me.search_filters = { "filters":$("#global_training_search").val() }
			// me.empty_dashboard_and_footer();
			me.get_training_documents();
		
		});

	},
	get_training_documents:function(){
		frappe.call({
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "get_published_trainings",
			args:{"filters":request.term},
			callback:function(r){
				console.log(r.message)
			}
		})		
	}




})