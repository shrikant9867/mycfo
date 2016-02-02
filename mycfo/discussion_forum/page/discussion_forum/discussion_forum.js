frappe.provide("df.discussion_forum");
frappe.pages['discussion-forum'].on_page_load = function(parent) {
	df.discussion_forum = new df.discussion_forum(parent)
}
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
		this.get_categories();
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
		$('.layout-side-section').css("background-color","#ffffff")
		frappe.breadcrumbs.add("Discussion Forum");
		this.page.clear_menu();
		$('.form-inner-toolbar').remove()
		$('.page-form').remove()
	},
	get_discussions: function(args,paginate) {
		var me = this;
		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.get_data",
			freeze: true,
			freeze_message:"Fetching Discussions....Please wait",
			args:args,
			callback: function(r) {
				var data = r.message ? r.message[0]:{};
				var total_records = r.message ? r.message[1]:{};
				var current_page = r.message ? r.message[2]:{};
				me.render_topics(data);
				if (total_records){
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
		$(frappe.render_template("discussion",data)).appendTo(me.wrapper);
		$(me.wrapper).find('.add-comment').on("click",function(){me.show_comment_dailog(topic_name)})
		$(me.wrapper).find('.user-posts').on("click",function(){
			user = $(this).attr('data-name')
			me.get_discussions({"user":user})
		})
		if (frappe.user.has_role(['Administrator', 'System Manager', 'Central Delivery'])){
			this.page.add_menu_item(__('Assign'), function() { me.show_assign_dialog(topic_name) }, true);
		}
		me.get_comments(topic_name)
	},
	get_comments:function(topic_name,current_page){
		var me = this;
		return frappe.call({
			method: "mycfo.discussion_forum.page.discussion_forum.discussion_forum.get_comments",
			args:{"topic_name":topic_name,"page_no":current_page},
			callback: function(r) {
				data = r.message[0]
				total_pages = r.message[1]
				current_page = r.message[2]
				if (data){
					$(me.wrapper).find('#comment-list').empty()
					$(frappe.render_template("discussion_comments",
						{"comment_list":data})).appendTo($(me.wrapper).find('#comment-list'));
					me.init_pagination_comment(total_pages,current_page,topic_name)
					me.render_ratings({"comment_list":data})

				}
				else{
					$('.no-comment').toggle()
				}
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
	render_ratings:function(data){
		var me = this;
		$.each(data.comment_list, function(index, value){
			$("#avg-rateYo{0}".replace("{0}",index)).rateYo({
		    	precision: 1,
		    	starWidth: "10px",
		    	rating:value.average_rating,
		    	readOnly:true
	  		});
	  		me.toggle_ratings(index,value,topic_name)
		})

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
		$(frappe.render_template("discussion_categories",{"post":data})).appendTo(me.page_sidebar);
		$('.category').on("click",function(){
			$(me.wrapper).empty()
			$(this).siblings('.category').removeClass('active')
			$(this).addClass('active')
			category = $(this).attr('data-name')
			me.get_discussions({"category":category})
		})
		$('.head').on('click',function(){
			$('a.category').removeClass('active')
			me.get_discussions()	
		})
	},
	show_comment_dailog:function(topic_name){
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
	show_assign_dialog:function(topic_name){
		var me = this;
		if(!me.dialog) {
			me.dialog = new frappe.ui.Dialog({
				title: __('Assign Topic to Particular User'),
				fields: [
					{fieldtype:'Link', fieldname:'assign_to', options:'User',
						label:__("Assign To"),description:__("Add to To Do List Of"), reqd:true},
					{fieldtype:'Text', fieldname:'description', label:__("Description"), reqd:true},
				],
				primary_action: function() { me.assign_topic(topic_name); },
				primary_action_label: __("Assign")
			});
			me.dialog.fields_dict.assign_to.get_query = "mycfo.discussion_forum.page.discussion_forum.discussion_forum.user_query";
		}
		me.dialog.clear();
		me.dialog.show();	
	},
	assign_topic: function(topic_name) {
		var me = this;
		var args = me.dialog.get_values();
		var assign_to = me.dialog.fields_dict.assign_to.get_value();
		if(args) {
			return frappe.call({
				method:'mycfo.discussion_forum.page.discussion_forum.discussion_forum.assign_topic',
				args: $.extend(args, {
					topic_name:topic_name,
					doctype: "Discussion Topic",
					name:topic_name,
					assign_to: assign_to
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
})