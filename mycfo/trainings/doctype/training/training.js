
{% include 'trainings/doctype/training/upload.js' %}

cur_frm.add_fetch("skill_matrix_120", "skill_matrix_18", "skill_matrix_18")
cur_frm.add_fetch("evaluator", "employee_name", "evaluator_name")

frappe.ui.form.on("Training", {
	// body...
	onload: function(frm, cdt, cdn) {
	},
	refresh: function(frm, cdt, cdn){
		console.log("refresh")
		if (frm.doc.__islocal)
			cur_frm.add_custom_button(__('Upload Training'), function(){ init_for_upload_training(frm, cdt, cdn) });
		else
			make_fields_read_only(frm)		
	}
})


init_for_upload_training = function(frm, cdt, cdn){
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
			msgprint(__("Please attach a file"));
		},
		callback: function(file_data) {
			if (file_data){
				frm.doc.training_file_data = JSON.stringify(file_data['file_list'])
				frm.doc.training_documents = file_data['file_names'].join('\n')
				refresh_field(["training_file_data", "training_documents"])
				me.dialog.hide();
			}
		},
		onerror: function() {
			me.dialog.hide();
		},
	}

	new upload(this.upload_options);
}


make_fields_read_only = function(frm){
	var fields = ["evaluator" ,"assessment"]
	$.each(fields ,function(index, value){
		cur_frm.set_df_property(value, "read_only", 1)
	}) 

}


cur_frm.fields_dict.assessment.get_query = function(doc, cdt, cdn){
	return {
		filters:{"training_name":""}
	}
}