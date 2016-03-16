frappe.provide("df.discussion_forum");
frappe.pages['discussion-forum'].on_page_load = function(parent) {
	df.discussion_forum = new df.discussion_forum(parent)
}
var is_sorted=false;
df.discussion_forum = Class.extend({
	init: function(parent) {
		/*
			1.Get All Discussions filter by date
			2.Render them in page
			3.Initialize pagination
			4.When Clicked on discussion then move to respective page
		*/
		this.parent = parent;
		this.make_page();
		this.get_discussions({});
		this.make_sidebar()
	},
	make_page: function() {
		if (this.page)
			return;
		frappe.ui.make_app_page({
			parent:this.parent,
			title:'Discussion Forum',
		});
		this.page = this.parent.page;
		this.wrapper = $('<div></div>').appendTo(this.page.body);
		this.page_sidebar = $('<div></div>').appendTo(this.page.sidebar.empty());
		$('.layout-side-section').css({"background-color":"#ffffff","padding-top":"10px"})
		frappe.breadcrumbs.add("Discussion Forum");
		this.page.clear_menu();
		$('.form-inner-toolbar').remove()
		$('.page-form').remove()
		this.page.set_primary_action(__('Create New Topic'), function() { new_doc("Discussion Topic") }, true);
		this.page.add_menu_item(__('Refresh'), function() { frappe.ui.toolbar.clear_cache() }, true);
		$(frappe.render_template("discussion_sidebar",{"post":{}})).appendTo(this.page_sidebar);
		var me = this;
		$('.home').on('click',function(){
			me.user_name.input.value = ''
			$('a.category').removeClass('active')
			$('a.self-assign').removeClass('active')
			me.search_topic.input.value = ''
			me.get_discussions() 
		})
	},
	get_discussions: function(args,paginate) {
		var me = this;
		category =  $('.category.active').attr('data-name')
		assigned_to_me = $('.self-assign.active').attr('data-name')
		if (!args) args = {}

		if (category){
			args["category"] = category
		}
		if (me.user_name ){
			if (me.user_name.input.value){
				args["user"] = me.user_name.input.value	
			}
		}
		if (assigned_to_me){
			args["assigned_to_me"] = assigned_to_me
		}

		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.get_data",
			freeze: true,
			freeze_message:"Fetching Discussions....Please wait",
			args:args,
			callback: function(r) {
				var data = r.message ? r.message[0]:{};
				var total_records = r.message ? r.message[1]:{};
				var current_page = r.message ? r.message[2]:{};
				var paginate = r.message ? r.message[3]:{};
				me.render_topics(data);
				if (total_records && paginate){
					me.init_pagination(total_records,current_page)
				}
				
			}
		});
	},
	init_pagination:function(total_pages,current_page){
		var me =  this;
		paginate = false
		$('.more-block-list').removeClass('hide')
		if (!$('.paginaiton').length){
			$('.paginate').twbsPagination({
					totalPages:total_pages,
					visiblePages: 3,
					startPage:current_page,
					initiateStartPageClick:false,
					onPageClick: function (event, page) {
						var paginate = true					
						me.get_discussions({"page_no":page-1},paginate)
					}
			});
			paginaiton = $('.paginate').data();
			paginaiton.twbsPagination.options.initiateStartPageClick = true;
		}else if($('.paginaiton').length){
			paginaiton = $('.paginate').data();
			paginaiton.twbsPagination.options.totalPages = total_pages;
			paginaiton.twbsPagination.options.startPage = current_page;
		}

	},
	render_topics: function(data) {
		var me = this;
		$(me.wrapper).empty()
		me.page.clear_menu();
		this.page.add_menu_item(__('Refresh'), function() { frappe.ui.toolbar.clear_cache() }, true);
		$(frappe.render_template("discussion_forum",{"post":data})).appendTo(me.wrapper);
		$(me.wrapper).find('.title').on("click",function(){
			topic_name = $(this).attr("data-name") 
			me.make_topic(topic_name)
		})
		category = $('.category.active').attr('data-label')
		if (category){
			$('.dis-cat').empty().append(category)
		}
		else{
			$('.dis-cat').empty().append('ALL')	
		}
	},
	make_topic:function(topic_name){
		var me = this;
		$(me.wrapper).empty()
		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.get_post",
			freeze: true,
			freeze_message:"Fetching Discussion....Please wait",
			args:{"topic_name":topic_name},
			callback: function(r) {
				me.render_topic(r.message,topic_name)
			}
		});
	},
	render_topic:function(data,topic_name){
		var me = this;
		$(me.wrapper).empty()
		me.page.clear_menu();
		$(frappe.render_template("discussion",data)).appendTo(me.wrapper);
		$(me.wrapper).find('.add-comment').on("click",function(){me.show_comment_dailog(topic_name)})
		$(me.wrapper).find('.sort-comment').on("click",function(){me.sort_comments(topic_name)})		
		$('.upload-file').find('.upload-file') .on("click",function(){me.sort_comments(topic_name)})		
		// $(me.wrapper).find('.upload-file').on("click",function(){me.sort_comments(topic_name)})		
		$(me.wrapper).find('.user-posts').on("click",function(){
			user = $(this).attr('data-name')
			me.get_discussions({"user":user})
		})

		if (frappe.user.has_role(['Administrator', 'System Manager', 'Central Delivery'])){
			this.page.add_menu_item(__('Refresh'), function() { frappe.ui.toolbar.clear_cache() }, true);
			this.page.add_menu_item(__('Assign'), function() { me.show_assign_dialog(topic_name,data) }, true);
		}
		me.get_comments(topic_name)
	},
	get_comments:function(topic_name,current_page){
		var me = this;
		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.get_comments",
			args:{"topic_name":topic_name,"page_no":current_page,"is_sorted":is_sorted},
			callback: function(r) {
				data = r.message[0]
				total_pages = r.message[1]
				current_page = r.message[2]
				paginate = r.message[3]
				if (data){
					$(me.wrapper).find('#comment-list').empty()
					$(frappe.render_template("discussion_comments",
						{"comment_list":data})).appendTo($(me.wrapper).find('#comment-list'));
					if (paginate){
						me.init_pagination_comment(total_pages,current_page,topic_name)
					}
					me.render_ratings({"comment_list":data},topic_name)
				}
				else{
					$('.no-comment').toggle()
				}
			}
		});
	},
	sort_comments:function(topic_name,current_page){
		if(is_sorted == true){
			is_sorted=false;
		}
		else{
			is_sorted=true;
		}
		var me = this;
		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.sort_comments",
			args:{"topic_name":topic_name,"page_no":current_page},
			callback: function(r) {
				data = r.message[0]
				total_pages = r.message[1]
				current_page = r.message[2]
				paginate = r.message[3]
				if (data){
					$(me.wrapper).find('#comment-list').empty()
					$(frappe.render_template("discussion_comments",
						{"comment_list":data})).appendTo($(me.wrapper).find('#comment-list'));
					if (paginate){
						me.init_pagination_comment(total_pages,current_page,topic_name)
					}
					me.render_ratings({"comment_list":data},topic_name)
				}
				else{
					$('.no-comment').toggle()
				}
				me.make_topic(topic_name);
			}
		});
	},
	init_pagination_comment:function(total_pages,current_page,topic_name){
		var me =  this;
		paginate = false
		$('.more-block-comment').removeClass('hide')
		if (!$('.paginaiton').length){
			$('.paginate-comment').twbsPagination({
					totalPages:total_pages,
					visiblePages: 3,
					startPage:current_page,
					initiateStartPageClick:false,
					onPageClick: function (event, page) {
						var paginate = true		
						me.get_comments(topic_name,page-1)
					}
			});
			paginaiton = $('.paginate-comment').data();
			paginaiton.twbsPagination.options.initiateStartPageClick = true;
		}else if($('.paginaiton').length){
			paginaiton = $('.paginate-comment').data();
			paginaiton.twbsPagination.options.totalPages = total_pages;
			paginaiton.twbsPagination.options.startPage = current_page;
		}

	},
	render_ratings:function(data,topic_name){
		var me = this;
		$.each(data.comment_list, function(index, value){
			$("#number_of_users{0}".replace("{0}",index)).val(data['comment_list'][index]['no_of_users'],data['comment_list'][index]['average_rating']);
			/*$("#users_average_rating{0}".replace("{0}",index)).val(data['comment_list'][index]['average_rating']);*/
			$("#avg-rateYo{0}".replace("{0}",index)).rateYo({
		    	precision: 1,
		    	starWidth: "10px",
		    	rating:value.average_rating,
		    	readOnly:true
	  		});
	  		me.toggle_ratings(index,value,topic_name)
		})
		//start upload code
		$.each(data.comment_list, function(index, value){
			$(".upload-file{0}".replace("{0}",index)).on("click",function(){
				$upf=$(".upload-file{0}".replace("{0}",index))
				abc=$upf.attr("data-name")
				var me = this;
				args={
					from_form: 1,
					doctype: "Comment",
					docname: abc,
				}
				this.dialog = frappe.ui.get_upload_dialog({
					"args": args,
					"callback": function(attachment, r) { me.attachment_uploaded(attachment, r) },
				});
				this.dialog.show();	
	  		})

		})
		//end upload code

	},
	toggle_ratings:function(index,value,topic_name){
		var me = this;
		if (value.user_rating){
			$ratings = $(".show_rating{0}".replace("{0}",index))
			$ratings.removeClass("hidden")	
			$ratings.rateYo({precision: 1,
		    	starWidth: "10px",
		    	rating:value.user_rating,
		    	readOnly:true
	  		});
		}
		else{
			$ratings = $(".edit_rating{0}".replace("{0}",index))	
			$(".add_rating{0}".replace("{0}",index)).removeClass("hidden")
			$ratings.rateYo({
				precision: 1,
		    	starWidth: "10px",
		    	readOnly:false
	  		});
	  		$(".rate_topic{0}".replace("{0}",index)).on("click",function(){
	  			$ratings = $(".edit_rating{0}".replace("{0}",index))
	  			rating  = $ratings.rateYo("rating");
	  			me.add_rating(rating,value,index,topic_name)
	  		})
		}
	},
	add_rating:function(rating,value,index,topic_name){
		var me = this;
		return frappe.call({
				method:'mycfo.discussion_forum.page.discussion_forum.discussion_forum.add_rating',
				args:{"rating":rating,"comment":value.name,"topic_name":topic_name},
				callback: function(r,rt) {
					if(!r.exc) {
						$(".show_rating{0}".replace("{0}",index)).empty()
						$(".add_rating{0}".replace("{0}",index)).addClass("hidden")
						//me.render_topic(r.message,topic_name)
						value["user_rating"] = rating
					/*	$("#avg-rateYo{0}".replace("{0}",index)).empty()*/
						me.toggle_ratings(index,value,topic_name)
						$("#avg-rateYo{0}".replace("{0}",index)).rateYo({
		    				precision: 1,
		    				starWidth: "10px",
		    				rating:r.message.average_rating,
		    				readOnly:true
	  					});
					}
				},
				btn: this
			});

	},
	make_sidebar:function(){
		var me = this;
		me.get_categories()
		me.make_search()
		me.make_user_filter()
		me.render_assign()

	},
	render_assign:function(){
		var me = this;
		$('.self-assign').on("click",function(){
			$(me.wrapper).empty()
			$('a.category').removeClass('active')
			$(this).addClass('active')
			assigned_to_me = $(this).attr('data-name')
			me.get_discussions({"assigned_to_me":assigned_to_me})
		})
	},
	get_categories:function(){
		var me = this;
		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.get_categories",
			callback: function(r) {
				var data = r.message;
				me.render_categories(data)
			}
		});
	},
	render_categories:function(data){
		var me = this;
		$(frappe.render_template("discussion_categories",{"post":data})).appendTo($('.cat'));
		$('.category').on("click",function(){
			$(me.wrapper).empty()
			$(this).siblings('.category').removeClass('active')
			$('a.self-assign').removeClass('active')
			$(this).addClass('active')
			category = $(this).attr('data-name')
			me.get_discussions({"category":category})
		})
		$('.head').on('click',function(){
			$('a.category').removeClass('active')
			$('a.self-assign').removeClass('active')
			me.get_discussions()	
		})
	},
	make_search:function(){
		var me = this;
		this.search_topic = frappe.ui.form.make_control({
			df: {
				"fieldtype": "Link",
				"options": "Discussion Topic",
				"label": "Search Topic",
				"fieldname": "topic",
				"placeholder":"Search Topic"
			},
			parent:$('.top'),
			only_input: true,
		});
		this.search_topic.make_input();
		$('<button btn btn-primary btn-sm primary-action id="get-topic">\
			Get Topic</button>').on("click",function(){
				$('a.category').removeClass('active')
				$('a.self-assign').removeClass('active')
				me.user_name.input.value = ''
				me.make_topic(me.search_topic.input.value)
			}).appendTo('.top').css({"background-color":"#0072BC","color":"#ffffff","border-radius":"1px"})
	},
	make_user_filter:function(){
		var me = this;
		this.user_name = frappe.ui.form.make_control({
			df: {
				"fieldtype": "Link",
				"options": "Employee",
				"label": "Search According to Employee",
				"fieldname": "user",
				"placeholder":"Search on Employee"
			},
			parent:$('.usr'),
			only_input: true,
		});
		this.user_name.make_input();
		$('<button btn btn-primary btn-sm primary-action>\
			Search</button>').on("click",function(){
				/*$('a.category').removeClass('active')*/
				$('a.self-assign').removeClass('active')
				me.search_topic.input.value = ''
				me.get_discussions({"user":me.user_name.input.value})
			}).appendTo('.usr').css({"background-color":"#0072BC","color":"#ffffff","border-radius":"1px"})
	},
	/*show_comment_dailog:function(topic_name){
		var me = this;
		if(!me.dialog) {
			me.dialog = new frappe.ui.Dialog({
				title: __('Comment on Topic'),
				fields: [
					{fieldtype:'Long Text', fieldname:'comment', label:__("Comment")},
				],
				primary_action: function() { me.add_comment(topic_name); },
				primary_action_label: __("Comment")
			});
		}
		me.dialog.clear();
		me.dialog.show();
	},*/
	show_comment_dailog:function(topic_name){
		var me = this;
		me.dialog = new frappe.ui.Dialog({
			title: __('Comment on Topic'),
			fields: [
				{fieldtype:'Long Text', fieldname:'comment', label:__("Comment")},
			],
			primary_action: function() { me.add_comment(topic_name); },
			primary_action_label: __("Comment")
		});
		me.dialog.show();
	},
	add_comment: function(topic_name) {
		var me = this;
		var args = me.dialog.get_values();
		if(args) {
			return frappe.call({
				method:'mycfo.discussion_forum.page.discussion_forum.discussion_forum.add_comment',
				args: $.extend(args, {
					topic_name:topic_name
				}),
				callback: function(r,rt) {
					if(!r.exc) {
						me.make_topic(topic_name)
						me.dialog.hide()
					}
				},
				btn: this
			});
		}
	},
	show_assign_dialog:function(topic_name,data){
		var me = this;
		me.dialog = new frappe.ui.Dialog({
			title: __('Assign Topic to Multiple User'),
			fields: [
				{fieldtype:'Link', fieldname:'assign_to', options:'User',
					label:__("Assign To"),description:__("Add to To Do List Of")},
				{fieldtype:'Text', fieldname:'description', label:__("Description"), reqd:true},
				{fieldtype:'Button', fieldname:'add_users', label:__("Add Users")},
				{fieldtype: 'HTML', fieldname: 'assign_tr_html'},
			],
			primary_action: function() { me.assign_topic(topic_name); },
			primary_action_label: __("Assign")
		});
		/*me.dialog.fields_dict.assign_to.get_query = "mycfo.discussion_forum.page.discussion_forum.discussion_forum.user_query";*/
		me.dialog.fields_dict['assign_to'].get_query = function(){
			return{ 
				query: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.users_query",
				filters: {
					'doc': data['owner'],
					'doc_name':topic_name
				}
			}
		}		
		me.dialog.show();
		me.init_for_add_users();	
	},

	init_for_add_users: function(){
		var me = this;
		this.assign_topic_data = [];
		this.dialog.fields_dict.add_users.$input.click(function(){
			if (me.check_for_duplicate_users()){
				me.render_table_head();
				me.render_table_row();
				me.dialog.fields_dict.assign_to.input.value = ''
			}
		})
	},
	
	check_for_duplicate_users: function(){
		var me = this;
		var emp = this.dialog.fields_dict.assign_to.input.value
		function isduplicate(args) {
 			return args.employee == emp
		};
		var filtered_tr_data = this.assign_topic_data.filter(isduplicate);
		if (filtered_tr_data.length){
			msgprint(repl("Assign table already contains user %(employee)s",{employee:emp}))
			me.dialog.fields_dict.assign_to.input.value = ''
			return false
		}
		return true	
	},


	render_table_head:function(){
		if (! $(cur_dialog.body).find("#tr-table").length){
			$(this.dialog.fields_dict.assign_tr_html.$wrapper).append("<table class='table' id='tr-table'><thead><tr class='row'>\
				<th class='col-xs-4'>User</th><th class='col-xs-4'> </th><th class='col-xs-4'>Remove</th></tr></thead><tbody class='tr-tbody'></tbody></table>")
		}
	},

	render_table_row:function(){
		var me = this;
		args = {"employee":this.dialog.fields_dict.assign_to.input.value ,"description":this.dialog.fields_dict.description.input.value}
		$(cur_dialog.body).find(".tr-tbody").append(frappe.render_template("assign_topic_row", args));
		this.assign_topic_data.push(args);
		this.remove_table_row()
	},

	remove_table_row:function(){
		var me = this;
		$(cur_dialog.body).find(".icon-remove").click(function(){
			var emp = $(this).attr("emp")
			var filtered_tr_data = me.assign_topic_data.filter(function(args) {
 			 	return !(args.employee == emp)
			});
			me.assign_topic_data = filtered_tr_data
			$(this).parent().parent().remove();
		})	
	},

	assign_topic: function(topic_name) {
		var me = this;
		var args = me.dialog.get_values();
		var employee_list = []
		if(this.assign_topic_data.length){
			for(var i = 0 ; i < this.assign_topic_data.length ; i++){
				employee_list.push(this.assign_topic_data[i].employee);	
			}
			var assign_emp = employee_list
			return frappe.call({
				method:'mycfo.discussion_forum.page.discussion_forum.discussion_forum.assign_topic',
				args: $.extend(args, {
					topic_name:topic_name,
					doctype: "Discussion Topic",
					name:topic_name,
					assign_to: assign_emp
				}),
				callback: function(r,rt) {
					if(!r.exc) {
						me.make_topic(topic_name)
						me.dialog.hide()
					}
				},
				btn: this
			});
		}
		else{
			msgprint(repl("Click On Add user "))
		}	
	},
})