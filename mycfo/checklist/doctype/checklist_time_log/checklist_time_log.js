// set hours if to_time is updated
cur_frm.add_fetch('employee', 'user_id', 'user');

frappe.ui.form.on("Checklist Time Log","from_time",function(frm){
	return frappe.call({
		method: "mycfo.checklist.doctype.checklist_time_log.checklist_time_log.valid_dates",
			args: {
			"doc":cur_frm.doc
			},
		callback: function(r) {
			if(r.message){
				msgprint(r.message);
				cur_frm.set_value('from_time','')
				refresh_field('from_time')
			}
		} 
	})
})
cur_frm.add_fetch('task','expected_start_date','expected_start_date');
cur_frm.add_fetch('task','expected_end_date','expected_end_date');

frappe.ui.form.on("Checklist Time Log","to_time",function(frm){
	frappe.call({
		method: "mycfo.checklist.doctype.checklist_time_log.checklist_time_log.valid_dates",
			args: {
			"doc":cur_frm.doc
			},
		callback: function(r) {
			if(r.message){
				msgprint(r.message);
				cur_frm.set_value('to_time','')
				refresh_field('to_time')
			}
		} 
	})
})		

frappe.ui.form.on("Checklist Time Log","to_time",function(frm){
	if(frm._setting_hours) return;
	if(cur_frm.doc.from_time && cur_frm.doc.to_time){
		return frappe.call({
			method: "mycfo.checklist.doctype.checklist_time_log.checklist_time_log.valid_hours",
				args: {
				"doc":cur_frm.doc
				},
			callback: function(r) {
				var hour = (moment(cur_frm.doc.to_time).diff(moment(cur_frm.doc.from_time),
								"minutes") / 60);
				if(r.message){
					if(hour>0){
						cur_frm.set_value('hours',(hour - r.message*24))
					}	
				}
				if(!r.message){
					if(hour>0){
						cur_frm.set_value('hours',hour)
					}
				}
			} 
		})
	}	
})