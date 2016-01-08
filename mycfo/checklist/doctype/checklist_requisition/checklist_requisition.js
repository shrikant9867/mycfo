frappe.ui.form.on("Checklist Requisition","checklist_name",function(frm){
	if(cur_frm.doc.checklist_name){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.get_tasks",
			args: {
			"doc":cur_frm.doc
			},
			callback: function(r) {
			$.each(r.message, function(i, d) {
				var row = frappe.model.add_child(cur_frm.doc, "Requisition Task", "cr_task");
				row.task_name = d.task_name;
				row.end_date = d.end_date;
				row.start_date = d.start_date;
				cur_frm.set_value("expected_start_date",d.start_date)
				refresh_field('editable_value')
			});
				cur_frm.refresh_field("cr_task");
			} 
		})
	}
})


frappe.ui.form.on("Requisition Task","end_date",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	var startDate = new Date(d.start_date)
	var endDate = new Date(d.end_date)
	console.log(new Date(d.start_date))
	if(startDate > endDate){
	msgprint(__("'StartDate' Should Not Greater Than 'EndDate'"))
	}
	d.end_date = ""
})

frappe.ui.form.on("Requisition Task","task_name",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(d.task_name)) {
		msgprint(__("Only Alphabets Are Allowed For Task Name"))
		d.task_name = ""
	}
})
