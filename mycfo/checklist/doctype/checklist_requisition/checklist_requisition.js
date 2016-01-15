/*frappe.ui.form.on("Checklist Requisition","refresh",function(frm){
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
})*/

/*frappe.ui.form.on("Checklist Requisition","refresh",function(frm){
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
})*/

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
				row.assignee = d.assignee;
				/*if(d.assignee){
					console.log("hello")
					console.log(row.name)
					console.log(frappe.meta.get_docfield("Requisition Task", "assignee", row.name))
					console.log("later")
				}*/
				console.log(row.assignee)
				cur_frm.set_value("expected_start_date",d.start_date)
			});
				refresh_field("cr_task");
		}
	})

	}
})
				
frappe.ui.form.on("Checklist Requisition","refresh",function(frm,cdt,cdn){
	return frappe.call({
		method: "get_task",
		doc: frm.doc,
		callback: function(r) {
			console.log(r.message)
			var d = locals[cdt][cdn];
			console.log(d.task_name)
			/*$.each(r.message, function(i, d){
				if(r.message.title == d.task_name){
					console.log("hello")
					d.task_id = r.message.name
				}	
			})*/
		}
	})	
})

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

cur_frm.fields_dict.cr_task.grid.get_field("user").get_query = function(doc, cdt, cdn) {
		return {
		query: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.filter_user",
		filters: {
			'doc': cur_frm.doc
		}
	}
}	
/*frappe.ui.form.on("Requisition Task","task_name",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(d.task_name)) {
		msgprint(__("Only Alphabets Are Allowed For Task Name"))
		d.task_name = ""
	}
})*/
