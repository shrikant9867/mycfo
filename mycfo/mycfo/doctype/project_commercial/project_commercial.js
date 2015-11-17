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

}

cur_frm.cscript.var_val= function(doc, cdt, cdn) {
	if (!doc.p_value)
	{
		msgprint("First enter the project value")

	}

}

