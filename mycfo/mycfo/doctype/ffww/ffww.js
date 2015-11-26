// // Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// // License: GNU General Public License v3. See license.txt

{% include 'controllers/js/contact_address_common.js' %};

cur_frm.add_fetch('contact','first_name','first_name');
cur_frm.add_fetch('contact','last_name','last_name');
cur_frm.add_fetch('contact','linkedin_id','linkedin_id');
cur_frm.add_fetch('contact','skype_id','skype_id');

frappe.ui.form.on("FFWW", {
	refresh: function(frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Create Address"), function() {
				frappe.model.open_mapped_doc({
					method: "mycfo.mycfo.doctype.ffww.ffww.make_address",
					frm: frm
				})
			});
		}
	},
	
});


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
}

cur_frm.fields_dict['customer'].get_query = function(doc) {
	return{	query: "mycfo.mycfo.doctype.ffww.ffww.get_active_customers" }
}
