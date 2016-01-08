// set hours if to_time is updated
frappe.ui.form.on("Checklist Time Log", "to_time", function(frm) {
	if(frm._setting_hours) return;
	frm.set_value("hours", moment(cur_frm.doc.to_time).diff(moment(cur_frm.doc.from_time),
		"minutes") / 60);

});