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
	return {
		filters: [
			['Checklist Task','project','=',cur_frm.doc.project],
			['Checklist Task', 'name', '!=', cur_frm.doc.name],
			['Checklist Task', 'status', '=', 'Open'] 
		]
	}
}

/*frappe.ui.form.on("Checklist Task","title",function(frm){
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(cur_frm.doc.title)) {
		msgprint(__("Only Alphabets Are Allowed"))
		cur_frm.doc.title = "",
		refresh_field("title")
		frm.reload();
	}
})*/

/*frappe.ui.form.on("Checklist Task","status",function(frm){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_task.checklist_task.get_timelog",
			args:{
				"doc":cur_frm.doc
			},
			callback: function(r) {
				console.log(r.message)
				if(r.message && cur_frm.doc.status == "Closed"){
				msgprint(r.message);
				cur_frm.reload_doc()
			}
		} 
	})
})*/

frappe.ui.form.on("Checklist Task","status",function(frm){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_task.checklist_task.get_close_date",
			args:{
				"doc":cur_frm.doc
			},
			callback: function(r) {
				if(r.message && cur_frm.doc.status == "Closed"){
				cur_frm.doc.end_date = r.message 
				refresh_field("end_date")
			}
		} 
	})
})

frappe.ui.form.on("Checklist Task","validate",function(frm){
	if(cur_frm.doc.status == "Closed"){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_task.checklist_task.valid_hours",
				args: {
				"doc":cur_frm.doc
			},
			callback: function(r) {
				var hour = (moment(cur_frm.doc.end_date).diff(moment(cur_frm.doc.expected_start_date),
										"minutes") / 60);
				if(r.message){
					cur_frm.set_value('actual_time',(hour - r.message*24))
				}
				if(!r.message){
					cur_frm.set_value('actual_time',hour)
				}
				cur_frm.set_df_property("status","read_only",1)
				/*cur_frm.doc.actual_time = hour
				refresh_field('actual_time')*/
			}	
		})	
	}	
})
			