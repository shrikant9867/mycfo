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
		this.init_for_assign_now();
		this.init_for_my_trainings();
		this.init_for_training_autocomplete();
		this.init_for_training_search();
	},
	render_filters:function(){
		var me = this;
		$("div.page-form.row").append("<div class='form-group frappe-control col-xs-4 col-xs-offset-1' id='training-search-div'><input type='text'\
			id='global_training_search' class ='form-control' placeholder='Search Trainings'></div>")
		search_filters = [
					{"name":"search", "fieldname":"search", "label":"Search", "fieldtype":"Button", "options":"" , "icon":"icon-search"},
					{"name":"my_training", "fieldname":"my_training", "label":"My Trainings", "fieldtype":"Button", "options":"" , "icon":""},
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
			me.empty_dashboard_and_footer();
			me.get_training_documents(0, me);
		
		});

	},
	get_training_documents:function(page_no, outer_this){
		var me = outer_this;
		me.search_filters["page_no"] = page_no 
		frappe.call({
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "get_published_trainings",
			args:{"search_filters": me.search_filters },
			callback:function(r){
				console.log(r.message)
				me.run_post_search_operation(r.message)
			
			}
		})		
	},
	run_post_search_operation:function(response){
		var me = this;
		$(me.body).html(frappe.render_template("training", {"training_data":response.response_data}));
		me.render_ratings();
		me.render_avg_ratings(response.response_data);
		me.init_for_pagination(response.total_pages);
		// me.submit_training_review();
		me.make_training_subscription_request();
	},
	init_for_pagination:function(total_pages){
		var me = this;
		me.render_pagination(total_pages)
	},
	render_pagination:function(total_pages){
		var me = this;	
		var pagination_mapper = {"Normal Search":me.get_training_documents }
		if (total_pages == 0){
			msgprint("No IP File found against specified criteria.")
		}
		else if (!$('#pagination-demo').length && total_pages){
			$('<div class="row"><div class="col-xs-10 col-xs-offset-2"><ul id="pagination-demo" class="pagination-sm"></ul></div></div>').appendTo(this.footer)
			$('#pagination-demo').twbsPagination({
				totalPages:total_pages,
				visiblePages: 3,
				initiateStartPageClick:false,
				onPageClick: function (event, page) {					
					search_type = me.filters.search_type.input.value
					// me.get_ip_files(page - 1)
					pagination_mapper[search_type](page - 1 , me)
	
				}
			});
			this.paginaiton = $('#pagination-demo').data();
			this.paginaiton.twbsPagination.options.initiateStartPageClick = true;
			

		}else if($('#pagination-demo').length){
			
			this.paginaiton.twbsPagination.options.totalPages = total_pages;

		}
	},
	render_ratings:function(){
		$(".rateYo").rateYo({
	    	precision: 2,
	    	starWidth: "20px"
	  	});  	

	},
	render_avg_ratings:function(training_data){
		$.each(training_data, function(index, value){
			$("#avg-rateYo{0}".replace("{0}",index)).rateYo({
		    	precision: 2,
		    	starWidth: "20px",
		    	rating:value.avg_ratings,
		    	readOnly:true
	  		});
		})
		
	},
	submit_training_review:function(){
		var me = this;
		$(".submit-review").click(function(){
			my_parent =  $(this).closest(".tab-pane")
			my_ratings = $(my_parent).find(".rateYo").rateYo("rating");
			comments =  $(my_parent).find(".tr-text-area").val();
			tr_name = $(this).closest(".panel").attr("tr-name");
			if (my_ratings){
				request_data = {"training_name":tr_name, "ratings":my_ratings, "comments":comments}
				me.submit_review(request_data);
				$(my_parent).find(".rateYo").rateYo("rating", 0);
				$(my_parent).find(".tr-text-area").val("")
			}
			else{
				msgprint("Ratings are mandatory to submit the review")
			}

		})
	},
	submit_review:function(request_data){
		var me = this;
		frappe.call({
			freeze: true,
			freeze_message:"Please wait ...........",
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "create_training_review",
			args:{"request_data":request_data },
			callback:function(r){
				msgprint("Training {0} review submitted successfully.".replace("{0}",request_data.training_name))			
			}
		})
	},
	empty_dashboard_and_footer:function(){
		$(".training-dashboard").html("");
		$(".training-footer").html("");
	},
	make_training_subscription_request:function(){
		var me = this;
		console.log("training subscribe")
		$(".subscribe").click(function(){
			var subscribe_button = this;
			$panel = $(this).closest(".training-panel")
			training_nm = $panel.attr("tr-name")
			frappe.call({
					freeze: true,
					freeze_message:"Please wait ...........",
					module:"mycfo.trainings",
					page: "training_dashboard",
					method: "make_training_subscription_form",
					args:{"request_data":{ "tr_name":training_nm } },
					callback:function(r){
						$(subscribe_button).attr("disabled", true)
						frappe.msgprint("Training subscription request for {0} submiited successfully.".replace("{0}", training_nm))
					}
			})	
		})
	},
	init_for_assign_now:function(){
		this.check_current_user_is_author()				
	},
	check_current_user_is_author:function(){
		var me = this;
		frappe.call({
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "validate_if_current_user_is_author",
			callback:function(r){
				console.log(r.message)
				if (r.message)
					me.render_assign_training();
			}
		})
	},
	render_assign_training:function(){
		var me = this;
		$("div.page-form.row").append("<button class='btn btn-default btn-xs input-sm btn-sm'  style='width:150px;' id='assign_training' >Assign Training</button>")		
		$("#assign_training").click(function(){
			me.render_dialog_for_assign_training()
		})
	},
	render_dialog_for_assign_training:function(){
		var me = this;
		this.dialog = new frappe.ui.Dialog({
			title:__("Assign Training"),
			fields: [
				{fieldtype: "Link", fieldname: "tr_nm", label: __("Training Name"), options: "Training",
					get_query: function() {
						return {
							query:"mycfo.trainings.page.training_dashboard.training_dashboard.get_training_list"
						}
					}
				},
				{fieldtype: "Link", fieldname: "employee", label: __("Employee"), options: "Employee",
					get_query: function() {
						return {
							query:"mycfo.trainings.page.training_dashboard.training_dashboard.get_employee_list",
							filters:{"training_name":me.dialog.fields_dict.tr_nm.input.value}
						}
					}
				},
				
				{fieldtype:"Button", fieldname:"add_training", label:"Add Training"},
				{fieldtype: "HTML", fieldname: "assign_tr_html"},
			],
			primary_action_label:"Assign",
			primary_action:function () {
				if(me.assign_training_data.length){
					me.start_assign_training();
					me.dialog.hide();
				}else{
					msgprint("No employee selected to assign Training.")
				}
			}
		});
		this.dialog.show();
		this.init_for_add_training();
		this.init_for_tr_change();
	},
	init_for_tr_change:function() {
		var me = this;
		this.dialog.fields_dict.tr_nm.$input.on("change", function(){
			console.log("in tr change")
			me.dialog.fields_dict.employee.input.value = ""
		})
	},
	start_assign_training:function () {
		var me = this;
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ...........",
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "assign_forced_training",
			args:{"request_data": me.assign_training_data},
			callback:function(r){
				frappe.msgprint("Training assigned successfully.")
			}
		})
	},
	init_for_add_training:function(){
		var me = this;
		this.assign_training_data = [];
		this.dialog.fields_dict.add_training.$input.click(function(){
			if (me.check_for_duplicate_training()){
				me.render_table_head();
				me.render_table_row();
			}	
		})
	},
	check_for_duplicate_training:function(){
		var me = this;
		var tr_nm = this.dialog.fields_dict.tr_nm.input.value;
		var emp = this.dialog.fields_dict.employee.input.value
		function isduplicate(args) {
 			 return args.training_name == tr_nm && args.employee == emp
		};
		var filtered_tr_data = this.assign_training_data.filter(isduplicate);
		if (filtered_tr_data.length){
			msgprint(repl("Training table already contains employee %(employee)s for training %(training)s",{training:tr_nm, employee:emp}))
			return false
		}
		return true	
	},
	render_table_head:function(){
		if (! $(cur_dialog.body).find("#tr-table").length){
			$(this.dialog.fields_dict.assign_tr_html.$wrapper).append("<table class='table' id='tr-table'><thead><tr class='row'><th class='col-xs-5'>Training Name</th>\
			<th class='col-xs-5'>Employee</th><th class='col-xs-2'>Remove</th></tr></thead><tbody class='tr-tbody'></tbody></table>")
		}
	},
	render_table_row:function(){
		var me = this;
		args = {"training_name":this.dialog.fields_dict.tr_nm.input.value , "employee":this.dialog.fields_dict.employee.input.value}
		$(cur_dialog.body).find(".tr-tbody").append(frappe.render_template("assign_training_row", args));
		this.assign_training_data.push(args);
		this.remove_table_row()
	},
	remove_table_row:function(){
		var me = this;
		$(cur_dialog.body).find(".icon-remove").click(function(){
			var tr_nm = $(this).attr("tr-nm")
			var emp = $(this).attr("emp")
			var filtered_tr_data = me.assign_training_data.filter(function(args) {
 			 	return !(args.training_name == tr_nm && args.employee == emp)
			});
			me.assign_training_data = filtered_tr_data
			$(this).parent().parent().remove();
		})	
	},
	init_for_my_trainings:function(){
		var me = this;
		new MyTrainings(this.wrapper, this.page, this.body, this.footer, this.filters)
	}


})












MyTrainings = Class.extend({
	init:function(wrapper, page, body, footer, filters){
		this.wrapper = wrapper;
		this.page = page;
		this.body = body;
		this.footer = footer;
		this.filters = filters;
		this.make();
	},
	make:function(){
		this.init_for_my_trainings_trigger();
	},
	init_for_my_trainings_trigger:function(){
		var me = this;
		console.log(this.filters)
		this.filters.my_training.$input.on("click", function(){
			me.empty_dashboard_and_footer();
			me.get_my_trainings_data();
		})
	},
	get_my_trainings_data:function () {
		var me = this;
		frappe.call({
				freeze: true,
				freeze_message:"Please wait ...........",
				module:"mycfo.trainings",
				page: "training_dashboard",
				method: "get_my_trainings",
				callback:function(r){
					if(r.message)
						me.render_my_trainings_page(r.message);
					else
						msgprint("No Trainings found aginst user {0} ".replace("{0}", frappe.user.name))
				}
		})	
	},
	render_my_trainings_page:function(tr_data){
		console.log(tr_data)
		$('[data-toggle="tooltip"]').tooltip(); 
		$(this.body).html(frappe.render_template("my_training", {"my_training":tr_data}));
		this.init_for_training_download();
		this.init_for_feedback_sharing();
		this.init_for_start_test();
		this.check_answer_sheet();	
	},
	empty_dashboard_and_footer:function(){
		$(".training-dashboard").html("");
		$(".training-footer").html("");
	},
	init_for_training_download:function(){
		var me = this;
		$(this.body).find(".tr-download").click(function(){
			tr_url =$(this).closest("tr").attr("tr-url") 
			tr_name = $(this).closest("tr").attr("tr-nm") 
			tr_url = tr_url.replace(/#/g, '%23');
			window.open(tr_url)
			me.make_download_entry(tr_name, this)
		})
	},
	make_download_entry:function(tr_name, button_this){
		frappe.call({
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "create_training_download_log",
			args:{"training_name":tr_name },
			callback:function(r){
				$(button_this).closest("tr").find(".tr-feedback").attr("disabled", false)
				$(button_this).closest("tr").find(".tr-start-assessment").attr("disabled", false)
				$(button_this).closest("tr").find(".td-start-test").attr("title", "")
				$(button_this).closest("tr").find(".td-review").attr("title", "")
			}
		})
	},
	init_for_feedback_sharing:function(){
		var me = this;
		$(this.body).find(".tr-feedback").click(function(){
			var training_name = $(this).closest("tr").attr("tr-nm") 
			me.render_share_feedback_popup(training_name)
		})
	},
	check_answer_sheet:function(){
		$(this.body).find(".tr-check-result").click(function(){
			frappe.set_route("Form", "Answer Sheet", $(this).attr("tr-ans-sheet"))
		})
	},
	render_share_feedback_popup:function(training_name){
		var me = this;
		this.dialog = new frappe.ui.Dialog({
			title:__("Share Feedback"),
			fields: [
				{fieldtype: "HTML", fieldname: "share_feedback_html"},
				{fieldtype: "Small Text", fieldname: "feedback_text_area", label: __("Your Feedback"), options: ""},
			],
			primary_action_label: __("Submit"),
			primary_action: function() {
				var my_ratings = $(me.dialog.fields_dict.share_feedback_html.$wrapper).find(".rateYo").rateYo("rating");
				var comments =  me.dialog.fields_dict.feedback_text_area.input.value;
				var request_data = {"training_name":training_name, "ratings":my_ratings, "comments":comments};
				me.submit_review(request_data);
				me.dialog.hide();
			}

		});
		console.log($(this.dialog.fields_dict.share_feedback_html.$wrapper))
		console.log($(this.dialog.fields_dict))
		$(this.dialog.fields_dict.share_feedback_html.$wrapper).append("<div class='row'><div class='col-xs-3'><label class='control-label'>Your Rating</label></div>\
			<div class='col-xs-9 rateYo'></div></div>")		
		this.render_ratings();		
		this.dialog.show();
	},
	render_ratings:function(){
		$(".rateYo").rateYo({
	    	precision: 2,
	    	starWidth: "20px"
	  	});
	},
	submit_review:function(request_data){
		var me = this;
		frappe.call({
			freeze: true,
			freeze_message:"Please wait ...........",
			module:"mycfo.trainings",
			page: "training_dashboard",
			method: "create_training_review",
			args:{"request_data":request_data },
			callback:function(r){
				msgprint("Training {0} review submitted successfully.".replace("{0}",request_data.training_name))			
			}
		})
	},
	init_for_start_test:function(){
		var me = this;
		$(this.body).find(".tr-start-assessment").click(function(){
			console.log("in start asssessment")
		})

	}



})




