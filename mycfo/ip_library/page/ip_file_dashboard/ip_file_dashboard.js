frappe.pages['ip-file-dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Search & Download IP File',
		single_column: true
	});
	frappe.breadcrumbs.add("IP Library");
	$("<div class='ip-file-dashboard'</div>").appendTo(page.body);
	console.log(page)
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
		console.log(this.body);
		console.log(this.footer);
	},
	render_search_filters:function(){
		var me = this;	
		me.init_for_filter_rendering();
		me.init_for_search_trigger();
		
	},
	init_for_latest:function(){
		var me = this;
		this.get_latest_upload_count();
		this.init_for_pending_requests();
		this.init_for_my_downloads();
		this.filters.latest_uploads.$input.click(function(){
			me.filters.search_type.input.value = "Latest Uploads";
			me.empty_dashboard_and_footer();
			me.init_for_latest_uploads(0, me);
		})
	},
	get_latest_upload_count:function(){
		frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "get_latest_upload_count",
			callback:function(r){
				console.log(r.message)
				$("button[data-fieldname=latest_uploads]").append("<span class ='badge custom-badge'>{0}</span>".replace('{0}', r.message.latest_records));
				$("button[data-fieldname=my_requests]").append("<span class ='badge custom-badge'>{0}</span>".replace('{0}', r.message.pending_requests));
				$("button[data-fieldname=my_downloads]").append("<span class ='badge custom-badge'>{0}</span>".replace('{0}', r.message.total_downloads));

			}
		})
	},
	init_for_pending_requests:function(){
		var me = this;
		this.filters.my_requests.$input.click(function(){
			me.filters.search_type.input.value = "My Requests";
			me.empty_dashboard_and_footer();
			me.get_my_pending_requests(0, me);
		})
	},
	init_for_my_downloads:function(){
		var me = this;
		this.filters.my_downloads.$input.click(function(){
			me.filters.search_type.input.value = "My Downloads";
			me.empty_dashboard_and_footer();
			me.get_my_downloads(0, me);
		})
	},
	init_for_filter_rendering:function(){
		var me = this;
		$("div.page-form.row").append("<div class='form-group frappe-control col-xs-4' id='global-search-div'><input type='text'\
			id='global_search' class ='form-control' placeholder='Search IP File'></div>")
		search_filters = [
					{"name":"search", "fieldname":"search", "label":"Search", "fieldtype":"Button", "options":"" , "icon":"icon-search"},
					{"name":"latest_uploads", "fieldname":"latest_uploads", "label":"Latest Uploads", "fieldtype":"Button", "options":"" , "icon":"icon-search"},
					{"name":"my_requests", "fieldname":"my_requests", "label":"Pending Requests", "fieldtype":"Button", "options":"" },
					{"name":"my_downloads", "fieldname":"my_downloads", "label":"My Downloads", "fieldtype":"Button", "options":"" ,"input_css": {"background-color":"#1B8D1B"}},
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
		console.log("in global search")
		$("#global_search").autocomplete({
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
		console.log("in init_for_pagination if loop")
		this.render_pagination(total_pages);			
	},
	render_pagination:function(total_pages){
		console.log("footer")
		var me = this
		console.log(this)		
		var pagination_mapper = {"Normal Search":me.get_ip_files, "Latest Uploads":me.init_for_latest_uploads, 
		 							"My Requests":me.get_my_pending_requests, "My Downloads":me.get_my_downloads}
		if (total_pages == 0){
			msgprint("No IP File found against specified criteria.")
		}
		else if (!$('#pagination-demo').length && total_pages){
			console.log("in if")
			$('<div class="row"><div class="col-xs-11 col-xs-offset-1"><ul id="pagination-demo" class="pagination-sm"></ul></div></div>').appendTo(this.footer)
			$('#pagination-demo').twbsPagination({
				totalPages:total_pages,
				visiblePages: 3,
				initiateStartPageClick:false,
				onPageClick: function (event, page) {
					console.log(["In pagination", page])
					
					search_type = me.filters.search_type.input.value
					console.log(search_type)
					// me.get_ip_files(page - 1)
					pagination_mapper[search_type](page - 1 , me)
	
				}
			});
			this.paginaiton = $('#pagination-demo').data();
			console.log(this.paginaiton)
			this.paginaiton.twbsPagination.options.initiateStartPageClick = true;
			

		}else if($('#pagination-demo').length){
			
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
			console.log("in search");
			me.filters.search_type.input.value = "Normal Search";	
			me.search_filters = { "filters":$("#global_search").val() }
			me.empty_dashboard_and_footer();
			me.get_ip_files(0, me);
		
		});
	},
	get_ip_files:function(page_no, outer_this){
		var me = outer_this;
		console.log(["get_ip_files", page_no])
		console.log(this)
		console.log(me.search_filters);
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
		console.log("in search filters")
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
			console.log("in submit review")
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
				console.log(r.message)
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
			console.log("in request trigger")
			ip_file_name = $(this).closest(".panel").attr("ip-file-name")
			file_name = $(this).closest(".panel").attr("file-name")
			me.make_download_request(ip_file_name, file_name, this);
		})
	},
	make_download_request:function(ip_file_name, file_name, request_button){
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "create_ip_download_request",
			args:{"ip_file_name":ip_file_name},
			callback:function(r){
				console.log(r.message)
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
		return frappe.call({
			freeze: true,
			freeze_message:"Please wait ..............",
			module:"mycfo.ip_library",
			page: "ip_file_dashboard",
			method: "create_ip_download_log",
			args:{"file_name":ip_file_name},
			callback:function(r){
				console.log("in callback")
				console.log($(panel))
				if(!($(panel).find(".tab-content div.my-feedback").length)){
					console.log("in if")
					index = $(panel).attr("id")
					console.log(index)
					console.log($(panel).find("ul"))
					$(panel).find("ul").append('<li><a data-toggle="tab" href="#feedback-menu{0}" class="feedback-li">Write Feedback</a></li>'.replace("{0}", index));
					$(panel).find(".tab-content").append(frappe.render_template("ip_file_feedback_tab", {"index":index }));
					me.render_ratings();
					me.init_for_feedback_submission();
				}

			}

		})

	},
	render_feedback_tab_after_download:function(){

	}
})