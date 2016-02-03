frappe.ui.form.on("Assessment", {
	// body...
	onload: function(frm, cdt, cdn) {
	},
	refresh: function(frm, cdt, cdn){
		if(frm.doc.__islocal) {
			frm.doc.assessment_author = frappe.user.name
			refresh_field(["assessment_author"])
		}
		
			
	}
})


frappe.ui.form.on("Assessment Question Sheet", "question_type", function(frm, cdt, cdn){
	child_row = locals[cdt][cdn]
	if (child_row.question_type == "Objective"){
		child_row.total_marks = 1;
		// cur_frm.get_field("table_5").grid.docfields[13].read_only = 1;
		refresh_field("table_5")
	}

})