// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

{% include 'controllers/js/contact_address_common.js' %};


cur_frm.add_fetch('customer', 'customer_name', 'customer_name');

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
		}

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
			msgprint("End Date must be greater than start Date")
		}

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

	if(doc.fix_val && doc.var_val){
		return $c_obj(doc, 'validate_fixed_variable_type','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
		});
	}
	// if(doc.fixed_pick_date && doc.fixed_type=='Monthly'){
	// 	return $c_obj(doc, 'get_child_details',months,function(r, rt) {
	// 		var doc = locals[cdt][cdn];
	// 	});
	// }


}

cur_frm.cscript.var_val= function(doc, cdt, cdn) {
	if (!doc.p_value)
	{
		msgprint("First enter the project value")

	}

	months = cur_frm.cscript.cacluate_months(doc.start_date,doc.end_date)

	if(doc.fix_val && doc.var_val){
		return $c_obj(doc, 'validate_fixed_variable_type','',function(r, rt) {
			var doc = locals[cdt][cdn];
			cur_frm.refresh();
		});
	}

}

cur_frm.cscript.pick_date= function(doc, cdt, cdn) {
	if (doc.start_date && doc.end_date)
	{
		var date1 = new Date(doc.start_date);
		var date2 = new Date(doc.end_date);
		//var date3 = new Date(doc.fixed_pick_date);
		start_day = date1.getDate()
		end_day = date2.getDate()
		console.log(start_day)
		console.log(typeof(end_day))
		console.log(typeof(doc.pick_date))
		if(parseInt(doc.pick_date)>start_day && doc.pick_date<end_day){
			console.log("in between")
		}
		else{
			msgprint("Pick Day Must be in between the start date and end date")
			doc.pick_date=''
			refresh_field('pick_date');
		}
	}
	else{
		msgprint("First Enter start date and end date")
		doc.pick_date=''
		refresh_field('pick_date');
	}	

}

cur_frm.cscript.p_type= function(doc, cdt, cdn) {
	if (!doc.p_value)
	{
		msgprint("First enter the project value")
		doc.p_type =''
		refresh_field('p_type')

	}

}


cur_frm.cscript.fixed_pick_date= function(doc, cdt, cdn) {
	if (doc.start_date && doc.end_date)
	{
		var date1 = new Date(doc.start_date);
		var date2 = new Date(doc.end_date);
		//var date3 = new Date(doc.fixed_pick_date);
		start_day = date1.getDate()
		end_day = date2.getDate()
		if(doc.fixed_pick_date>start_day && doc.fixed_pick_date<end_day){
			console.log("in between")
		}
		else{
			msgprint("Pick day must be in between the start day and end day")
			doc.fixed_pick_date=''
			refresh_field('fixed_pick_date');
		}
	}
	else{
		msgprint("First Enter start date and end date")
		doc.fixed_pick_date=''
		refresh_field('fixed_pick_date');
	}	

}


cur_frm.cscript.generate_records = function(doc,cdt,cdn){
    console.log("in generate records")
    // if project type is fixed
    if(doc.p_type=='Fixed'){
    	if(doc.type=='Monthly'){
    		if(doc.pick_date){
    			if(doc.start_date && doc.end_date)
    				months = cur_frm.cscript.cacluate_months(doc.start_date,doc.end_date)
    			if(months){
    				if(doc.p_value){
    					console.log(doc.p_value)
    					return $c_obj(doc, 'get_child_details',months,function(r, rt) {
							var doc = locals[cdt][cdn];
							cur_frm.refresh();
						});
    				}
    			}
    		}
    		else{
    			msgprint("Please enter pick day.")
    		}
    	}
    	else{
    		msgprint("Please specify type.")
    	}
    }

    if(doc.p_type=='Fixed + Variable'){
    	if(doc.fix_val){
	    	if(doc.fixed_type=='Monthly'){
	    		if(doc.fixed_pick_date){
	    			if(doc.start_date && doc.end_date)
	    				months = cur_frm.cscript.cacluate_months(doc.start_date,doc.end_date)
	    			if(months){
	    				if(doc.fix_val){
	    					console.log(doc.fix_val)
	    					return $c_obj(doc, 'get_child_details_for_fixed_variable',months,function(r, rt) {
								var doc = locals[cdt][cdn];
								cur_frm.refresh();
							});
	    				}
	    			}
	    		}
	    		else{
	    			msgprint("please enter pick day.")
	    		}
	    	}
	    	else{
	    		msgprint("Please specify type.")
	    	}
    }
    else{
    	msgprint("Please specify fixed value")
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
}

cur_frm.cscript.fixed_milestone = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.fixed_milestone=='Percentage');
}

cur_frm.cscript.milestone_based = function(doc,cdt,cdn){
	cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", doc.milestone_based=='Percentage');
}

cur_frm.cscript.type = function(doc,cdt,cdn){
	if(doc.type=='Milestone' && doc.milestone_calculation=='Percentage') 

		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);
}

cur_frm.cscript.fixed_type = function(doc,cdt,cdn){
	if(doc.fixed_type=='Milestone' && doc.fixed_milestone=='Percentage')
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 0);
}

cur_frm.cscript.milestone_based = function(doc,cdt,cdn){
	if(doc.milestone_based=='Milestone' && doc.milestone_based=='Percentage')
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
	else
		cur_frm.fields_dict["table_17"].grid.set_column_disp("percentage", 1);
}

cur_frm.cscript.percentage = function(doc,cdt,cdn){
	var d = locals[cdt][cdn]
	if(d.percentage && doc.p_value){
		if(d.percentage>0 && d.percentage<=100){
			d.amount = doc.p_value *(d.percentage/100)
			refresh_field('table_17');
		}
		else{
			msgprint("percentage value must be less than 100%")
			d.percentage=''
			refresh_field('table_17')
		}
	}
}