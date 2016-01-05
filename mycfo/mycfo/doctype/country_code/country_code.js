// // Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// // License: GNU General Public License v3. See license.txt

cur_frm.cscript.number_of_digits_allowed = function(doc,cdt,cdn){
	if(doc.number_of_digits_allowed <=0){
		msgprint("Number of Digits allowed must be greater than zero")
		doc.number_of_digits_allowed =''
		refresh_field('number_of_digits_allowed');
	}
}