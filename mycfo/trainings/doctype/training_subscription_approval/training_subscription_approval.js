
frappe.ui.form.on("Training Subscription Approval", {
	onload: function(frm) {
	},
	refresh:function(frm){
		if (inList(user_roles, "Central Delivery")){
			frm.doc.central_delivery = frappe.user.name
			refresh_field(["central_delivery"])
		}
		
	}
});