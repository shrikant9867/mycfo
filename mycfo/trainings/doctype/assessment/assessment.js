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
	read_only_fields = []
	if (child_row.question_type == "Objective"){
		child_row.total_marks = 1;
		read_only_fields = ["question_name", "subjective_answer"]
		refresh_field("table_5")
	}else{
		read_only_fields = ["option_a", "option_b", "option_c", "option_d", "option_e", 
							"objective_answer", "question_name"]
	}

	make_read_only(read_only_fields, child_row)
})



frappe.ui.form.on("Assessment Question Sheet", {
	option_b: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if(!row.option_b)
			flush(row,["option_c","option_d", "option_e"])
	},
	option_c: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if(!row.option_c)
			flush(row,["option_d", "option_e"])
	},
	option_d: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		if(!row.option_d)
			flush(row,["option_e"])
	},
	objective_answer:function(frm, cdt, cdn){
		var mapper = {"A":"option_a", "B":"option_b", "C":"option_c", "D":"option_d", "E":"option_e"}
		var row = locals[cdt][cdn];
		if (!(row[mapper[row.objective_answer]]) ){
			msgprint("Please select valid obejctive answer.")
			row.objective_answer = ""
			refresh_field("table_5")
		}
	}
});

flush = function(row,fields){
	$.each(fields, function(index, field) {
	  	frappe.model.set_value(row.doctype, row.name, field, "");

  })
}


make_read_only = function(fields, row){
	console.log("in make make_read_only")
	$.each(fields, function(index, field) {
		console.log(["in fields", field])
	  	row[field] = "";
	  	refresh_field(field)
  })

}