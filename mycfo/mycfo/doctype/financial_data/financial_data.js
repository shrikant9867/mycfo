// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt



{% include 'controllers/js/contact_address_common.js' %};

cur_frm.add_fetch('customer', 'customer_name', 'customer_name');


cur_frm.cscript.validate = function(doc, dt, dn) {
	calculate_all(doc, dt, dn);
}


var calculate_all = function(doc, dt, dn) {
	//console.log("inc calculate_all")
	calculate_total_shares(doc, dt, dn);
	
}


var calculate_total_shares = function(doc, dt, dn) {
	//console.log("earning total")
	var tbl = doc.shareholders_detail || [];

	var total_shares = 0;
	for(var i = 0; i < tbl.length; i++){
		total_shares += flt(tbl[i].equity_no );
	}
	doc.total = total_shares
	refresh_many(['total', 'shareholders_detail']);
}
