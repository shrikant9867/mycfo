frappe.listview_settings['Checklist Requisition'] = {
	add_fields: ["name","task_closed"],
	prepare_data: function(data){
		return frappe.call({
			async: false,
			method: "mycfo.checklist.doctype.checklist_requisition.checklist_requisition.list_view",
			args:{
				"name":data.name
			},
			callback: function(r) {
				data.task_closed = r.message															
			} 
		})
	},
}	