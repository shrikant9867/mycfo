frappe.ui.form.on("Discussion Topic","published_on",function(frm){
	var d = moment().format('YYYY-MM-DD')
	var current_date = new Date(d)
	var expected_start_date = new Date(cur_frm.doc.published_on)
	if(expected_start_date < current_date){
		msgprint(__("'Previous Date Not Allowed"))
		cur_frm.doc.published_on = ""
		refresh_field('published_on')
	}		
})