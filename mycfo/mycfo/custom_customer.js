
frappe.ui.form.on("Customer", "refresh", function(frm) {
	if(!frm.doc.__islocal) {
			cur_frm.add_custom_button(__('Customer Skill Mapping'), 
					cur_frm.cscript.get_skill_mapping)
	}
})


cur_frm.cscript.get_skill_mapping = function(){
		return frappe.call({
		method: "mycfo.mycfo.doctype.customer_skill_mapping.customer_skill_mapping.get_customer_skill_mapping",
		args: {
			"customer": cur_frm.doc.name,
			"group": cur_frm.doc.customer_group,
			"segment": cur_frm.doc.customer_segment
		},
		callback: function(r) {
			var doclist = frappe.model.sync(r.message);
			frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
		}
	});
}