frappe.ui.form.on("Process Task","tat",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];
	if(d.tat <= 0){
		d.tat = ""
		msgprint(__("Please Enter Positive Value For TAT"))	
	}
})

/*frappe.ui.form.on("Process Task","task_name",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(d.task_name)) {
		msgprint(__("Only Alphabets Are Allowed For Task Name"))
		d.task_name = ""
	}
})*/

/*frappe.ui.form.on("Checklist","process_name",function(frm){
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(cur_frm.doc.process_name)) {
		msgprint(__("Only Alphabets Are Allowed For Process Name"))
		cur_frm.doc.process_name = "",
		refresh_field("process_name")
	}
})*/
