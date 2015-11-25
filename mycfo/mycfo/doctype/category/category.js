// // Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// // License: GNU General Public License v3. See license.txt

cur_frm.cscript.is_parent= function(doc, cdt, cdn) {
	if(doc.is_child==1){
		msgprint("we have to check only one check box")
		doc.is_parent=0
		refresh_field('is_parent')
	}

}


cur_frm.cscript.is_child= function(doc, cdt, cdn) {
	if(doc.is_parent==1){
		msgprint("we have to check only one check box")
		doc.is_child=0
		refresh_field('is_child')
	}

}


cur_frm.fields_dict['parent_category'].get_query = function(doc) {
	return {
		filters: {
			
			"is_child": 0
		}
	}
}