frappe.ui.form.on("Assessment", {
	// body...
	onload: function(frm, cdt, cdn) {
	},
	refresh: function(frm, cdt, cdn){
		if(frm.doc.__islocal) {
			frm.doc.assessment_author = frappe.user.name
			frm.doc.assessment_type = "Question Sheet"
			refresh_field(["assessment_author", "assessment_type"])
		}
		
			
	}
})