frappe.ui.form.on("IP Archiver", {
	refresh:function(frm){
		// if(inList(user_roles, "Central Delivery")){
		// 	console.log(frappe.get_cookie("user_id"))
		// 	frm.doc.central_delivery = frappe.get_cookie("user_id")
		// 	refresh_field(["central_delivery"])
		// }

	}
});	


cur_frm.set_query("central_delivery", function() {
   	return {
   		query:"mycfo.ip_library.doctype.ip_approver.ip_approver.get_central_delivery_user"
   	}
});