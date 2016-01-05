// Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt


cur_frm.fields_dict['industry_group'].get_query = function(doc, dt, dn) {
	if(doc.sector){
		return{
			filters:{'sector': doc.sector}
		}
	}
	else{
		msgprint("First select the Sector.")
		doc.industry_group =''
		refresh_field('industry_group')
	}
}