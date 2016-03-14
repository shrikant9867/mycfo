
frappe.ui.form.on("IP Approver", {
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
		if (!inList(user_roles, "Central Delivery")){
			cd_fields = ["central_delivery_status", "central_delivery", "central_delivery_comments"]
			
		}else{
			cd_fields = ["approver_status", "approver", "approver_comments"]
			frm.doc.central_delivery = frappe.user.name
			refresh_field(["central_delivery"])																																																																																																																																																																																																																																																															
		}
		make_read_only_fields(cd_fields)
		check_for_validity_upgrade()
		
	}
});


frappe.ui.form.on("IP Approver", "approver_status", function(frm){
	if(frm.doc.approver_status == "Approved"){
		frm.doc.file_rejected =  "";
		refresh_field(["file_rejected"])
	}
	if (frm.doc.approver_status != frm.doc.comment_flag){
		frm.doc.comment_flag = "";
		refresh_field(["comment_flag"])
	
	}
	

})

frappe.ui.form.on("IP Approver", "central_delivery_status", function(frm){
	if(frm.doc.central_delivery_status == "Approved"){
		frm.doc.file_rejected = "";
		refresh_field(["file_rejected"])
	}

})


frappe.ui.form.on("IP Approver", "validity_end_date", function(frm){
	if(frappe.datetime.get_day_diff(frm.doc.validity_end_date, frappe.datetime.nowdate()) <= 0){
		frm.doc.validity_end_date = "";
		refresh_field(["validity_end_date"])
		frappe.msgprint("Validity End Date must be greater than Current Date.")
	}

})


cur_frm.set_query("central_delivery", function() {
   	return {
   		query:"mycfo.ip_library.doctype.ip_approver.ip_approver.get_central_delivery_user"
   	}
});



make_read_only_fields = function(cd_fields){
	$.each(cd_fields, function(index, value){
		cur_frm.set_df_property(value, "read_only", 1);	
	})

}

check_for_validity_upgrade = function(){
	if (cur_frm.doc.request_type == 'Upgrade Validity'){
		fields = ["industry", "source", "skill_matrix_18", "skill_matrix_120", "file_description", "level_of_approval"]
		make_read_only_fields(fields)
	}
} 