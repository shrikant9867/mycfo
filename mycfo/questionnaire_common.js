
frappe.ui.form.on("IP Questionnaire", "question_type", function(frm, cdt, cdn){
	child_row = locals[cdt][cdn]
	read_only_fields = []
	if (child_row.question_type == "Objective"){
		read_only_fields = ["question_name"]
		
	}else{
		read_only_fields = ["option_a", "option_b", "option_c", "option_d", "option_e", "question_name"]
	}

	set_value(read_only_fields, child_row)
	refresh_field("questionnaire")
})



frappe.ui.form.on("IP Questionnaire", {
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
	}
});

flush = function(row,fields){
	$.each(fields, function(index, field) {
	  	frappe.model.set_value(row.doctype, row.name, field, "");

  })
}


set_value = function(fields, row){
	$.each(fields, function(index, field) {
	  	row[field] = "";
	  	refresh_field(field)
  })

}

frappe.ui.form.on("IP Questionnaire", {
	questionnaire_add: function(frm, doctype, name) {
		var row = frappe.get_doc(doctype, name);
		row.status = 1
		refresh_field("status")
	}
});