// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Operational Matrix Details", "refresh", function(frm) {
	var me = this;
	OM.operations.init(frm);
	
});

frappe.provide("OM")
OM.operations = {
	init:function(frm){
		var me = this;
		this.doc = frm.doc
		if(frappe.route_options){
			me.enable_om(frm,frappe.route_options["doc"])
		}
		else {
			if(frm.doc.customer)
				me.enable_contact_posting(frm)
		}
	},

	enable_om:function(frm,doc){
		var me = this;
		var me = this;
		frm.disable_save();
		frm.doc.customer = frappe.route_options['customer']
		if(frm.doc.customer){
			frappe.call({
				method:"mycfo.mycfo.doctype.ffww.ffww.load_operational_data",
				args:{doc: frm.doc,key:'customer'},
				callback: function(r) {
					if(frm.fields_dict['operation_matrix_details']) {
						$(frm.fields_dict['operation_matrix_details'].wrapper)
							.html(frappe.render_template("operational_matrix_list",
								r.message))
							.find(".btn-operational_matrix").on("click", function() {
								new_doc("Operational Matrix");
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
				method:"mycfo.mycfo.doctype.ffww.ffww.load_operational_data",
				args:{doc: frm.doc,key:'customer'},
				callback: function(r) {
					if(frm.fields_dict['operation_matrix_details']) {
						$(frm.fields_dict['operation_matrix_details'].wrapper)
							.html(frappe.render_template("operational_matrix_list",
								r.message))
							.find(".btn-operation_matrix").on("click", function() {
								new_doc("Operational Matrix");
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
