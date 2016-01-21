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
					console.log("hello")
					console.log(r.message)
					cur_frm.set_value("task_closed",r.message)
					refresh_field("task_closed")
					/*cur_frm.save("");*/
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
			$.each(r.message, function(i, d) {
				var row = frappe.model.add_child(cur_frm.doc, "Requisition Task", "cr_task");
				row.task_name = d.task_name;
				row.end_date = d.end_date;
				row.start_date = d.start_date;
				row.des = d.des;
				row.assignee = d.assignee;
				cur_frm.set_value('expected_start_date',d.start_date)
				});
				refresh_field("cr_task");
			}
		})
		frappe.meta.get_docfield('Requisition Task','assignee', frm.doc.docname).read_only = 1
	}
})

frappe.ui.form.on("Checklist Requisition","expected_start_date",function(frm){
	var d = moment().format('YYYY-MM-DD')
	var current_date = new Date(d)
	var expected_start_date = new Date(cur_frm.doc.expected_start_date)
	if(expected_start_date < current_date){
		msgprint(__("'Expected Start Date' Should Not Past Date "))
		cur_frm.doc.expected_start_date = ""
		refresh_field('expected_start_date')
	}		
})

frappe.ui.form.on("Requisition Task","end_date",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	var startDate = new Date(d.start_date)
	var endDate = new Date(d.end_date)
	if(startDate > endDate){
		msgprint(__("'EndDate' Should Not Less Than 'StartDate' For Task"))
		d.end_date = ""
		refresh_field("cr_task")
	}
	var dd = moment().format('YYYY-MM-DD')
	var current_date = new Date(dd)
	if (endDate < current_date){
		msgprint(__("'End Date Should Not Past Date "))
		d.end_date = ""
		refresh_field("cr_task")
	}	
})

frappe.ui.form.on("Requisition Task","start_date",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	var startDate = new Date(d.start_date)
	var endDate = new Date(d.end_date)
	if(startDate > endDate){
		msgprint(__("'StartDate' Should Not Greater Than 'EndDate' For Task"))
		/*cur_frm.doc.cr_task[0].end_date = ""
		refresh_field("cr_task")*/
	}
	var dd = moment().format('YYYY-MM-DD')
	var current_date = new Date(dd)
	if (startDate < current_date){
		msgprint(__("'Start Date Should Not Past Date "))
		cur_frm.doc.cr_task[0].start_date = ""
		refresh_field("cr_task")
	}
})

cur_frm.fields_dict.cr_task.grid.get_field("user").get_query = function(doc, cdt, cdn) {
		return {
		query: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.filter_user",
		filters: {
			'doc': cur_frm.doc
		}
	}
}

/*frappe.ui.form.on("Requisition Task","assignee",function(frm,cdt,cdn){
	msgprint(__("'Not Change"))
	cur_frm.reload_doc();	
})*/
/*frappe.ui.form.on("Checklist Requisition","checklist_name",function(frm,cdt,cdn){
	console.log("refresh")
	if(!frm.doc.__islocal){
	frappe.meta.get_docfield('Requisition Task','assignee').read_only = 1
	}
	else{
		frappe.meta.get_docfield('Requisition Task','assignee').read_only = 0	
	}
	cur_frm.refresh_fields();
})*/