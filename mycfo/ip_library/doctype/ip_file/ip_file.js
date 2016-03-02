

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
		}
		else{
			$.each(["document_type", "file_approver", "file_name", "customer"], function(index, value){
				cur_frm.set_df_property(value, "read_only", 1)
			})
		}
			
		if (inList(["Published", "Republished", "Rejected by CD (Archive)", "Rejected by CD (Edit)", "Validity Upgraded", "Rejected by CD (Validity)"], frm.doc.file_status)){
			init_for_archive_file(frm)
			init_for_validity_upgrade(frm)
		}
		prepare_for_edit_file(frm, cdt, cdn)
			
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
							frm.doc.file_status = "Archive Pending"
							frm.doc.request_type = "Archive"
							frm.save()
							frappe.msgprint("IP Archive Request created successfully.")
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
								// me.frm.doc.new_validity = validity
								if (validity){
										me.dialog.hide();
										return frappe.call({
											freeze:true,
											freeze_message:"Please Wait  .....................",
											method:"init_for_validity_upgradation",
											doc: me.frm.doc,
											callback:function(r){
												
												cur_frm.refresh();
												frappe.msgprint("IP File validity upgrade request created successfully.")
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