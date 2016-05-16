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
				row.tat = d.tat;
				cur_frm.set_value('expected_start_date',d.start_date)
				refresh_field("cr_task");
				});	
			}
		})
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
	if(startDate && endDate && startDate > endDate){
		msgprint(__("'EndDate' Should Not Less Than 'StartDate' For Task"))
		cur_frm.doc.cr_task[0].end_date = ""
		refresh_field("cr_task")
	}	
})

frappe.ui.form.on("Requisition Task","start_date",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	var startDate = new Date(d.start_date)
	var endDate = new Date(d.end_date)
	if(startDate && endDate && startDate > endDate){
		msgprint(__("'StartDate' Should Not Greater Than 'EndDate' For Task"))
		cur_frm.doc.cr_task[0].start_date = ""
		refresh_field("cr_task")
	}
	var cur_date = moment().format('YYYY-MM-DD')
	var current_date = new Date(cur_date)
	if(startDate && startDate < current_date){
		msgprint(__("Start Date Should Not Past Date "))
		cur_frm.doc.cr_task[0].start_date = ""
		refresh_field("cr_task")
	}
})
frappe.ui.form.on("Requisition Task","reopen",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	return frappe.call({
		method: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.reopen_task",
		args: {
		"task_id":d.task_id,
		},
		callback: function(r) {
			if(r.message=="reopened"){
				d.status="Open";
				refresh_field("cr_task");
			}
		} 
	})

})

frappe.ui.form.on("Requisition Task","show_subtask",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	return frappe.call({
		method: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.show_subtasks",
		args: {
		"task_id":d.task_id,
		},
		callback: function(r) {
			if (r.message){
				var di = new frappe.ui.Dialog({
					title: __("Subtasks"),
					fields: [
						{fieldtype:"HTML", label:__("Subtasks"), reqd:1, fieldname:"subtasks"}
					]
				});

				di.$wrapper.find(".modal-content").css({"width": "800px"})
				$(di.body).find("[data-fieldname='subtasks']").html(frappe.render_template("checklist_requisition", {"data":r.message}))
				di.show();
			}
			else{
				msgprint(__("No any Subtask is created against this Task"))
			}
		} 
	})

})

// cur_frm.fields_dict.cr_task.grid.get_field("user").get_query = function(doc, cdt, cdn) {
// 		var d  = locals[cdt][cdn];
// 		return {
// 		query: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.filter_user",
// 		filters: {
// 			'assignee': d.assignee
// 		}
// 	}
// }
