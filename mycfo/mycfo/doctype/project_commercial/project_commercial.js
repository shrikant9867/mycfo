// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

{% include 'controllers/js/contact_address_common.js' %};


cur_frm.add_fetch('customer', 'customer_name', 'customer_name');

cur_frm.add_fetch('p_id', 'project_id_status', 'project_id_status');

cur_frm.add_fetch('customer', 'register_address', 'register_addr');

// cur_frm.add_fetch('billing_address', 'register_address', 'register_addr');

cur_frm.cscript.start_date= function(doc, cdt, cdn) {
	if (doc.start_date && doc.end_date)
	{
		var date1 = new Date(doc.start_date);
		var date2 = new Date(doc.end_date);

		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		doc.pro_per = diffDays;
		refresh_field('pro_per');

		if(date1>date2){
			msgprint("Start Date must be less than End Date")
			doc.start_date=''
			doc.pro_per=''
			refresh_field('pro_per');
			refresh_field('start_date');
		}
		if(date1.getTime() === date2.getTime()){
			msgprint("Start Date and End Date must be different")
			doc.start_date=''
			refresh_field('start_date');
			doc.end_date=''
			refresh_field('end_date');


		}

		return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

	}

}

cur_frm.cscript.end_date= function(doc, cdt, cdn) {
	if (doc.start_date && doc.end_date)
	{
		var date1 = new Date(doc.start_date);
		var date2 = new Date(doc.end_date);

		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		doc.pro_per = diffDays;
		refresh_field('pro_per');

		if(date2<date1){
			msgprint("End Date must be greater than Start Date")
			doc.end_date=''
			doc.pro_per=''
			refresh_field('pro_per');
			refresh_field('end_date');
		}

		if(date1.getTime() === date2.getTime()){
			msgprint("Start Date and End Date must be different")
			doc.end_date=''
			refresh_field('end_date');
			doc.start_date=''
			refresh_field('start_date');
		}

		return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
		});


	}

}

cur_frm.cscript.prop_date= function(doc, cdt, cdn) {
	if (doc.start_date && doc.end_date)
	{
		var date1 = new Date(doc.start_date);
		var date2 = new Date(doc.end_date);
		var date3 = new Date(doc.prop_date);
		if(date3>date1){
			msgprint("Proposal Date must be less than Start Date")
		}
		if(date3>date2){
			msgprint("Proposal Date must be less than End Date")
		}

	}

}

cur_frm.cscript.fix_val= function(doc, cdt, cdn) {
	if (!doc.p_value)
	{
		msgprint("First enter the project value")

	}

	if(doc.fix_val<=0){
		msgprint("Fixed value must be greater than 0")
		doc.fix_val=''
		refresh_field('fix_val')
	}

	if(doc.fix_val && doc.var_val && doc.p_value && doc.p_type=='Fixed + Variable'){
		if(parseFloat(doc.p_value)!=(parseFloat(doc.fix_val) + parseFloat(doc.var_val))){
			msgprint("For project type Fixed + Variable total of Fixed and Variable value must be equal to the Project Value")
			doc.fix_val=''
			refresh_field('fix_val');
		}

	}

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

}

cur_frm.cscript.var_val= function(doc, cdt, cdn) {
	if (!doc.p_value)
	{
		msgprint("First enter the project value")

	}

	if(doc.var_val<=0){
		msgprint("Variable value must be greater than 0")
		doc.var_val=''
		refresh_field('var_val')
	}

	months = cur_frm.cscript.cacluate_months(doc.start_date,doc.end_date)

	if(doc.fix_val && doc.var_val && doc.p_value  && doc.p_type=='Fixed + Variable'){
		if(parseFloat(doc.p_value)!=(parseFloat(doc.fix_val) + parseFloat(doc.var_val))){
			msgprint("For project type Fixed + Variable total of Fixed and Variable value must be equal to the Project Value")
			doc.var_val=''
			refresh_field('var_val');
		}

	}

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

}

cur_frm.cscript.pick_date= function(doc, cdt, cdn) {
	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

}

cur_frm.cscript.fixed_pick_date= function(doc, cdt, cdn) {
	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

}

cur_frm.cscript.p_type= function(doc, cdt, cdn) {
	if (!doc.p_value)
	{
		msgprint("First enter the Project Value")
		doc.p_type =''
		refresh_field('p_type')

	}
	doc.fix_val=''
	doc.var_val=''
	doc.type=''
	doc.fixed_type=''
	doc.pick_date=''
	doc.fixed_pick_date=''
	doc.milestone_calculation=''
	doc.fixed_milestone=''
	doc.milestone_based=''
	refresh_field('fix_val');
	refresh_field('var_val');
	refresh_field('type');
	refresh_field('fixed_type');
	refresh_field('pick_date');
	refresh_field('fixed_pick_date');
	refresh_field('milestone_calculation');
	refresh_field('milestone_based');
	
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

	

}




cur_frm.cscript.p_value= function(doc, cdt, cdn) {
	if(doc.p_value<=0){
		msgprint("Project value must be greater than 0")
		doc.p_value=''
		refresh_field('p_value')

	}
	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}


cur_frm.cscript.fixed_pick_date= function(doc, cdt, cdn) {
	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}


cur_frm.cscript.generate_records = function(doc,cdt,cdn){
    if(doc.p_type=='Fixed'){
    	if(doc.type=='Monthly'){
    		if(doc.pick_date){
    			if(doc.start_date && doc.end_date){
    				months = cur_frm.cscript.cacluate_months(doc.start_date,doc.end_date)
	    			if(months){
	    				if(doc.p_value){
	    					return $c_obj(doc, 'get_child_details',months,function(r, rt) {
								var doc = locals[cdt][cdn];
								cur_frm.refresh();
							});
	    				}
	    			}
    			}
    			else{
    				msgprint("Please enter both Start and End date")
    			}
    		}
    		else{
    			msgprint("Please enter Pick Day.")
    		}
    	}
    	else if(doc.type=='Milestone'){
    		console.log("done")
    	}
    	else{
    		msgprint("Please specify type.")
    	}
    }

    if(doc.p_type=='Fixed + Variable'){
    	if(doc.fix_val){
	    	if(doc.fixed_type=='Monthly'){
	    		if(doc.fixed_pick_date){
	    			if(doc.start_date && doc.end_date){
	    				months = cur_frm.cscript.cacluate_months(doc.start_date,doc.end_date)
		    			if(months){
		    				if(doc.fix_val && doc.var_val){
		    					if(parseFloat(doc.p_value)==(parseFloat(doc.fix_val) + parseFloat(doc.var_val))){
			    					return $c_obj(doc, 'get_child_details_for_fixed_variable',months,function(r, rt) {
										var doc = locals[cdt][cdn];
										cur_frm.refresh();
									});
								 }
								else{
									msgprint("Total of Fixed Value and Variable Value must be equal to the Project value")
								}
		    				}
		    				else{
		    					msgprint("Both Fixed and Variable Value must be specified")
		    				}
		    			}
		    		}
		    		else{
		    			msgprint("Please enter both Start and End Date")
		    		}
	    		}
	    		else{
	    			msgprint("please enter Pick Day.")
	    		}
	    	}
	    	else if(doc.fixed_type=='Milestone')
	    		console.log("done")
	    	else{
	    		msgprint("Please specify Type.")
	    	}
    }
    else{
    	msgprint("Please specify Fixed Value")
    }

   }
}


cur_frm.cscript.cacluate_months = function(start_date,end_date){
	var date1 = new Date(start_date);
	var date2 = new Date(end_date);
	var year1=date1.getFullYear();
	var year2=date2.getFullYear();
	var month1=date1.getMonth();
	var month2=date2.getMonth();
	numberOfMonths = (year2 - year1) * 12 + (month2 - month1) + 1;
	return numberOfMonths
}

cur_frm.cscript.onload = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.milestone_calculation=='Percentage');
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.fixed_milestone=='Percentage');
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.milestone_based=='Percentage');
}

cur_frm.cscript.milestone_calculation = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.milestone_calculation=='Percentage');

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

cur_frm.cscript.fixed_milestone = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.fixed_milestone=='Percentage');

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

cur_frm.cscript.milestone_based = function(doc,cdt,cdn){
	if(doc.milestone_based=='Percentage'){
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	}
	else{
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);
	}

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

cur_frm.cscript.type = function(doc,cdt,cdn){
	if(doc.type=='Milestone' && doc.milestone_calculation=='Percentage') 

		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

cur_frm.cscript.fixed_type = function(doc,cdt,cdn){
	if(doc.fixed_type=='Milestone' && doc.fixed_milestone=='Percentage')
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}


cur_frm.cscript.percentage = function(doc,cdt,cdn){
	var d = locals[cdt][cdn]
	if(d.percentage && doc.p_value){
		if(d.percentage>=0 && d.percentage<=100){
			d.amount = doc.p_value *(d.percentage/100)
			refresh_field('table_17');
		}
		else{
			msgprint("Percentage Value must be greater than 0% and less than 100%")
			d.percentage=''
			refresh_field('table_17')
		}
	}
}

cur_frm.cscript.amount = function(doc,cdt,cdn){
	var d = locals[cdt][cdn]
	if(d.percentage && doc.p_value){
		d.amount = doc.p_value * (d.percentage/100)
		refresh_field('table_17')
	}
	else{
		msgprint("Please enter Percentage Value first.")
		d.amount=''
		refresh_field('table_17')
	}
}

cur_frm.cscript.due_date = function(doc,cdt,cdn){
	var d = locals[cdt][cdn]
	if(doc.start_date && doc.end_date){
		var date1 = new Date(doc.start_date);
		var date2 = new Date(doc.end_date);
		var date3 = new Date(d.due_date);
		if((date3 <= date2 && date3 >= date1))
			console.log("OK");
		else{
			msgprint("Due Date must be between Start Date and End Date")
			d.due_date=''
			refresh_field('table_17');
		}
	}
	else{
		msgprint("First enter Start and End Date")
	}
}

cur_frm.cscript.billing_address = function(doc,cdt,cdn){
	if(!doc.customer){
		msgprint("first enter the customer")
		doc.billing_address=''
		refresh_field('billing_address')
	}
	else{
		frappe.call({
				method: "erpnext.utilities.doctype.address.address.get_address_display",
				args: {"address_dict": doc.billing_address },
				callback: function(r) {
					if(r.message){
						doc.b_addr=r.message
						refresh_field('b_addr')
					}
				}
			})
	}

}
cur_frm.fields_dict['billing_address'].get_query = function(doc) {
	return {
		filters: {
			
			"customer": doc.customer,
			"address_type": 'Billing'
		}
	}
}
