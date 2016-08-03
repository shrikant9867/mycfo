frappe.ui.form.on("Process Task","tat",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];
	if(d.tat <= 0){
		d.tat = ""
		msgprint(__("Please Enter Positive Value For TAT"))	
	}
})

frappe.ui.form.on("Checklist", "validate", function(frm){
	if(frm.doc.task){
		console.log(frm.doc.task.length)
		cur_frm.doc.counter = frm.doc.task.length
		refresh_field('counter')
	}
})

frappe.ui.form.on("Process Task","task_add",function(frm,cdt,cdn){
	var row = frappe.get_doc(cdt,cdn)
	if(cur_frm.doc.assignee1) {
		if(!row.assignee) row.assignee = cur_frm.doc.assignee1;
	}	
})

frappe.ui.form.on("Process Task","task_name",function(frm,cdt,cdn){
	var d = locals[cdt][cdn]
	get_depends_on(d.task_name)
})


get_depends_on = function(task_name){
	var t_list = []
	for(var i = 0 ; i < cur_frm.doc.task.length ; i++){
		if(cur_frm.doc.task[i].task_name){
			t_list.push(cur_frm.doc.task[i].task_name);
		}
	}
	if(task_name){
		var index = t_list.indexOf(""+task_name);
		t_list.splice(index, 1);
	}
	console.log(t_list,"t_list")
	var df = frappe.meta.get_docfield("Process Task","depends_on_task", cur_frm.doc.name);
    df.options = t_list;
    refresh_field("task");
}

cur_frm.cscript.task_on_form_rendered = function(doc, cdt, cdn){    
    var row = cur_frm.cur_grid.get_open_form(); 
    if(row.doc.task_name){
        console.log("in side my condition sssssssssssssssssssssssss")
        get_depends_on(row.doc.task_name)
    }
    else{
    	var df = frappe.meta.get_docfield("Process Task","depends_on_task", cur_frm.doc.name);
    	df.options = [];
    }    
}

/*frappe.ui.form.on("Process Task","task_name",function(frm,cdt,cdn){
	var d  = locals[cdt][cdn];
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(d.task_name)) {
		msgprint(__("Only Alphabets Are Allowed For Task Name"))
		d.task_name = ""
	}
})*/

/*frappe.ui.form.on("Checklist","process_name",function(frm){
	var regex = /^[a-zA-Z, ]*$/
	if(!regex.test(cur_frm.doc.process_name)) {
		msgprint(__("Only Alphabets Are Allowed For Process Name"))
		cur_frm.doc.process_name = "",
		refresh_field("process_name")
	}
})*/
