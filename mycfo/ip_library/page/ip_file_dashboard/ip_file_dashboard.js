frappe.pages['ip-file-dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Search & Download IP File',
		single_column: true
	});
	frappe.breadcrumbs.add("IP Library");
	$("<div class='ip-file-dashboard'</div>").appendTo(page.body);
	new IpFileDashboard(wrapper, page);
}


IpFileDashboard = Class.extend({
	init:function(wrapper, page){
		this.page = page;
		this.wrapper = wrapper;
		this.body = $(page.body).find(".ip-file-dashboard");
		this.footer = $( "<div class='ip-file-footer'</div>" ).insertAfter(this.body)
		this.filters = {};
		this.make();
	},
	make:function(){
		this.render_search_filters();
	},
	render_search_filters:function(){
		var me = this;	
		me.init_for_filter_rendering();
		me.init_for_search_trigger();
		
	},
	init_for_latest:function(){
		var me = this;
		this.get_latest_upload_count();
		this.filters.latest_uploads.$input.click(function(){
			me.filters.search_type.input.value = "Latest Uploads";
			me.empty_dashboard_and_footer();
			me.init_for_latest_uploads(0, me);
		})
	},
	get_latest_upload_count:function(){
		var me = this;
		frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "get_latest_upload_count",
			callback:function(r){
				$("button[data-fieldname=latest_uploads]").append("<span class ='badge pull-right custom-badge'>{0}</span>".replace('{0}', r.message.latest_records));
				$(me.page.page_form).append(frappe.render_template("ip_file_filters", {"pending_requests":r.message.pending_requests, "my_downloads":r.message.total_downloads}));				
				me.init_for_pending_requests();
				me.init_for_my_downloads();	
			}
		})
	},
	init_for_pending_requests:function(){
		var me = this;
		$("#pending-requests").click(function(){
			me.filters.search_type.input.value = "My Requests";
			me.empty_dashboard_and_footer();
			me.get_my_pending_requests(0, me);
		})
	},
	init_for_my_downloads:function(){
		var me = this;
		$("#my-downloads").click(function(){
			me.filters.search_type.input.value = "My Downloads";
			me.empty_dashboard_and_footer();
			me.get_my_downloads(0, me);
		})
	},
	init_for_filter_rendering:function(){
		var me = this;
		$(this.page.page_form).append("<div class='form-group frappe-control col-xs-4 col-xs-offset-1' id='global-search-div'><input type='text'\
			id='global_search' class ='form-control' placeholder='Search IP File'></div>")
		search_filters = [
					{"name":"search", "fieldname":"search", "label":"Search", "fieldtype":"Button", "options":"" , "icon":"icon-search"},
					{"name":"latest_uploads", "fieldname":"latest_uploads", "label":"Latest Uploads", "fieldtype":"Button", "options":"" , "icon":"icon-search"},
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
		me.init_for_latest();
		me.init_for_global_search();
		
	},
	init_for_global_search:function(){
		$(this.wrapper).find("#global_search").autocomplete({
			source:function(request, response){
				frappe.call({
					module:"mycfo.ip_library",
					page: "ip_file_dashboard",
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
	init_for_latest_uploads:function(page_no, outer_this){
		var me = outer_this;
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "get_latest_uploaded_documents",
			args:{"search_filters":{"page_no":page_no}},
			callback:function(r){
				me.run_post_search_operation(r)
			}
		})
	},
	init_for_pagination:function(total_pages){
		var me = this;
		this.render_pagination(total_pages);			
	},
	render_pagination:function(total_pages){
		var me = this	
		var pagination_mapper = {"Normal Search":me.get_ip_files, "Latest Uploads":me.init_for_latest_uploads, 
		 							"My Requests":me.get_my_pending_requests, "My Downloads":me.get_my_downloads}
		if (total_pages == 0){
			msgprint("No IP File found against specified criteria.")
		}
		else if (! $(me.footer).find('#pagination-demo').length && total_pages){
			$('<div class="row"><div class="col-xs-10 col-xs-offset-2"><ul id="pagination-demo" class="pagination-sm"></ul></div></div>').appendTo(this.footer)
			$(me.footer).find('#pagination-demo').twbsPagination({
				totalPages:total_pages,
				visiblePages: 3,
				initiateStartPageClick:false,
				onPageClick: function (event, page) {					
					search_type = me.filters.search_type.input.value
					// me.get_ip_files(page - 1)
					pagination_mapper[search_type](page - 1 , me)
	
				}
			});
			this.paginaiton = $(me.footer).find('#pagination-demo').data();
			this.paginaiton.twbsPagination.options.initiateStartPageClick = true;
			

		}else if($(me.footer).find('#pagination-demo').length){
			
			this.paginaiton.twbsPagination.options.totalPages = total_pages;
			// this.paginaiton.twbsPagination.options.initiateStartPageClick = total_pages == 0 ? false :true;

		}

	},
	toggle_previous_button:function(css_property){
		$(".previous").css("display", css_property)
	},
	init_for_search_trigger:function(){
		var me = this;
		me.filters.search.$input.on("click", function() {
			me.filters.search_type.input.value = "Normal Search";	
			me.search_filters = { "filters":$("#global_search").val() }
			me.empty_dashboard_and_footer();
			me.get_ip_files(0, me);
		
		});
	},
	get_ip_files:function(page_no, outer_this){
		var me = outer_this;
		me.search_filters["page_no"] = page_no;
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "get_published_ip_file",
			args:{"search_filters":me.search_filters},
			callback:function(r){
				me.run_post_search_operation(r)
							
			}
		})
	},
	get_my_pending_requests:function(page_no, outer_this){
		var me = outer_this;
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "get_my_pending_requests",
			args:{"search_filters":{"page_no":page_no}},
			callback:function(r){
				me.run_post_search_operation(r)
							
			}
		})

	},
	get_my_downloads:function(page_no, outer_this){
		var me = outer_this;
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "get_my_download",
			args:{"search_filters":{"page_no":page_no}},
			callback:function(r){
				me.run_post_search_operation(r)
							
			}
		})
	},
	run_post_search_operation:function(r){
		var me = this;
		$(me.body).html(frappe.render_template("ip_file", {"file_data":r.message[0]}));
		me.render_ratings();
		me.render_avg_ratings(r.message[0]);
		me.init_for_feedback_submission();
		me.init_for_download_request();
		me.init_for_pagination(r.message[1]);
	},
	render_ratings:function(){
		$(".rateYo").rateYo({
	    	precision: 2,
	    	starWidth: "20px"
	  	});  	

	},
	render_avg_ratings:function(file_data){
		$.each(file_data, function(index, value){
			$("#avg-rateYo{0}".replace("{0}",index)).rateYo({
		    	precision: 2,
		    	starWidth: "20px",
		    	rating:value.avg_ratings,
		    	readOnly:true
	  		});
		})
		
	},
	empty_dashboard_and_footer:function(){
		$(".ip-file-dashboard").html("");
		$(".ip-file-footer").html("");
	},
	get_search_filters:function(){
		return {
			"filters":$("#global_search").val()
		}
	},
	init_for_feedback_submission:function(){
		this.init_for_submit_button()
	},
	init_for_submit_button:function(){
		var me = this
		$(".submit-review").click(function(){
			my_parent =  $(this).closest(".tab-pane")
			my_ratings = $(my_parent).find(".rateYo").rateYo("rating");
			comments =  $(my_parent).find(".ip-text-area").val()
			file_name = $(this).closest(".panel").attr("file-name")
			if (my_ratings){
				request_data = {"file_name":file_name, "ratings":my_ratings, "comments":comments}
				me.submit_review(request_data);
				$(my_parent).find(".rateYo").rateYo("rating", 0);
				$(my_parent).find(".ip-text-area").val("")
			}
			else{
				msgprint("Ratings are mandatory to submit the review")
			}

		})
	},
	submit_review:function(request_data){
		frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "create_ip_file_feedback",
			args:{"request_data":request_data},
			callback:function(r){
				msgprint("IP document {0} review submitted successfully.".replace("{0}",request_data.file_name))			
			}

		})

	},
	init_for_download_request:function(){
		this.trigger_for_download_request();
		this.download_ip_document();

	},
	trigger_for_download_request:function(){
		var me = this;
		$(".ip-request-button").click(function(){
			ip_file_name = $(this).closest(".panel").attr("ip-file-name")
			file_name = $(this).closest(".panel").attr("file-name")
			me.init_for_projects_el_pop_up(ip_file_name, file_name, this);
			// me.make_download_request(ip_file_name, file_name, this);
		})
	},
	init_for_projects_el_pop_up:function(ip_file_name, file_name, request_button){
		var me = this;
		// console.log(this)
		this.dialog = new frappe.ui.Dialog({
						title: "Make Download Request",
						fields: [
								{"fieldtype": "Link", "label": __("Customer"), "fieldname": "customer", "reqd": 1, "options":"Customer"},
								{"fieldtype": "Link", "label": __("Employee"), "fieldname": "employee_id", "reqd": 1, "options":"Employee"},
							],
						primary_action_label: "Make Request",
						primary_action: function(doc) {
								customer = me.dialog.fields_dict.customer.input.value
								employee_id = me.dialog.fields_dict.employee_id.input.value	
								if (customer && employee_id){
									my_dict = {"ip_file_name":ip_file_name, "customer":customer, "approver":employee_id}
									me.make_download_request(file_name, request_button, my_dict)
									me.dialog.hide();
								}else{
									frappe.msgprint("Mandatory Field Employee & Customer")
								}
							}							
						})
		this.dialog.show();
		this.init_for_customer_employee_get_query()
	},
	init_for_customer_employee_get_query:function(){
		var me = this;
		this.dialog.fields_dict.customer.get_query = function(){
			return{
				query:"mycfo.ip_library.page.ip_file_dashboard.ip_file_dashboard.get_customer_list"
			}
		}

		this.dialog.fields_dict.employee_id.get_query = function(){
			return{
				query: "mycfo.ip_library.doctype.ip_file.ip_file.get_approver_list",
				filters: { "customer":me.dialog.fields_dict.customer.input.value }
			}
		}	
	},
	make_download_request:function(file_name, request_button, my_dict){
		var me = this
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "create_ip_download_request",
			args:my_dict,
			callback:function(r){
				if(r.message){
					$(request_button).attr("disabled",true)
					msgprint("IP document {0} download request created successfully.".replace("{0}",file_name));					
				}
					
			}

		})

	},
	download_ip_document:function(){
		var me = this;
		$(".ip-download-button").click(function(){
			validity = $(this).closest(".panel").attr("download-validity")
			if (me.check_for_download_validity(validity)){
				file_url = $(this).closest(".panel").attr("file-url")
				file_name = $(this).closest(".panel").attr("file-name")
				file_url = file_url.replace(/#/g, '%23');
				window.open(file_url)
				me.make_download_entry(file_name, $(this).closest(".panel"))
			} 
						
		})
	},
	check_for_download_validity:function(validity){
		if(validity){
			if (frappe.datetime.str_to_obj(validity) > frappe.datetime.str_to_obj(frappe.datetime.now_datetime())){
				return true
			}
			else{
				frappe.msgprint("Download Validity of document is expired.Please make new download request.")
				return false
			}	
		}
		return true
	},
	make_download_entry:function(ip_file_name, panel){
		var me = this
		var download_form = $(panel).attr("download-form")
		var validity = $(panel).attr("download-validity")
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "create_ip_download_log",
			args:{"file_name":ip_file_name, "download_form":download_form, "validity":validity},
			callback:function(r){
				if(!($(panel).find(".tab-content div.my-feedback").length)){
					index = $(panel).attr("id")
					$(panel).find("ul").append('<li><a data-toggle="tab" href="#feedback-menu{0}" class="feedback-li">Write Feedback</a></li>'.replace("{0}", index));
					$(panel).find(".tab-content").append(frappe.render_template("ip_file_feedback_tab", {"index":index }));
					me.render_ratings();
					me.init_for_feedback_submission();
				}

			}

		})

	}
})