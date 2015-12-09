// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

// {% include 'controllers/js/contact_address_common.js' %};

cur_frm.add_fetch('customer', 'customer_name', 'customer_name');

cur_frm.add_fetch('p_id', 'project_id_status', 'project_id_status');

cur_frm.add_fetch('customer', 'register_address', 'register_addr');
cur_frm.add_fetch('customer', 'currency', 'currency');

cur_frm.add_fetch('customer', 'country', 'country');

cur_frm.add_fetch('currency','symbol','currency_symbol');


frappe.ui.form.on("Project Commercial", {

	onload: function(frm){
		if(cur_frm.doc.doctype==="Project Commercial"){
			if(frappe.route_history){
				var doctype = frappe.route_history[0][1],
					docname = frappe.route_history[0][2],
					refdoc = frappe.get_doc(doctype, docname);
				cur_frm.set_value("customer", $('input[data-fieldname=customer_nm]').val());
				cur_frm.set_value("currency",refdoc.currency)
				cur_frm.set_value("country",refdoc.country)
			}
		}

	},
	refresh: function(frm) {
		if(frm.doc.currency){
			set_dynamic_labels(frm)
		}
	},
	
});

// set dynamic lables according to the customer currency
var set_dynamic_labels = function(frm) {
		var company_currency = frm.doc.currency
		change_form_labels(frm,company_currency);
		change_grid_labels(frm,company_currency);
		//cur_frm.refresh_fields(["annual_sales","pbt","pat","ebidta","outstanding_p_loan","annualised_cost_of_salary_of_all_emp_in_f_and_a","total"]);
}

var change_form_labels = function(frm,currency){
	var field_label_map = {};
	var setup_field_label_map = function(fields_list, currency) {
			$.each(fields_list, function(i, fname) {
				var docfield = frappe.meta.docfield_map[frm.doc.doctype][fname];
				if(docfield) {
					var label = __(docfield.label || "").replace(/\([^\)]*\)/g, "");
					field_label_map[fname] = label.trim() + " (" + currency + ")";
				}
			});
	};
	setup_field_label_map(["p_value","fix_val","var_val"], currency);

	$.each(field_label_map, function(fname, label) {
			frm.fields_dict[fname].set_label(label);
	});

}

var change_grid_labels = function(frm,currency) {
		var me = this;
		var field_label_map = {};

		var setup_field_label_map = function(fields_list, currency, parentfield) {
			var grid_doctype = frm.fields_dict[parentfield].grid.doctype;
			$.each(fields_list, function(i, fname) {
				var docfield = frappe.meta.docfield_map[grid_doctype][fname];
				if(docfield) {
					var label = __(docfield.label || "").replace(/\([^\)]*\)/g, "");
					field_label_map[grid_doctype + "-" + fname] =
						label.trim() + " (" + currency + ")";
				}
			});
		}

		setup_field_label_map(["amount"], currency,"table_17");

		$.each(field_label_map, function(fname, label) {
			fname = fname.split("-");
			var df = frappe.meta.get_docfield(fname[0], fname[1], frm.doc.name);
			if(df) df.label = label;
		});

}

// Validate Start Date..............................................
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

// Validate End Date.............................................................
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

//Validate Proposal Date.................................
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

// Validate Fixed value..................................................
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

// Validate Variable value..................................................
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

	if(doc.p_type == 'Fixed + Variable')
		cur_frm.fields_dict["table_17"].grid.set_column_disp("f_type", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("f_type", 0);

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});

	

}




cur_frm.cscript.p_value= function(doc, cdt, cdn) {

	doc.p_value = Math.round(doc.p_value)
	refresh_field('p_value');

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


// Click on Generate button add record in amount details child table according to the number of months and project value.
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
    				msgprint("Please enter Start Date and End Date")
    			}
    		}
    		else{
    			msgprint("Please select Pick Day.")
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
		    			msgprint("Please enter Start Date and End Date")
		    		}
	    		}
	    		else{
	    			msgprint("please select Pick Day.")
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
	cur_frm.fields_dict["table_17"].grid.set_column_disp("f_type", 0);
}

// Hide and unhide  percentage field from amount details child table as per the  requirement.....
cur_frm.cscript.milestone_calculation = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.milestone_calculation=='Percentage');

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

// Hide and unhide  percentage field from amount details child table as per the  requirement.....
cur_frm.cscript.fixed_milestone = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.fixed_milestone=='Percentage');

	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

// Hide and unhide  percentage field from amount details child table as per the  requirement.....
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

// Hide and unhide  percentage field from amount details child table as per the  requirement.....
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

// Hide and unhide  percentage field from amount details child table as per the  requirement.....
cur_frm.cscript.fixed_type = function(doc,cdt,cdn){
	if(doc.fixed_type=='Milestone' && doc.fixed_milestone=='Percentage')
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);

	// if(doc.fixed_type=='Milestone' && doc.p_type=='Fixed + Variable')
	// 	cur_frm.fields_dict["table_17"].grid.set_column_disp("type", 1);
	// else
	// 	cur_frm.fields_dict["table_17"].grid.set_column_disp("type", 0);


	return $c_obj(doc, 'clear_child_table','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
	});
}

// If percentage is specified then calculate the amount as per the percentage specified with respect to the Project  value......
cur_frm.cscript.percentage = function(doc,cdt,cdn){
	var d = locals[cdt][cdn]
	if(doc.p_type!='Fixed + Variable'){
		if(d.percentage && doc.p_value){
			if(d.percentage>=0 && d.percentage<=100){
				d.amount = Math.round(doc.p_value *(d.percentage/100))
				refresh_field('table_17');
			}
			else{
				msgprint("Percentage Value must be greater than 0% and less than 100%")
				d.percentage=''
				refresh_field('table_17')
			}
		}
	}
	else{
		if(d.percentage && doc.fix_val){
			if(d.percentage>=0 && d.percentage<=100){
				d.amount = Math.round(doc.fix_val *(d.percentage/100))
				refresh_field('table_17');
			}
			else{
				msgprint("Percentage Value must be greater than 0% and less than 100%")
				d.percentage=''
				refresh_field('table_17')
			}
		}
	}
}

// cur_frm.cscript.amount = function(doc,cdt,cdn){
// 	var d = locals[cdt][cdn]
// 	if(d.percentage && doc.p_value){
// 		d.amount = doc.p_value * (d.percentage/100)
// 		refresh_field('table_17')
// 	}
// 	else{
// 		msgprint("Please enter Percentage Value first.")
// 		d.amount=''
// 		refresh_field('table_17')
// 	}
// }

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
