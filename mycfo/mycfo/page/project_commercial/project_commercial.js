frappe.pages['Project Commercial'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Project Commercial',
		single_column: true
	});
	$("#main-div").remove();
	$("<div class='user-settings' id ='main-div'></div>").appendTo(page.main);

	wrapper.project = new Project(wrapper);
}


frappe.pages['Project Commercial'].on_page_show = function(wrapper) {
	if(!frappe.route_options){
		$("#main-div").empty();
		wrapper.project = new Project1(wrapper);
	}
}

Project1 = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.filters = {};
		this.render();
	},
	render: function() {
		var me = this;

		if($('input[data-fieldname=customer_nm]').val().length!=null){
			frappe.call({
				type: "GET",
				method: "mycfo.mycfo.page.project_commercial.project_commercial.get_project_commercial_data",
				args: {
					customer: $('input[data-fieldname=customer_nm]').val()
				},
				callback: function(r) {
					if(r.message){
						// var numPages=Math.ceil(r.message['final_data'].length/records_per_page)
						// me.BackchangePage(1,numPages,r.message['final_data'],records_per_page,r.message['final_data'].length);
						me.values = r.message['final_data']
						me.cal_for_btn_prev()
					}
				}
			});
		
		}
	},

	cal_for_btn_prev:function(){
		var me= this
		var current_page = 1;
		var records_per_page = 10;
		var numPages=Math.ceil(me.values.length/records_per_page)

	    me.BackchangePage(1,numPages,me.values,records_per_page,me.values.length);

	 },

	BackchangePage: function(page,numPages,values,records_per_page,length)
	{	
		var me=this
		var arr= []
	    if (page < 1) page = 1;
	    if (page > numPages) page = numPages;

	    me.show_user_property_backtable(page,numPages,values,records_per_page,length);

	    $("#page").text(length)
	    if(length==1)
	    	$("#page")

	    if (page == 1) {
	        btn_prev.style.visibility = "hidden";
	    } else {
	        btn_prev.style.visibility = "visible";
	    }
	    if (page == numPages){
	        btn_next.style.visibility = "hidden";
	     } 
	     else {
	        btn_next.style.visibility = "visible";
	    }
	  
	},

	show_user_property_backtable: function(page,numPages,values,records_per_page,length,flag) {
		var me = this
		$("#buttons").remove();
		me.property_data=values
		$("<div class='col-md-12 row' id='newbuttons' ><p  style='float:right;text-align=right'><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new'> New Project Commercial</a></button></p></div>\
			<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Documents:</b> <span id='page'></span></p></div>").appendTo(me.body);

		 for (var i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
		 	if(values[i]!=null){
				$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
							 <div id='details' class='col-md-12 property-main-div'>\
							 <div id="+i+" class='col-md-12 property-id' style='border: 1px solid #d1d8dd;'>\
							 </div></div>\
				 			</div></li>").appendTo($(me.body).find("#mytable"))

						$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
				      <li role='presentation' class='active'><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;Project Details</a></li>\
				      <li role='presentation' class=''><a href='#amenities"+""+i+"' role='tab' id='profile-tab' data-toggle='tab'  style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-building'></i>&nbsp;&nbsp;Project Value Details</a></li>\
				      </ul></div>\
				    </ul>\
				    <div id='mytable' class='tab-content' style='background-color=#fafbfc;'>\
				       <div role='tabpanel' class='tab-pane fade' style='overflow:auto;height: 110px;' id='amenities"+""+i+"' aria-labelledby='profile-tab'>\
				      <div class='col-md-6' id='amenities-first' style='background-color=#fafbfc;'>\
				      </div>\
				      <div class='col-md-6' id='amenities-second' style='background-color=#fafbfc;'>\
				      </div>\
				      </div>\
				      <div role='tabpanel' class='tab-pane fade active in' style='overflow:auto;height: 110px;' id='more"+""+i+"' aria-labelledby='profile-tab'>\
				      <div class='col-md-6' style='background-color=#fafbfc;'>\
				      	<div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Commercial ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='p_id'></div>\
				        </div>\
				       </div>\
				        <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='property-ownership'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Stage :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='floors'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row '>\
				       <div class='row property-row'><b>Service Type :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='maintainance'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Proposal Date :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='deposite'></div>\
				        </div>\
				       </div>\
				       </div>\
				       <div class='col-md-6' style='background-color=#fafbfc;'>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Start Date :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='age'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>End Date :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='furnishing_type'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Period :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='society_name'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Type :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='p_type'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Value :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='address'></div>\
				        </div>\
				       </div>\
				       </div>\
				      </div>\
				      </div>\
				    </div>").appendTo($(me.body).find("#"+i+""))

					
					$($(me.body).find("#"+i+"")).find("#p_id").append('<div class="row property-row"><a class="pv" style="margin-left:12px;" id="'+values[i][0]['name']+'">'+values[i][0]['name']+'<a></div>')
					$($(me.body).find("#"+i+"")).find("#property-ownership").append('<div class="row property-row">'+values[i][0]['p_id'] ? values[i][0]['p_id'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#floors").append('<div class="row property-row">'+values[i][0]['p_stage'] ? values[i][0]['p_stage'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#maintainance").append('<div class="row property-row">'+values[i][0]['s_type'] ? values[i][0]['s_type'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#deposite").append('<div class="row property-row">'+values[i][0]['prop_date'] ? values[i][0]['prop_date'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#age").append('<div class="row property-row">'+values[i][0]['start_date'] ? values[i][0]['start_date'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#furnishing_type").append('<div class="row property-row">'+values[i][0]['end_date'] ? values[i][0]['end_date'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#society_name").append('<div class="row property-row">'+values[i][0]['pro_per'] ? values[i][0]['pro_per'] : ""+'</div>')
					// $($(me.body).find("#"+i+"")).find("#area").append('<div class="row property-row">'+values[i][0]['customer'] ? values[i][0]['customer'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#p_type").append('<div class="row property-row">'+values[i][0]['p_type'] ? values[i][0]['p_type'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#address").append('<div class="row property-row">'+values[i][0]['p_value'] ? values[i][0]['p_value'] : ""+'</div>')
					// $($(me.body).find("#"+i+"")).find("#location").append('<div class="row property-row">'+values[i][0]['customer_name'] ? values[i][0]['customer_name'] : ""+'</div>')
					// $($(me.body).find("#"+i+"")).find("#property-name").append('<div class="row property-row">'+values[i][0]['register_addr'] ? values[i][0]['register_addr'] : ""+'</div>')


					if(values[i][0]['child_records']!=null){
						$.each(values[i][0]['child_records'], function(j, k){
							$($(me.body).find("#"+i+"")).find("#amenities-first").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b>Due Date :</b></div></div><div class="col-md-6 row"><div class="row property-row">'+k['due_date']+'</div></div></div>')
							$($(me.body).find("#"+i+"")).find("#amenities-second").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b>Amount:</b></div></div><div class="col-md-6 row"><div class="row property-row">'+k['amount']+'</div></div></div>')
		
							})
					}

					$('.pv').click(function(){
				
						frappe.set_route("Form",'Project Commercial',$(this).attr('id'));
					})


					$('#btn_prev').click(function(){
						if (page > 1) {
				        	page--;
				        	$("#buttons").remove();
				        	$("#newbuttons").remove();
				        	$("#property").remove();
				       		me.BackchangePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })

				    $('#btn_next').click(function(){
				    	if (page < numPages) {
				       	 	page++;
				       	 	$("#buttons").remove();
				        	$("#newbuttons").remove();
				        	$("#property").remove();
				       	 	// //$("#buttons").empty();
				       	 	// $("#newbuttons").empty();
				       	 	// $("#property").empty();
				        	me.BackchangePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })

				}
			}

			$('#new').click(function(){
				new_doc("Project Commercial");
			})

	}

})


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
					fieldname: "customer_nm",
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

		if(me.filters.customer.input.value.length!=null){
			frappe.call({
				type: "GET",
				method: "mycfo.mycfo.page.project_commercial.project_commercial.get_project_commercial_data",
				args: {
					customer: me.filters.customer.input.value
				},
				callback: function(r) {
					if(r.message){
						// var numPages=Math.ceil(r.message['final_data'].length/records_per_page)
						// me.changePage(1,numPages,r.message['final_data'],records_per_page,r.message['final_data'].length);
						me.values = r.message['final_data']
						me.cal_for_btn_next()
					}
					else{
						me.body.html("<p class='text-muted'>"+__("There is no any Project Commercial added yet.")+"</p>");
						return;
					}
				}
			});
		
		}

	},

	cal_for_btn_next:function(){
		var me= this
		var current_page = 1;
		var records_per_page = 10;
		var numPages=Math.ceil(me.values.length/records_per_page)

	    me.changePage(1,numPages,me.values,records_per_page,me.values.length);
	  
	},

	changePage: function(page,numPages,values,records_per_page,length)
	{	
		var me=this
		var arr= []
	    if (page < 1) page = 1;
	    if (page > numPages) page = numPages;

	    me.show_user_property_table(page,numPages,values,records_per_page,length);

	    $("#page").text(length)
	    if(length==1)
	    	$("#page")

	    if (page == 1) {
	        btn_prev.style.visibility = "hidden";
	    } else {
	        btn_prev.style.visibility = "visible";
	    }
	    if (page == numPages){
	        btn_next.style.visibility = "hidden";
	     } 
	     else {
	        btn_next.style.visibility = "visible";
	    }
	  
	},
	show_user_property_table: function(page,numPages,values,records_per_page,length,flag) {
		var me = this
		$("#buttons").remove();
		me.property_data=values
		$("<div class='col-md-12 row' id='newbuttons' ><p  style='float:right;text-align=right'><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new'> New Project Commercial</a></button></p></div>\
			<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Documents:</b> <span id='page'></span></p></div>").appendTo(me.body);

		 for (var i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
		 	if(values[i]!=null){
				$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
							 <div id='details' class='col-md-12 property-main-div'>\
							 <div id="+i+" class='col-md-12 property-id' style='border: 1px solid #999999;'>\
							 </div></div>\
				 			</div></li>").appendTo($(me.body).find("#mytable"))

						$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
				      <li role='presentation' class='active'><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;Project Details</a></li>\
				      <li role='presentation' class=''><a href='#amenities"+""+i+"' role='tab' id='profile-tab' data-toggle='tab'  style='height:35px;margin-top:-3px;' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-building'></i>&nbsp;&nbsp;Project Value Details</a></li>\
				      </ul></div>\
				    </ul>\
				    <div id='mytable' class='tab-content' style='background-color=#fafbfc;'>\
				       <div role='tabpanel' class='tab-pane fade' style='overflow:auto;height: 110px;' id='amenities"+""+i+"' aria-labelledby='profile-tab'>\
				      <div class='col-md-6' id='amenities-first' style='background-color=#fafbfc;'>\
				      </div>\
				      <div class='col-md-6' id='amenities-second' style='background-color=#fafbfc;'>\
				      </div>\
				      </div>\
				      <div role='tabpanel' class='tab-pane fade active in' style='overflow:auto;height: 110px;' id='more"+""+i+"' aria-labelledby='profile-tab'>\
				      <div class='col-md-6' style='background-color=#fafbfc;'>\
				      	<div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Commercial ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='p_id'></div>\
				        </div>\
				       </div>\
				        <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='property-ownership'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Stage :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='floors'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row '>\
				       <div class='row property-row'><b>Service Type :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='maintainance'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Proposal Date :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='deposite'></div>\
				        </div>\
				       </div>\
				       </div>\
				       <div class='col-md-6' style='background-color=#fafbfc;'>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Start Date :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='age'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>End Date :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='furnishing_type'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Period :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='society_name'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Type :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='p_type'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Project Value :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='address'></div>\
				        </div>\
				       </div>\
				       </div>\
				      </div>\
				      </div>\
				    </div>").appendTo($(me.body).find("#"+i+""))

					
					$($(me.body).find("#"+i+"")).find("#p_id").append('<div class="row property-row"><a class="pv" style="margin-left:12px;" id="'+values[i][0]['name']+'">'+values[i][0]['name']+'<a></div>')
					$($(me.body).find("#"+i+"")).find("#property-ownership").append('<div class="row property-row">'+values[i][0]['p_id'] ? values[i][0]['p_id'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#floors").append('<div class="row property-row">'+values[i][0]['p_stage'] ? values[i][0]['p_stage'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#maintainance").append('<div class="row property-row">'+values[i][0]['s_type'] ? values[i][0]['s_type'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#deposite").append('<div class="row property-row">'+values[i][0]['prop_date'] ? values[i][0]['prop_date'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#age").append('<div class="row property-row">'+values[i][0]['start_date'] ? values[i][0]['start_date'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#furnishing_type").append('<div class="row property-row">'+values[i][0]['end_date'] ? values[i][0]['end_date'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#society_name").append('<div class="row property-row">'+values[i][0]['pro_per'] ? values[i][0]['pro_per'] : ""+'</div>')
					// $($(me.body).find("#"+i+"")).find("#area").append('<div class="row property-row">'+values[i][0]['customer'] ? values[i][0]['customer'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#p_type").append('<div class="row property-row">'+values[i][0]['p_type'] ? values[i][0]['p_type'] : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#address").append('<div class="row property-row">'+values[i][0]['p_value'] ? values[i][0]['p_value'] : ""+'</div>')
					// $($(me.body).find("#"+i+"")).find("#location").append('<div class="row property-row">'+values[i][0]['customer_name'] ? values[i][0]['customer_name'] : ""+'</div>')
					// $($(me.body).find("#"+i+"")).find("#property-name").append('<div class="row property-row">'+values[i][0]['register_addr'] ? values[i][0]['register_addr'] : ""+'</div>')


					if(values[i][0]['child_records']!=null){
						$.each(values[i][0]['child_records'], function(j, k){
							$($(me.body).find("#"+i+"")).find("#amenities-first").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b>Due Date :</b></div></div><div class="col-md-6 row"><div class="row property-row">'+k['due_date']+'</div></div></div>')
							$($(me.body).find("#"+i+"")).find("#amenities-second").append('<div class="row row-id"><div class="col-md-6 row"><div class="row property-row"><b>Amount:</b></div></div><div class="col-md-6 row"><div class="row property-row">'+k['amount']+'</div></div></div>')
		
							})
					}

					$('.pv').click(function(){
				
						frappe.set_route("Form",'Project Commercial',$(this).attr('id'));
					})


					$('#btn_prev').click(function(){
						if (page > 1) {
				        	page--;
				        	$("#buttons").remove();
				        	$("#newbuttons").remove();
				        	$("#property").remove();
				       		me.changePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })

				    $('#btn_next').click(function(){
				    	if (page < numPages) {
				       	 	page++;
				       	 	$("#buttons").remove();
				        	$("#newbuttons").remove();
				        	$("#property").remove();
				       	 	// //$("#buttons").empty();
				       	 	// $("#newbuttons").empty();
				       	 	// $("#property").empty();
				        	me.changePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })

				}
			}

			$('#new').click(function(){
				new_doc("Project Commercial");
			})
		}
})





