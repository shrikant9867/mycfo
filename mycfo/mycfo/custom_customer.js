
frappe.ui.form.on("Customer", "refresh", function(frm) {
	if(!frm.doc.__islocal) {
			cur_frm.add_custom_button(__('Customer Skill Mapping'), 
					cur_frm.cscript.get_skill_mapping)
			cur_frm.cscript.init_for_el_sign_off();
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


cur_frm.cscript.init_for_el_sign_off = function(){
	frappe.call({
		async:false,
		freeze:true,
		method:"mycfo.ip_library.page.ip_file_dashboard.ip_file_dashboard.validate_user_is_el",
		args:{"customer":cur_frm.docname},
		callback:function(r){
			if (r.message.is_el){
				cur_frm.add_custom_button(__('Sign Off'), cur_frm.cscript.add_comment)
			}

		}
	});
}


cur_frm.cscript.add_comment = function(){
	frappe.call({
			method: "frappe.desk.form.utils.add_comment",
			args: {
				doc:{
					doctype: "Comment",
					comment_type: "Comment",
					comment_doctype: cur_frm.doctype,
					comment_docname: cur_frm.docname,
					comment: repl("EL %(user)s has signed off this customer.", {"user":frappe.user.full_name()}),
					comment_by: user
				}
			},
			callback: function(r) {
				if(r.message.name){
					msgprint("Customer signed off successfully.");
					cur_frm.reload_doc();
				}
			}
	});
}
