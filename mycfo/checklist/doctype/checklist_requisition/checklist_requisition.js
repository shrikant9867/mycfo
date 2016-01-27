frappe.ui.form.on("Checklist Requisition",{
	refresh: function(frm){
		this.get_status(frm)
		this.get_closed_task(frm)
		this.checklist_name(frm)
	}
})
get_status = function(frm){
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
}

get_closed_task = function(frm){
	if(cur_frm.doc.checklist_name){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.list_view",
			args:{
			'name': cur_frm.docname
			},
			callback: function(r) {
				if(r.message){
					cur_frm.set_value("task_closed",r.message)
					refresh_field("task_closed")
				}
			}
		})
	}		
}

checklist_name = function(frm){
	if(cur_frm.doc.checklist_name){
		cur_frm.set_df_property("checklist_name","read_only",1)
	}
}


frappe.ui.form.on("Checklist Requisition","checklist_name",function(frm){
	if(cur_frm.doc.checklist_name){
		return frappe.call({
			method: "get_tasks_detail",
			doc: cur_frm.doc,
			callback: function(r) {
			if(cur_frm.doc.cr_task){
				cur_frm.doc.cr_task = ""
				refresh_field("cr_task")
			}
			$.each(r.message, function(i, d) {
				var row = frappe.model.add_child(cur_frm.doc, "Requisition Task", "cr_task");
				row.task_name = d.task_name;
				row.end_date = d.end_date;
				row.start_date = d.start_date;
				row.des = d.des;
				row.assignee = d.assignee;
				cur_frm.set_value('expected_start_date',d.start_date)
				refresh_field("cr_task");
				});	
			}
		})
		/*frappe.meta.get_docfield('Requisition Task','assignee', frm.doc.docname).read_only = 1*/
	}
	if(cur_frm.doc.checklist_name == ""){
		console.log("hhh")
	}
})

frappe.ui.form.on("Checklist Requisition", "validate",function(frm){
	if(frm.doc.cr_task){
		cur_frm.doc.count = frm.doc.cr_task.length
		refresh_field('count')
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
		var d  = locals[cdt][cdn];
		return {
		query: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.filter_user",
		filters: {
			'assignee': d.assignee
		}
	}
}

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