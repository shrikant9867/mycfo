

{% include 'ip_library/doctype/ip_file/upload.js' %}

cur_frm.add_fetch("skill_matrix_120", "skill_matrix_18", "skill_matrix_18")
cur_frm.add_fetch("file_approver", "employee_name", "employee_name")

frappe.ui.form.on("IP File", {
	onload: function(frm) {
		console.log("in onload")
	},
	refresh:function(frm, cdt, cdn){
		console.log("refresh")
		if (frm.doc.__islocal){
			frm.doc.request_type = "New"
			refresh_field("request_type")
		}
		else{
			cur_frm.set_df_property("document_type", "read_only", 1)
			cur_frm.set_df_property("file_approver", "read_only", 1)
			// cur_frm.set_df_property("file_name", "read_only", 1)
		}
		cur_frm.add_custom_button(__('Upload File'), function(){ init_for_upload_file(frm, cdt, cdn) });	
		
			
	}
});



init_for_upload_file = function(frm ,cdt, cdn){
	console.log(frm)
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
			msgprint(__("Please attach a file or set a URL"));
		},
		callback: function(file_data) {
			frm.doc.file_name = file_data.file_name
			frm.doc.file_extension = file_data.file_ext
			frm.doc.file_data = file_data
			me.init_for_edit_file(frm)
			refresh_field(["file_name", "file_extension", "file_data", "request_type"])
			me.dialog.hide();
		},
		onerror: function() {
			me.dialog.hide();
		},
	}

	upload.make(this.upload_options);

},


init_for_edit_file = function(frm){
	console.log("edit file")
	console.log(cur_frm)
	if(inList(["Published", "Edit Pending", "Republished"], frm.doc.file_status) ){
		frm.doc.request_type = "Edit"
		console.log("In edit if")
	}

}


cur_frm.set_query("file_approver", function() {
   	return {
   		query: "mycfo.ip_library.doctype.ip_file.ip_file.get_approver_list",
   		filters: { "project":cur_frm.doc.project }
   	}
});

cur_frm.set_query("skill_matrix_120", function() {
   	return {
   		filters: { "skill_matrix_18":cur_frm.doc.skill_matrix_18 }
   	}
});