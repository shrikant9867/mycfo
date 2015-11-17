frappe.pages['Operational Matrix'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Operational Matrix',
		single_column: true
	});

	$("#main-div").remove();
	$("<div class='user-settings' id ='main-div'></div>").appendTo(page.main);

	wrapper.operational = new Operational(wrapper);
}

frappe.pages['Operational Matrix'].on_page_show = function(wrapper) {
	if(!frappe.route_options){
		$("#main-div").empty();
		wrapper.operational = new Operational1(wrapper);
	}
}

Operational1 = Class.extend({
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
				method: "mycfo.mycfo.page.operational_matrix.operational_matrix.get_operational_matrix_data",
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

	    me.show_operational_matrix(page,numPages,values,records_per_page,length);

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
	show_operational_matrix: function(page,numPages,values,records_per_page,length,flag) {
		var me = this
		$("#buttons").remove();
		//me.property_data=values
		$("<div class='col-md-12 row' id ='newbuttons' ><p  style='float:right;text-align=right'><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new'> New Operational Matrix</a></button></p></div>\
			<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Documents:</b> <span id='page'></span></p></div>").appendTo(me.body);

		 for (var i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
		 	if(values[i] !=null){
				$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
							 <div id='details' class='col-md-12 property-main-div'>\
							 <div id="+i+" class='col-md-12 property-id' style='border: 1px solid #d1d8dd;'>\
							 </div></div>\
				 			</div></li>").appendTo($(me.body).find("#mytable"))

						$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
				      <li role='presentation' class='active'><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;Operational Matrix Details</a></li>\
				      </ul></div>\
				    </ul>\
				    <div id='mytable' class='tab-content' style='background-color=#fafbfc;'>\
				      <div role='tabpanel' class='tab-pane fade active in' style='overflow:auto;height: 110px;' id='general"+""+i+"' aria-labelledby='home-tab'>\
				       <div class='col-md-6' style='background-color=#fafbfc;'>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Operational Matrix ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='om_id'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>First Name :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='area'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Email ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='email_id'></div>\
				        </div>\
				       </div>\
				       </div>\
				       <div class='col-md-6' style='background-color=#fafbfc;'>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Second Name :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='property-name'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Role :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='role'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Contact :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='contact'></div>\
				        </div>\
				       </div>\
				       </div>\
				       </div>\
				      </div>\
				    </div>").appendTo($(me.body).find("#"+i+""))

					
					$($(me.body).find("#"+i+"")).find("#om_id").append('<div class="row property-row"><a class="pv" style="margin-left:12px;" id="'+values[i].name+'">'+values[i].name+'<a></div>')
					$($(me.body).find("#"+i+"")).find("#area").append('<div class="row property-row">'+values[i].f_name ? values[i].f_name : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#property-name").append('<div class="row property-row">'+values[i].s_name ? values[i].s_name : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#email_id").append('<div class="row property-row">'+values[i].email ? values[i].email : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#role").append('<div class="row property-row">'+values[i].role ? values[i].role : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#contact").append('<div class="row property-row">'+values[i].contact ? values[i].contact : ""+'</div>')


					$('.pv').click(function(){
				
						frappe.set_route("Form",'Operational Matrix',$(this).attr('id'));
					})

					$('#new').click(function(){
						om = new_doc('Operational Matrix');
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
				        	me.BackchangePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })

				}
			}

	}


})




Operational = Class.extend({
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
				method: "mycfo.mycfo.page.operational_matrix.operational_matrix.get_operational_matrix_data",
				args: {
					customer: me.filters.customer.input.value
				},
				callback: function(r) {
					if(r.message){
						me.values = r.message['final_data']
						me.cal_for_btn_next()
						// var numPages=Math.ceil(r.message['final_data'].length/records_per_page)
						// me.changePage(1,numPages,r.message['final_data'],records_per_page,r.message['final_data'].length);
					}
					else{
						me.body.html("<p class='text-muted'>"+__("There is no any operational matrix added yet.")+"</p>");
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
	  
		// $('#btn_prev').click(function(){
		// 	console.log("in btn_prev")
		// 	if (current_page > 1) {
	 //        	current_page--;
	 //        	$("#buttons").remove();
	 //        	$("#newbuttons").remove();
	 //        	$("#property").remove();
	 //       		me.changePage(current_page,numPages,me.values,records_per_page,me.values.length);
	 //    }

	 //    })

	 //    $('#btn_next').click(function(){
	 //    	console.log("in btn_next")
	 //    	if (current_page < numPages) {
	 //       	 	current_page++;
	 //       	 	$("#buttons").remove();
	 //        	$("#newbuttons").remove();
	 //        	$("#property").remove();
	 //       	 	// //$("#buttons").empty();
	 //       	 	// $("#newbuttons").empty();
	 //       	 	// $("#property").empty();
	 //        	me.changePage(current_page,numPages,me.values,records_per_page,me.values.length);
	 //    }

	 //    })
},

	changePage: function(page,numPages,values,records_per_page,length)
		{	
			var me=this
			var arr= []
		    if (page < 1) page = 1;
		    if (page > numPages) page = numPages;

		    me.show_user_property_table(page,numPages,values,records_per_page,length);

		    console.log(["length",length])
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
		//me.property_data=values
		$("<div class='col-md-12 row' id ='newbuttons' ><p  style='float:right;text-align=right'><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new'> New Operational Matrix</a></button></p></div>\
			<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Documents:</b> <span id='page'></span></p></div>").appendTo(me.body);

		 for (var i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
		 	if(values[i] !=null){
				$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
							 <div id='details' class='col-md-12 property-main-div'>\
							 <div id="+i+" class='col-md-12 property-id' style='border: 1px solid #d1d8dd;'>\
							 </div></div>\
				 			</div></li>").appendTo($(me.body).find("#mytable"))

						$("<ul id='mytab' class='nav nav-tabs' role='tablist' >\
				      <li role='presentation' class='active'><a href='#more"+""+i+"' role='tab' id='profile-tab' style='height:35px;margin-top:-3px;' data-toggle='tab' aria-controls='profile' aria-expanded='false'><i class='icon-li icon-book'></i>&nbsp;&nbsp;Operational Matrix Details</a></li>\
				      </ul></div>\
				    </ul>\
				    <div id='mytable' class='tab-content' style='background-color=#fafbfc;'>\
				      <div role='tabpanel' class='tab-pane fade active in' style='overflow:auto;height: 110px;' id='general"+""+i+"' aria-labelledby='home-tab'>\
				       <div class='col-md-6' style='background-color=#fafbfc;'>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Operational Matrix ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='om_id'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>First Name :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='area'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Email ID :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='email_id'></div>\
				        </div>\
				       </div>\
				       </div>\
				       <div class='col-md-6' style='background-color=#fafbfc;'>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Second Name :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='property-name'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Role :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='role'></div>\
				        </div>\
				       </div>\
				       <div class='row row-id'>\
				        <div class='col-md-6 row'>\
				       <div class='row property-row'><b>Contact :</b></div>\
				       </div>\
				       <div class='col-md-6 row'>\
				        <div class='row property-row' id='contact'></div>\
				        </div>\
				       </div>\
				       </div>\
				       </div>\
				      </div>\
				    </div>").appendTo($(me.body).find("#"+i+""))

					
					$($(me.body).find("#"+i+"")).find("#om_id").append('<div class="row property-row"><a class="pv" style="margin-left:12px;" id="'+values[i].name+'">'+values[i].name+'<a></div>')
					$($(me.body).find("#"+i+"")).find("#area").append('<div class="row property-row">'+values[i].f_name ? values[i].f_name : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#property-name").append('<div class="row property-row">'+values[i].s_name ? values[i].s_name : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#email_id").append('<div class="row property-row">'+values[i].email ? values[i].email : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#role").append('<div class="row property-row">'+values[i].role ? values[i].role : ""+'</div>')
					$($(me.body).find("#"+i+"")).find("#contact").append('<div class="row property-row">'+values[i].contact ? values[i].contact : ""+'</div>')


					$('.pv').click(function(){
				
						frappe.set_route("Form",'Operational Matrix',$(this).attr('id'));
					})

					$('#new').click(function(){
						om = new_doc('Operational Matrix');
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
		}



})