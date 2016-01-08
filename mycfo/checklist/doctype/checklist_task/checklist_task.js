frappe.ui.form.on("Checklist Task", {
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
})
cur_frm.add_fetch('task', 'title', 'title');	

frappe.ui.form.on("Checklist Task","title",function(frm){
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(cur_frm.doc.title)) {
		msgprint(__("Only Alphabets Are Allowed"))
		cur_frm.doc.title = "",
		refresh_field("title")
		frm.reload();
	}
})		