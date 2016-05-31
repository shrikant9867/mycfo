

{% include 'ip_library/doctype/ip_file/upload.js' %}

cur_frm.add_fetch("skill_matrix_120", "skill_matrix_18", "skill_matrix_18")
cur_frm.add_fetch("file_approver", "employee_name", "employee_name")

frappe.ui.form.on("IP File", {
	onload: function(frm) {
	},
	refresh:function(frm, cdt, cdn){
		if (frm.doc.__islocal){
			frm.doc.request_type = "New"
			frm.doc.file_approver = ""
			refresh_field(["request_type", "file_approver"])
			cur_frm.set_df_property("file_approver", "hidden", 1)
		}
		else{
			var fields = ["document_type", "file_approver", "file_name", "customer"]
			$.each(fields, function(index, value){
				cur_frm.set_df_property(value, "read_only", 1)
			})
		}
		make_fields_mandatory_for_cd_role();	
		if (inList(["Published", "Republished", "Rejected by CD (Archive)", "Rejected by CD (Edit)", "Validity Upgraded", "Rejected by CD (Validity)"], frm.doc.file_status)){
			init_for_archive_file(frm)
			init_for_validity_upgrade(frm)
		}
		prepare_for_edit_file(frm, cdt, cdn)

			
	},
	customer:function(frm){
		if(frm.doc.customer && !inList(user_roles, "Central Delivery") ){
			frappe.call({
				async:false,
				freeze:true,	
				method:"mycfo.ip_library.page.ip_file_dashboard.ip_file_dashboard.validate_user_is_el",
				args:{"customer":frm.doc.customer},
				callback:function(r){
					if (r.message.is_el){
						toggle_approver_fields();
					}else{
						init_for_post_customer_selection_process(0, 1)
					}

				}
			});	
		}else{
			toggle_approver_fields();
		}				
	},
	after_save:function(){
		cur_frm.reload_doc();
		cur_frm.refresh();
		if(inList(user_roles, "Central Delivery") && inList(["New", "Edit"], cur_frm.doc.request_type) && cur_frm.doc.approver_link){
			window.location.reload();
		}
	}

});



init_for_upload_file = function(frm ,cdt, cdn){
	var me = this;
	this.dialog = new frappe.ui.Dialog({
		title: __(__("Upload")),
		fields: [
			{fieldtype:"HTML", fieldname:"upload_area"},
		]
	});
	this.dialog.show();
	this.dialog.get_field("upload_area").$wrapper.empty();

	this.upload_options = {
		parent: this.dialog.get_field("upload_area").$wrapper,
		btn: this.dialog.set_primary_action(__("Attach")),
		on_no_attach: function() {
			msgprint(__("Please attach a file."));
		},
		callback: function(file_data) {
			// frm.doc.file_name = file_data.file_name
			if (!frm.doc.__islocal && frm.doc.file_name + '.' + frm.doc.file_extension == file_data.file_name){
				me.init_after_file_upload(frm, me, file_data)

			}else if(frm.doc.__islocal){
				me.init_after_file_upload(frm, me, file_data)

			} 
			else{
				msgprint("Different IP File detected while uploading document.")
			}
			
		},
		onerror: function() {
			me.dialog.hide();
		},
	}

	upload.make(this.upload_options);

},



init_after_file_upload = function(frm, me, file_data){
	file_name_array = file_data.file_name.split('.')
	if (file_name_array.length != 1){
		frm.doc.file_extension = file_name_array[file_name_array.length - 1]
	}
		frm.doc.file_data = file_data
		me.init_for_edit_file(frm)
		refresh_field(["file_name", "file_extension", "file_data", "request_type"])
		me.dialog.hide();

}

init_for_edit_file = function(frm){
	if(inList(["Published", "Edit Pending", "Republished", "Rejected by CD (Edit)", 
				"Approved by Approver (Edit)", "Rejected by Approver (Edit)", "Rejected by CD (Edit)", "Rejected by CD (Validity)", "Validity Upgraded", "Rejected by CD (Archive)"], frm.doc.file_status) ){
		frm.doc.request_type = "Edit"
	}

}


cur_frm.set_query("file_approver", function() {
   	return {
   		query: "mycfo.ip_library.doctype.ip_file.ip_file.get_approver_list",
   		filters: { "customer":cur_frm.doc.customer }
   	}
});

cur_frm.set_query("skill_matrix_120", function() {
   	return {
   		filters: { "skill_matrix_18":cur_frm.doc.skill_matrix_18 }
   	}
});

cur_frm.set_query("customer", function() {
   	return {
   		query: "mycfo.ip_library.doctype.ip_file.ip_file.get_customer_list",
   	}
});


init_for_archive_file =  function(frm){
	cur_frm.add_custom_button(__('Archive File'), function(){ 
				frappe.confirm(__("Are you sure you want to archive document ?"), function() {
					return frappe.call({
						freeze:true,
						freeze_message:"Please Wait  .....................",
						method:"mycfo.ip_library.doctype.ip_file.ip_file.init_for_archive_request",
						args:{"doc":frm.doc},
						callback:function(r){
							if(inList(user_roles, "Central Delivery")){
								frappe.msgprint("IP File archived successfully.")
							}else{
								frappe.msgprint("IP Archive Request created successfully.")	
							}
							cur_frm.reload_doc();
						}
				})
		});	
	});
}


init_for_validity_upgrade = function(frm){
	cur_frm.add_custom_button(__('Upgrade Validity'), function(){
		new validity_upgrade(frm);
	}) 
}

validity_upgrade = Class.extend({
	init:function(frm){
		this.frm = frm;
		this.make_dialog();
	},
	make_dialog:function(){
		var me = this;
		this.dialog = new frappe.ui.Dialog({
						title: "Upgrade Validity",
						fields: [
								{"fieldtype": "Date", "label": __("Validity Date"), "fieldname": "validity", "reqd": 1},
							],
						primary_action_label: "Upgrade Validity",
						primary_action: function(doc) {
								validity = me.dialog.fields_dict.validity.input.value
								me.frm.doc.new_validity = validity
								if (validity){
										me.dialog.hide();
										return frappe.call({
											freeze:true,
											freeze_message:"Please Wait  .....................",
											method:"init_for_validity_upgradation",
											doc: me.frm.doc,
											callback:function(r){
												if(inList(user_roles, "Central Delivery")){
													frappe.msgprint("Validity upgraded successfully")
												}else{
													frappe.msgprint("IP File validity upgrade request created successfully.")
												}
												cur_frm.reload_doc();
												
											}
										})

								}else{
									msgprint("Validity Date is mandatory.")
								} 	
								
							}							
						})
		this.dialog.show();

		this.dialog.fields_dict.validity.$input.change(function(){
			var formatted_date = frappe.datetime.user_to_str($(this).val());
			if(frappe.datetime.get_day_diff(formatted_date, me.frm.doc.validity_end_date) <= 0){
				me.dialog.fields_dict.validity.input.value = ""	
				frappe.msgprint("Validity end date must be greater than current validity end date {0}.".replace("{0}", me.frm.doc.validity_end_date) )
			}
	
		})



	}

})


prepare_for_edit_file = function(frm, cdt, cdn){
	if(! inList(["Archive Pending", "Upgrade Validity Pending", "Archived"], frm.doc.file_status) ){
		cur_frm.add_custom_button(__('Upload File'), function(){ init_for_upload_file(frm, cdt, cdn) });	
	}
	
}

make_fields_mandatory_for_cd_role = function(){
	if(in_list(user_roles, "Central Delivery")){
		var fields = ["security_level", "validity_end_date"];
		toggle_fields_for_cd_role(fields, 1, 0);
	}

}

init_for_post_customer_selection_process = function(hidden_value, reqd_value){
	$.each(["file_approver", "employee_name"], function(index, value){
		cur_frm.set_df_property(value, "hidden", hidden_value);
		cur_frm.set_df_property(value, "reqd", reqd_value);
	});
}

toggle_approver_fields = function(){
	cur_frm.doc.file_approver = "";
	cur_frm.doc.employee_name = "";
	init_for_post_customer_selection_process(1, 0)
	cur_frm.refresh_fields(["file_approver", "employee_name"])
}

toggle_fields_for_cd_role = function(fields, reqd_value, read_only_value){
	$.each(fields, function(index, value){
		cur_frm.set_df_property(value, "reqd", reqd_value)
		cur_frm.set_df_property(value, "read_only", read_only_value)
	})
}