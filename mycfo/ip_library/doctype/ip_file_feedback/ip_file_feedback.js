
frappe.ui.form.on("IP File Feedback", "refresh", function(frm, cdt, cdn){	
	if(!frm.doc.__islocal){
		setTimeout(function(){ make_fields_read_only(); }, 2000);
		
		
	}
})

make_fields_read_only = function(){
	$.each([0,1,2,3,4,5,6,7,8,9], function(index, value){
		console.log(cur_frm.get_field("user_answers"))
		cur_frm.get_field("user_answers").grid.docfields[value].read_only = 1;	
	})
	refresh_field("user_answers");	
}