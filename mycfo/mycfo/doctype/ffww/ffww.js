// // Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// // License: GNU General Public License v3. See license.txt

{% include 'controllers/js/contact_address_common.js' %};

cur_frm.add_fetch('contact','first_name','first_name');
cur_frm.add_fetch('contact','last_name','last_name');
cur_frm.add_fetch('contact','linkedin_id','linkedin_id');
cur_frm.add_fetch('contact','skype_id','skype_id');

cur_frm.add_fetch('contact','country_code','country_code');
cur_frm.add_fetch('contact','email','email');
cur_frm.add_fetch('contact','mobile','mobile');
cur_frm.add_fetch('contact','landline','landline');

cur_frm.add_fetch('country_name','country_code','country_code');
cur_frm.add_fetch('country_name','number_of_digits_allowed','digit');

// Add two buttonns on ffww form ............................................
frappe.ui.form.on("FFWW", {
	refresh: function(frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Create Address"), function() {
				frappe.model.open_mapped_doc({
					method: "mycfo.mycfo.doctype.ffww.ffww.make_address",
					frm: frm
				})
			});

			frm.add_custom_button(__("See Tree View"), function() {
				frappe.route_options = {
											"customer": frm.doc['customer'],
										};
				frappe.set_route("FFWW", "mycfo");
			});
		}
	},
	
});


// Once contact is selected fetch all the corresponding contact details in ffww  form.....................
cur_frm.cscript.contact = function(doc,cdt,cdn){
	if(doc.contact){
		return frappe.call({
			method: 'mycfo.mycfo.doctype.ffww.ffww.make_contact',
			args: {'contact': doc.contact},
			callback: function(r) {
				if(r.message){
					doc.more_contact_details =''
					refresh_field('more_contact_details')
					$.each(r.message, function(i, item) {
							var d = frappe.model.add_child(cur_frm.doc, "FFWW Contact Details", "more_contact_details");
							d.contact_type = item[0];
							d.email_id = item[1];
							d.mobile_no = item[2];
							d.country_code = item[3];
							d.country = item[4];
							d.ffww = item[5];
							d.contact_name = item[6];
							d.country_name =item[7];
					});
					refresh_field('more_contact_details')
				}
				else{
					return $c_obj(doc, 'clear_child_table','',function(r, rt) {
						var doc = locals[cdt][cdn];
						cur_frm.refresh();
					});
				}
			}
		});
	}
	else{
		return $c_obj(doc, 'clear_child_table','',function(r, rt) {
						var doc = locals[cdt][cdn];
						cur_frm.refresh();
		});
	}
}

cur_frm.fields_dict['customer'].get_query = function(doc) {
	return{	query: "mycfo.mycfo.doctype.ffww.ffww.get_active_customers" }
}

// Trigger on ADD Row of child table to link newly added contact details aginst same contact and current FFWW record..................
cur_frm.cscript.more_contact_details_add = function(doc,cdt,cdn){
	var d = locals[cdt][cdn]
	last_route = frappe.route_history[0];
		if(last_route && last_route[0]==="Form") {
			var doctype = last_route[1],
				docname = last_route.slice(2).join("/");
				if(doctype=='FFWW'){
					d.ffww = docname
					refresh_field('more_contact_details')
				}
		}

}

//Validate Email ID..........................................................................
cur_frm.cscript.email_id = function(doc,cdt,cdn){
	var d = locals[cdt][cdn];
	var reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (reg.test(d.email_id) == false) 
	{
	    msgprint('Invalid Email Address');
	    d.email_id=''
	    refresh_field('more_contact_details');
	}
}

// Validate Mobiel No....................................................................
cur_frm.cscript.mobile_no = function(doc,cdt,cdn){
	var d = locals[cdt][cdn];
	if(isNaN(d.mobile_no)==true){
		msgprint("Mobile number must be consist of only Digits")
		d.mobile_no=''
		refresh_field('more_contact_details');
	}
	if(d.country_name && d.mobile_no){
		if((d.mobile_no).toString().length != parseInt(d.digit)){
			msgprint('Mobile Number must be '+d.digit+' digits as per the country '+d.country_name+'');
			d.mobile_no=''
			refresh_field('more_contact_details');
		}
	}
}

// validate mobile number digits according to the country selected...........................
cur_frm.cscript.country_name = function(doc,cdt,cdn){
	var d = locals[cdt][cdn];
	if(d.mobile_no){
		if((d.mobile_no).toString().length!= parseInt(d.digit)){
			msgprint('Mobile Number must be '+d.digit+' digits as per the country '+d.country_name+'');
			d.mobile_no=''
			refresh_field('more_contact_details');
		}
	}
}