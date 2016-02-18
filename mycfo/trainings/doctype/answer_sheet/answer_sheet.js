frappe.ui.form.on("Assessment Answers", {
	marks_obtained: function(frm, cdt, cdn){
		var row = locals[cdt][cdn]
		mapper = {"Objective":"user_answer", "Subjective":"user_subjective_answer"}
		if(!row[mapper[row.question_type]]){
			msgprint("Marks obtained not allowed for unattempted question")
			row.marks_obtained = 0
		}
		if (row.total_marks < row.marks_obtained  || row.marks_obtained < 0 ){
			msgprint("Marks Obtained must be less than total marks & must be non-negative value.")	
			row.marks_obtained = 0
		}
		refresh_field("marks_obtained",row.name ,"table_5");
			
	}
});