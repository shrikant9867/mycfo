
frappe.ui.form.on("IP Download Approval", {
	onload: function(frm) {
	},
	refresh:function(frm){
		if(frm.doc.docstatus == 0 && !frm.doc.__islocal) {
			cur_frm.add_custom_button(__('Download'), function(){ 
				var file_url = frm.doc.file_path;
				if (frm.doc.file_name) {
					file_url = file_url.replace(/#/g, '%23');
				}
				window.open(file_url);
			})
		}
		cd_fields = []
		
		if (!inList(user_roles, "Central Delivery")){
			cd_fields = ["central_delivery_status", "central_delivery", "central_delivery_comments"]			
		}
		else{
			frm.doc.central_delivery = frappe.user.name
			refresh_field(["central_delivery"])
		}

		$.each(cd_fields, function(index, value){
				cur_frm.set_df_property(value, "read_only", 1);	
		})
	}
});


// frappe.ui.form.on("IP Download Approval", "approver_status", function(frm){
// 	console.log("adsjkhadk")
// 	if(frm.doc.approver_status == "Approved"){
// 		frm.doc.file_rejected =  "";
// 		refresh_field(["file_rejected"])
// 	}

// })

// frappe.ui.form.on("IP Download Approval", "central_delivery_status", function(frm){
// 	if(frm.doc.central_delivery_status == "Approved"){
// 		frm.doc.file_rejected = "";
// 		refresh_field(["file_rejected"])
// 	}

// })


cur_frm.set_query("central_delivery", function() {
   	return {
   		query:"mycfo.ip_library.doctype.ip_approver.ip_approver.get_central_delivery_user"
   	}
});


// cur_frm.set_query("approver", function() {
//    	return {
//    		query:"mycfo.ip_library.doctype.ip_approver.ip_approver.get_user_with_el_roles",
//    		filters:{"project_id":cur_frm.doc.project}
//    	}
// });