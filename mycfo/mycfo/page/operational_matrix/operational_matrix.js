// Show list view of all operational matrix linked with current customer.....................
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
		this.make();
		this.render();
	},

	make: function() {
		var me = this;

		$("<div class='col-md-12 row' id='newbuttons' ><p  style='float:right;text-align=right'><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new-button'> New Operational Matrix</a></button></p></div>").appendTo(me.body)

		$('#new-button').click(function(){
			new_doc("Operational Matrix");
		})

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
		$('#property').remove();
		//me.property_data=values
		$("<div id='property' class='col-md-12'>\
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
				 			</li>").appendTo($(me.body).find("#mytable"))

						$("<div class='col-md-12 row first-row' style='margin-top:15px;' id ='first'>\
							<div class='col-md-6' style='background-color=#fafbfc;'>\
			        			<div class='row row-id'>\
			        			<div class='col-md-6 row'>\
			       				<div class='row property-row'><b>Project Id :</b></div>\
			      				 </div>\
			      				 <div class='col-md-6 row'>\
			        			<div class='row property-row' id='project_id'></div>\
			        			</div>\
			      				 </div>\
			       				</div>\
			       				<div class='col-md-6' style='background-color=#fafbfc;'>\
			        			<div class='row row-id'>\
			        			<div class='col-md-5 row'>\
			       				<div class='row property-row'><b>Operational Matrix :</b></div>\
			      				 </div>\
			      				 <div class='col-md-5 row'>\
			        			<div class='row property-row' id='operational-id'></div>\
			        			</div>\
			        			<div class='col-md-2 row' style='margin-left:65px;'>\
			        			<div class='row property-row' id="+values[i][0]['name']+" style='float:right;'>\
							<button class='btn btn-sm btn-default cb'>Deactivate</button>\
							</div>\
								</div>\
			      				 </div>\
			       				</div>\
			       				</div>\
								<div class='col-md-12 table-data' style='margin-top:15px; overflow:auto;height: 90px;' id ='table-details"+""+i+"'>\
								  <div class='rTable' id='tblEntAttributes'>\
				<div class='rTableHeading'>\
					<div class='rTableHead col-md-1'>Sr No\
					</div>\
					<div class='rTableHead col-md-2'>Role\
					</div>\
					<div class='rTableHead col-md-3'>Name\
					</div>\
					<div class='rTableHead col-md-3'>Email ID\
					</div>\
					<div class='rTableHead col-md-3'>Contact\
					</div>\
					</div>\
					<div class='rTableBody row'>\
					</div>\
			</div></div>").appendTo($(me.body).find("#"+i+""))

					
					//$($(me.body).find("#"+i+"")).find("#project_id").append('<div class="row property-row"><a class="pv" style="margin-left:12px;" id="'+values[i].name+'">'+values[i].name+'<a></div>')
					$($(me.body).find("#"+i+"")).find("#operational-id").append('<div class="row property-row">'+values[i][0].operational_id ? values[i][0].operational_id : ""+'</div>')
					 $($(me.body).find("#"+i+"")).find("#project_id").append('<div class="row property-row">'+values[i][0].project_commercial ? values[i][0].project_commercial : ""+'</div>')
					

					if(values[i][0]['child_records']!=null){
						$.each(values[i][0]['child_records'], function(j, k){
							j =j+1
							$($(me.body).find("#"+i+"")).find("#table-details"+i+"").find(".rTableBody").append('<div class="rTableRow">\
						<div class="rTableCell col-md-1">'+j+'\
						</div>\
						<div class="rTableCell col-md-2" style="min-height:28px;max=height:28px;">'+(k['role'] ? k['role'] : "")+'\
						</div>\
						<div class="rTableCell col-md-3" style="min-height:28px;max=height:28px;">'+(k['user_name'] ? k['user_name'] : "")+'\
						</div>\
						<div class="rTableCell col-md-3" style="min-height:28px;max=height:28px;">'+(k['email_id'] ? k['email_id'] : "")+'\
						</div>\
						<div class="rTableCell col-md-3" style="min-height:28px;max=height:28px;">'+(k['contact'] ? k['contact'] : "")+'\
						</div>\
					</div>')
							
					})
					}

					// $('.pv').click(function(){
				
					// 	frappe.set_route("Form",'Operational Matrix',$(this).attr('id'));
					// })

					

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
				       	 	
				        	me.changePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })


				}
			}

			$('.cb').click(function(){
					
					if($(this).parent().attr("id")){
						return frappe.call({
							method:'mycfo.mycfo.page.operational_matrix.operational_matrix.deactivate_records',
							args :{
								"operational_record":$(this).parent().attr("id"),
								"customer": $('input[data-fieldname=customer_nm]').val()
							},
							callback: function(r,rt) {
								if(r.message){
									if(r.message['final_data'].length>0) {
										me.cal_for_btn_next(r.message['final_data'])
										
									}
									else{
										$("#buttons").remove();
							        	//$("#newbuttons").remove();
							        	$("#property").remove();
									}
								}
							},
						});	
				}
					
				});


		}

		


})

Operational = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.deactivation_list = []
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
					options: "Customer",
					read_only:1
		});

		$(me.filters.customer.input).attr('disabled',true)

		me.filters.project_id = me.wrapper.page.add_field({
					fieldname: "project_id",
					label: __("Project ID"),
					fieldtype: "Link",
					options: "Project Commercial",
					"get_query": function() {
				return {
					"doctype": "Project Commercial",
					"filters": {
						"project_status": 'Active',
						"customer":me.filters.customer.input.value
					}
				}
			}

		});

		me.filters.operational_matrix = me.wrapper.page.add_field({
					fieldname: "operational_matrix",
					label: __("Operational Matrix"),
					fieldtype: "Link",
					options: "Operational Matrix",
					"get_query": function() {
				return {
					"doctype": "Operational Matrix",
					"filters": {
						"operational_matrix_status": 'Active',
					}
				}
			}
		});

		me.add = me.wrapper.page.add_field({
						fieldname: "add",
						label: __("Add"),
						fieldtype: "Button",
						icon: "icon-share-sign"
		});

		if(frappe.route_options)
			me.filters.customer.input.value= frappe.route_options['customer']

		$('[data-fieldname=add]').css('display','none')


		$("<div class='col-md-12 row' id ='newbuttons' ><p  style='float:right;text-align=right'><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new-button'> New Operational Matrix</a></button></p></div>").appendTo(me.body)

		$('#new-button').click(function(){
				new_doc("Operational Matrix");
		})
		
	
		$("#buttons").remove();
    	//$("#newbuttons").remove();
    	$("#property").remove();
									
		//change in filter project ID-----------------------------------------------------------
		$(me.filters.project_id.input).change(function(){
			if (me.filters.project_id.input.value.length!=0 && me.filters.operational_matrix.input.value.length!=0){
				$('[data-fieldname=add]').css('display','block')
			}
			else{
				$('[data-fieldname=add]').css('display','none')
			}
			if(me.values){
				if(me.filters.project_id.input.value.length!=0 && me.filters.operational_matrix.input.value.length==0){
					me.get_filtered_data()
				}
				else if (me.filters.project_id.input.value.length ==0 && me.filters.operational_matrix.input.value.length!=0){
					me.get_filtered_data()
				}
				else if (me.filters.project_id.input.value.length!=0 && me.filters.operational_matrix.input.value.length!=0){
					me.get_filtered_data()
				}

			}

			
		});


		//change in filter operational ID-----------------------------------------------------------
		$(me.filters.operational_matrix.input).change(function(){
		
			if (me.filters.project_id.input.value.length!=0 && me.filters.operational_matrix.input.value.length!=0){
				$('[data-fieldname=add]').css('display','block')
			}
			else{
				$('[data-fieldname=add]').css('display','none')
			}
			if(me.filters.project_id.input.value.length!=0 && me.filters.operational_matrix.input.value.length==0){
				me.get_filtered_data()
			}
			else if (me.filters.project_id.input.value.length ==0 && me.filters.operational_matrix.input.value.length!=0){
				me.get_filtered_data()
			}
			else if (me.filters.project_id.input.value.length!=0 && me.filters.operational_matrix.input.value.length!=0){
				me.get_filtered_data()
			}


			
		});




		$(me.filters.operational_matrix.input).change(function(){
			if (me.filters.operational_matrix.input.value.length!=0 && me.filters.operational_matrix.input.value.length!=0){
				$('[data-fieldname=add]').css('display','block')
			}
		});

		me.add.$input.on("click", function() {
			if (me.filters.operational_matrix.input.value.length!=0 && me.filters.operational_matrix.input.value.length!=0){
				me.pop_up = me.show_pop_up_dialog()
				me.append_pop_up_dialog_body(me.pop_up);
				me.append_se_popup_fields(me);
				me.pop_up.show()
				$(".modal-dialog").css("width","800px");
				$(".modal-content").css("max-height","600px");
				$(".modal-footer").css("text-align","center");
				
			}
		})
	},

	get_filtered_data: function(){
		var me= this
		return frappe.call({
						method:'mycfo.mycfo.page.operational_matrix.operational_matrix.get_filtered_data',
						args :{
							"project_id": me.filters.project_id.input.value,
							"customer":me.filters.customer.input.value,
							"operational_matrix": me.filters.operational_matrix.input.value
						},
						callback: function(r,rt) {
							if(r.message){
								if(r.message['final_data'].length>0) {
									me.cal_for_btn_next(r.message['final_data'])
								}
							}
							else{
								$("#buttons").remove();
								//$('#newbuttons').remove();
								$('#property').remove();
							}
			},
		});	

	},

	get_data: function(){
		var me = this;
		return frappe.call({
			method:'mycfo.mycfo.page.operational_matrix.operational_matrix.get_operational_matrix_details',
			args :{
				"operational_matrix":me.filters.operational_matrix.input.value,
				"project_id": me.filters.project_id.input.value,
				"customer":me.filters.customer.input.value
			},
			callback: function(r,rt) {
				if(r.message['final_data'].length>0) {
					me.cal_for_btn_next(r.message['final_data'])
					// frappe.set_route("Form", 'Lead Management', me.lead_management.$input.val());
					// location.reload()
				}
				else{
					$("#buttons").remove();
					//$('#newbuttons').remove();
					$('#property').remove();
				}
			},
		});	
	},

	show_pop_up_dialog: function(){
		var me = this;
		return new frappe.ui.Dialog({
			title: "Operation Matrix Details",
			no_submit_on_enter: true,
			fields: [

				{label:__("Operation Matrix"), fieldtype:"HTML", fieldname:"matrix"},

				{fieldtype: "Section Break","name":"cc_sec"},

				{label:__("Property Follow-Ups"), fieldtype:"HTML", fieldname:"followup"},
			],

			primary_action_label: "ADD",
			primary_action: function() {
				me.get_data()
				me.pop_up.hide()
			}

		});
		
	},

	append_pop_up_dialog_body: function(pop_up){
		this.fd = pop_up.fields_dict;
		this.pop_up_body = $("<div id='container_second' style='overflow: auto;max-height: 300px;'><table class='table table-bordered table-hover' id='operation_details'><thead>\
		<th><b>Role</b></th><th><b>Name</b></th><th><b>Email ID</b></th><th><b>Contact</b></th></thead><tbody></tbody></table></div>").appendTo($(this.fd.followup.wrapper));

	},

	append_se_popup_fields: function(me){
		if(me.filters.operational_matrix.input.value.length!=0){
			frappe.call({
				method:'mycfo.mycfo.page.operational_matrix.operational_matrix.get_operational_matrix',
				args :{
					"operational_matrix":me.filters.operational_matrix.input.value
				},
				callback: function(r,rt) {
					if(r.message){
						me.append_operation_matrix(r.message['final_data'])
					}
				},
			});	

		}
	},

	append_operation_matrix: function(data){
		$.each(data, function(j, k){
			$("<tr>\
				<td align='center' id='status'>"+k['role']+"</td>\
				<td align='center' id='status'>"+k['user_name']+"</td>\
				<td align='center' id='status'>"+k['email_id']+"</td>\
				<td align='center' id='status'>"+k['contact']+"</td>\
				</tr>").appendTo($("#operation_details tbody"));
		})
		
	
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
						me.cal_for_btn_next(me.values)
					}
					else{
						$("#buttons").remove();
						//$('#newbuttons').remove();
						$('#property').remove();
					}
					
				}
			});
		
		}

	},

	cal_for_btn_next:function(values){
		var me= this
		var current_page = 1;
		var records_per_page = 10;
		me.values = values
		var numPages=Math.ceil(me.values.length/records_per_page)
	    me.changePage(1,numPages,me.values,records_per_page,me.values.length);
	 
},

	changePage: function(page,numPages,values,records_per_page,length)
		{	
			if(length==0){
				$("#buttons").empty();
			}
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
		    }
		    else if(page==0) {
		    	btn_prev.style.visibility = "hidden";
		    }
		     else {
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
		//$('#newbuttons').remove();
		$('#property').remove();
		//me.property_data=values
		$("<div id='property' class='col-md-12'>\
			<div class='row'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>\
			<div id='buttons' class='col-md-12' >\
		<p align='right'><input type='button' value='Prev' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_prev'>\
		<input type='button' value='Next' class='btn btn-default btn-sm btn-modal-close button-div' id='btn_next'></p>\
		<p align='left'><b>Total Documents:</b> <span id='page'></span></p></div>").appendTo(me.body);

		 for (var i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
		 	if(values[i] !=null){
				$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
							 <div id='details' class='col-md-12 property-main-div'>\
							 <div id="+i+" class='col-md-12 property-id' style='border: 1px solid #d1d8dd;'>\
							 </div></div>\
				 			</li>").appendTo($(me.body).find("#mytable"))

						$("<div class='col-md-12 row first-row' style='margin-top:15px;' id ='first'>\
							<div class='col-md-6' style='background-color=#fafbfc;'>\
			        			<div class='row row-id'>\
			        			<div class='col-md-6 row'>\
			       				<div class='row property-row'><b>Project Id :</b></div>\
			      				 </div>\
			      				 <div class='col-md-6 row'>\
			        			<div class='row property-row' id='project_id'></div>\
			        			</div>\
			      				 </div>\
			       				</div>\
			       				<div class='col-md-6' style='background-color=#fafbfc;'>\
			        			<div class='row row-id'>\
			        			<div class='col-md-5 row'>\
			       				<div class='row property-row'><b>Operational Matrix :</b></div>\
			      				 </div>\
			      				 <div class='col-md-5 row'>\
			        			<div class='row property-row' id='operational-id'></div>\
			        			</div>\
			        			<div class='col-md-2 row' style='margin-left:65px;'>\
			        			<div class='row property-row' id="+values[i][0]['name']+" style='float:right;'>\
							<button class='btn btn-sm btn-default cb'>Deactivate</button>\
							</div>\
								</div>\
			      				 </div>\
			       				</div>\
			       				</div>\
								<div class='col-md-12 table-data' style='margin-top:15px; overflow:auto;height: 90px;' id ='table-details"+""+i+"'>\
								  <div class='rTable' id='tblEntAttributes'>\
				<div class='rTableHeading'>\
					<div class='rTableHead col-md-1'>Sr No\
					</div>\
					<div class='rTableHead col-md-2'>Role\
					</div>\
					<div class='rTableHead col-md-3'>Name\
					</div>\
					<div class='rTableHead col-md-3'>Email ID\
					</div>\
					<div class='rTableHead col-md-3'>Contact\
					</div>\
					</div>\
					<div class='rTableBody row'>\
					</div>\
			</div></div>").appendTo($(me.body).find("#"+i+""))

					
					//$($(me.body).find("#"+i+"")).find("#project_id").append('<div class="row property-row"><a class="pv" style="margin-left:12px;" id="'+values[i].name+'">'+values[i].name+'<a></div>')
					$($(me.body).find("#"+i+"")).find("#operational-id").append('<div class="row property-row">'+values[i][0].operational_id ? values[i][0].operational_id : ""+'</div>')
					 $($(me.body).find("#"+i+"")).find("#project_id").append('<div class="row property-row">'+values[i][0].project_commercial ? values[i][0].project_commercial : ""+'</div>')
					

					if(values[i][0]['child_records']!=null){
						$.each(values[i][0]['child_records'], function(j, k){
							j =j+1
							$($(me.body).find("#"+i+"")).find("#table-details"+i+"").find(".rTableBody").append('<div class="rTableRow">\
						<div class="rTableCell col-md-1">'+j+'\
						</div>\
						<div class="rTableCell col-md-2" style="min-height:28px;max=height:28px;">'+(k['role'] ? k['role'] : "")+'\
						</div>\
						<div class="rTableCell col-md-3" style="min-height:28px;max=height:28px;">'+(k['user_name'] ? k['user_name'] : "")+'\
						</div>\
						<div class="rTableCell col-md-3" style="min-height:28px;max=height:28px;">'+(k['email_id'] ? k['email_id'] : "")+'\
						</div>\
						<div class="rTableCell col-md-3" style="min-height:28px;max=height:28px;">'+(k['contact'] ? k['contact'] : "")+'\
						</div>\
					</div>')
							
					})
					}

					// $('.pv').click(function(){
				
					// 	frappe.set_route("Form",'Operational Matrix',$(this).attr('id'));
					// })

					

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
				       	 	
				        	me.changePage(page,numPages,me.values,records_per_page,me.values.length);
				    }

				    })


				}
			}

			$('.cb').click(function(){
					if($(this).parent().attr("id")){
						return frappe.call({
							method:'mycfo.mycfo.page.operational_matrix.operational_matrix.deactivate_records',
							args :{
								"operational_record":$(this).parent().attr("id"),
								"customer":me.filters.customer.input.value
							},
							callback: function(r,rt) {
								if(r.message){
									if(r.message['final_data'].length>0) {
										me.cal_for_btn_next(r.message['final_data'])
										
									}
									else{
										$("#buttons").remove();
							        	//$("#newbuttons").remove();
							        	$("#property").remove();
									}
								}
							},
						});	
				}
					
				});


		}

		


})