frappe.ui.form.on("Checklist Requisition","refresh",function(frm){
	if(cur_frm.doc.checklist_name){
		return frappe.call({
			method: "get_status",
			doc: frm.doc,
			callback: function(r) {
				console.log(r.message)
				if(r.message){
					cur_frm.doc.checklist_status = r.message
					refresh_field("checklist_status")
				}
			}
		})
	}	
})

frappe.ui.form.on("Checklist Requisition","refresh",function(frm){
	if(cur_frm.doc.checklist_name){
		return frappe.call({
			method: "get_closed_task",
			doc: frm.doc,
			callback: function(r) {
				console.log(r.message)
				if(r.message){
					console.log()
					cur_frm.doc.task_closed = r.message
					refresh_field("task_closed")
				}
			}
		})
	}	
})

frappe.ui.form.on("Checklist Requisition","checklist_name",function(frm){
	if(cur_frm.doc.checklist_name){
		return frappe.call({
			method: "get_tasks_detail",
			doc: frm.doc,
			callback: function(r) {
				console.log(r.message)
			$.each(r.message, function(i, d) {
				var row = frappe.model.add_child(cur_frm.doc, "Requisition Task", "cr_task");
				row.task_name = d.task_name;
				row.end_date = d.end_date;
				row.start_date = d.start_date;
				row.des = d.des;
				console.log(row.des)
				cur_frm.set_value("expected_start_date",d.start_date)
			});
				cur_frm.refresh_field("cr_task");
			} 
		})
	}
})
/*cur_frm.add_fetch('checklist_name', 'counter', 'counter');*/				

frappe.ui.form.on("Requisition Task","end_date",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	var startDate = new Date(d.start_date)
	var endDate = new Date(d.end_date)
	if(startDate > endDate){
	msgprint(__("'EndDate' Should Not Less Than 'StartDate' For Task"))
	}
	d.end_date = ""
})

frappe.ui.form.on("Requisition Task","start_date",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	var startDate = new Date(d.start_date)
	var endDate = new Date(d.end_date)
	if(startDate > endDate){
	msgprint(__("'StartDate' Should Not Greater Than 'EndDate' For Task"))
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
