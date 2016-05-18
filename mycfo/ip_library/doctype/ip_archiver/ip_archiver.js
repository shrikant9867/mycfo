frappe.ui.form.on("IP Archiver", {
	refresh:function(frm){
		if(inList(user_roles, "Central Delivery") && frm.doc.docstatus != 1){
			frm.doc.central_delivery = frappe.user.name
			refresh_field(["central_delivery"])
		}

	}
});	


cur_frm.set_query("central_delivery", function() {
   	return {
   		query:"mycfo.ip_library.doctype.ip_approver.ip_approver.get_central_delivery_user"
   	}
});