// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("FFWW", "refresh", function(frm) {
	var me = this;
	contact.operations.init(frm);
	
});

frappe.provide("contact")
contact.operations = {
	init:function(frm){
		var me = this;
		this.doc = frm.doc
		if(frappe.route_options){
			me.enable_contact(frm,frappe.route_options["doc"])
		}
		else {
			if(frm.doc.customer)
				me.enable_contact_posting(frm)
		}
	},

	enable_contact:function(frm,doc){
		var me = this;
		var me = this;
		frm.disable_save();
		frm.doc.customer = frappe.route_options['customer']
		if(frm.doc.customer){
			frappe.call({
				method:"mycfo.mycfo.doctype.ffww.ffww.load_address_and_contact",
				args:{doc: frm.doc,key:'customer'},
				callback: function(r) {
					if(frm.fields_dict['contact_html']) {
						$(frm.fields_dict['contact_html'].wrapper)
							.html(frappe.render_template("contact_list",
								r.message))
							.find(".btn-contact").on("click", function() {
								new_doc("Contact");
							}
						);
				}
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
		})
	}
	

	},

	enable_contact_posting:function(frm){
		var me = this;
		me.manage_primary_operations(frm)	
	},

	manage_primary_operations:function(frm){
		var me = this;
		frm.disable_save();
		frappe.call({
				method:"mycfo.mycfo.doctype.ffww.ffww.load_address_and_contact",
				args:{doc: frm.doc,key:'customer'},
				callback: function(r) {
					if(frm.fields_dict['contact_html']) {
						$(frm.fields_dict['contact_html'].wrapper)
							.html(frappe.render_template("contact_list",
								r.message))
							.find(".btn-contact").on("click", function() {
								new_doc("Contact");
							}
						);
				}
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
		})
	},
}
