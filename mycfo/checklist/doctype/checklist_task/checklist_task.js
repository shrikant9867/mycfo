/*frappe.ui.form.on("Checklist Task", {
	refresh: function(frm) {
		var doc = frm.doc;
		if(!doc.__islocal) {
			if(frappe.model.can_read("Checklist Time Log")) {
				frm.add_custom_button(__("Time Logs"), function() {
					frappe.route_options = {"requisition_id": doc.project, "task": doc.name}
					frappe.set_route("List", "Checklist Time Log");
				}, "icon-list", true);
			}
		}
	}
})*/
cur_frm.add_fetch('task', 'title', 'title');
cur_frm.add_fetch('task','status','status');

cur_frm.fields_dict.ct_depend_task.grid.get_field("task").get_query = function(doc) {
	var t_list = []
	for(var i = 0 ; i < cur_frm.doc.ct_depend_task.length ; i++){
		if(cur_frm.doc.ct_depend_task[i].task){
			t_list.push(cur_frm.doc.ct_depend_task[i].task);
		}
		else{
			t_list.push(cur_frm.doc.name)
		}
	}	
	return {
		filters: [
			['Checklist Task','project','=',cur_frm.doc.project],
			['Checklist Task', 'name', 'not in', t_list],
			['Checklist Task', 'status', '=', 'Open']
		]
	}	
}	

frappe.ui.form.on("Checklist Task","status",function(frm){
	if(cur_frm.doc.status == "Closed"){
		var d = moment().format('YYYY-MM-DD')
		cur_frm.doc.end_date = d
		refresh_field("end_date")
		cur_frm.set_df_property("status","read_only",1)
	} 
})

frappe.ui.form.on("Checklist Task","validate",function(frm){
	if(cur_frm.doc.end_date){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_task.checklist_task.valid_hours",
			args: {
			"doc":cur_frm.doc
			},
			callback: function(r) {
				var hour = (moment(cur_frm.doc.end_date).diff(moment(cur_frm.doc.expected_start_date),
								"minutes") / 60);
				console.log(hour)
				if(r.message){
					if(hour>=0){
						cur_frm.set_value('count',(hour - r.message*24))
					}	
				}
				if(!r.message){
					if(hour>=0){
						cur_frm.set_value('count',hour)
					}
				}
			} 
		})
	}
})


frappe.ui.form.on("Checklist Task","reassign_task",function(frm){
	msgprint("Hi")
})
// cur_frm.fields_dict.ct_reassign.grid.get_field("user").get_query = function(doc, cdt, cdn) {
// 		var d  = locals[cdt][cdn];
// 		return {
// 		query: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.filter_user",
// 		filters: {
// 			'assignee': d.assignee
// 		}
// 	}
// }
frappe.ui.form.on("Checklist Task Reassign","reopen",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];	
	return frappe.call({
		method: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.reopen_task",
		args: {
		"task_id":d.task_id,
		},
		callback: function(r) {
			if(r.message=="reopened"){
				d.status="Open";
				refresh_field("ct_reassign");
			}
		} 
	})

})