cur_frm.add_fetch("skill_matrix_120", "skill_matrix_18", "skill_matrix_18")
cur_frm.add_fetch("evaluator", "employee_name", "evaluator_name")


frappe.ui.form.on("Training Approver", {
	// body...
	onload: function(frm, cdt, cdn) {
	},
	refresh: function(frm, cdt, cdn){
		if(frm.doc.docstatus == 0 && !frm.doc.__islocal) {
			cur_frm.add_custom_button(__('Download'), function(){ 
				var training_url = frm.doc.training_path;
				if (frm.doc.training_path) {
					training_url = training_url.replace(/#/g, '%23');
				}
				window.open(training_url);

			});	
		}
		frm.doc.central_delivery = frappe.user.name
		refresh_field(["central_delivery"])		
			
	}
})