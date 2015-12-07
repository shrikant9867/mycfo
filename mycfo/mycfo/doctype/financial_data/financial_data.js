// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt



{% include 'controllers/js/contact_address_common.js' %};

cur_frm.add_fetch('customer', 'customer_name', 'customer_name');

cur_frm.add_fetch('shareholder_name', 'contact', 'contact');

cur_frm.add_fetch('customer', 'currency', 'currency');

cur_frm.add_fetch('customer', 'country', 'country');

cur_frm.add_fetch('currency','symbol','currency_symbol');



frappe.ui.form.on("Financial Data", {
	refresh: function(frm) {
		if(frm.doc.currency){
			set_dynamic_labels(frm)
		}
	},
	
});

 var set_dynamic_labels = function(frm) {
		var company_currency = frm.doc.currency
		change_form_labels(frm,company_currency);
		cur_frm.refresh_fields(["annual_sales","pbt","pat","ebidta","outstanding_p_loan","annualised_cost_of_salary_of_all_emp_in_f_and_a","total"]);
}

var change_form_labels = function(frm,currency){
	var field_label_map = {};
	var setup_field_label_map = function(fields_list, currency) {
			$.each(fields_list, function(i, fname) {
				var docfield = frappe.meta.docfield_map[frm.doc.doctype][fname];
				if(docfield) {
					var label = __(docfield.label || "").replace(/\([^\)]*\)/g, "");
					field_label_map[fname] = label.trim() + " (" + currency + ")";
				}
			});
	};
	setup_field_label_map(["annual_sales","pbt","pat","ebidta","outstanding_p_loan","annualised_cost_of_salary_of_all_emp_in_f_and_a","total"], currency);

	$.each(field_label_map, function(fname, label) {
			frm.fields_dict[fname].set_label(label);
	});

}


cur_frm.cscript.validate = function(doc, dt, dn) {
	calculate_all(doc, dt, dn);
}

var calculate_all = function(doc, dt, dn) {
	calculate_total_shares(doc, dt, dn);
	
}


var calculate_total_shares = function(doc, dt, dn) {
	var tbl = doc.shareholders_detail || [];

	var total_shares = 0;
	for(var i = 0; i < tbl.length; i++){
		total_shares += flt(tbl[i].equity_no );
	}
	doc.total = total_shares
	refresh_many(['total', 'shareholders_detail']);
}


// cur_frm.fields_dict['shareholders_detail'].grid.get_field('shareholder_name').get_query = function(doc, cdt, cdn) {
// 	return{	query: "mycfo.mycfo.doctype.financial_data.financial_data.get_shareholders" }

// }

// cur_frm.fields_dict.shareholder_name = function(doc,cdt,cdn) {
// 	return{	query: "erpnext.controllers.queries.employee_query" }
// }

cur_frm.cscript.annual_sales = function(doc,cdt,cdn){
	if(doc.annual_sales<=0){
		msgprint("Annual Sales value must be greater than zero")
		doc.annual_sales =''
		refresh_field('annual_sales');
	}

}


cur_frm.cscript.ebidta = function(doc,cdt,cdn){
	
	if(doc.ebidta<=0){
		msgprint("EBIIDTA value must be greater than zero")
		doc.ebidta=''
		refresh_field('ebidta');
	}

	if(doc.annual_sales){
		if(doc.ebidta>=doc.annual_sales){
			msgprint("EBIIDTA value must be less than Annual Sales")
			doc.ebidta=''
			refresh_field('ebidta');
		}
	}
	else{
		msgprint("First enter the Annual Sales value")
		doc.ebidta=''
		refresh_field('ebidta');
	}
}

cur_frm.cscript.pbt = function(doc,cdt,cdn){
	
	if(doc.pbt<=0){
		msgprint("PBT value must be greater than zero")
		doc.pbt=''
		refresh_field('pbt');
	}
	if(doc.annual_sales){
		if(doc.pbt>=doc.annual_sales){
			msgprint("PBT value must be less than Annual Sales")
			doc.pbt=''
			refresh_field('pbt');
		}
	}
	else{
		msgprint("First enter the Annual Sales value")
		doc.pbt=''
		refresh_field('pbt');
	}
}

cur_frm.cscript.pat = function(doc,cdt,cdn){
	
	if(doc.pat<=0){
		msgprint("PAT values must be greater than zero")
		doc.pat=''
		refresh_field('pat');
	}

	if(doc.annual_sales){
		if(doc.pat>=doc.annual_sales){
			msgprint("PAT value must be less than Annual Sales")
			doc.pat=''
			refresh_field('pat');
		}
	}
	else{
		msgprint("First enter the Annual Sales value")
		doc.pat=''
		refresh_field('pat');
	}
}

cur_frm.cscript.number_of_a_banker = function(doc,cdt,cdn){
	if(doc.number_of_a_banker<=0){
		msgprint("Number of banker value must be greater than zero")
		doc.number_of_a_banker=''
		refresh_field('number_of_a_banker');
	}
}

cur_frm.cscript.outstanding_p_loan = function(doc,cdt,cdn){
	if(doc.outstanding_p_loan<=0){
		msgprint("Outstanding loan value must be greater than zero")
		doc.outstanding_p_loan=''
		refresh_field('outstanding_p_loan');
	}
}

cur_frm.cscript.size_of_fund_based_limit = function(doc,cdt,cdn){
	if(doc.size_of_fund_based_limit<=0){
		msgprint("Size of fund based limit value must be greater than zero")
		doc.size_of_fund_based_limit=''
		refresh_field('size_of_fund_based_limit');
	}
}

cur_frm.cscript.fixed_assets_gross_block = function(doc,cdt,cdn){
	if(doc.fixed_assets_gross_block<=0){
		msgprint("Fixed assets gross block value must be greater than zero")
		doc.fixed_assets_gross_block=''
		refresh_field('fixed_assets_gross_block')
	}
}

cur_frm.cscript.number_of_bank_payments = function(doc,cdt,cdn){
	if(doc.number_of_bank_payments<=0){
		msgprint("Number of bank payments value must be greater than zero")
		doc.number_of_bank_payments=''
		refresh_field('number_of_bank_payments')
	}
}
cur_frm.cscript.number_of_bank_receipts = function(doc,cdt,cdn){
	if(doc.number_of_bank_receipts<=0){
		msgprint("Number of bank receipts value must be greater than zero")
		doc.number_of_bank_receipts=''
		refresh_field('number_of_bank_receipts')
	}
}
cur_frm.cscript.number_of_invoices_raised = function(doc,cdt,cdn){
	if(doc.number_of_invoices_raised<=0){
		msgprint("Number invoices raised value must be greater than zero")
		doc.number_of_invoices_raised=''
		refresh_field('number_of_invoices_raised')
	}
}
cur_frm.cscript.number_of_vendor_invoices_booked = function(doc,cdt,cdn){
	if(doc.number_of_vendor_invoices_booked<=0){
		msgprint("Number of booked vendor invoices value must be greater than zero")
		doc.number_of_vendor_invoices_booked=''
		refresh_field('number_of_vendor_invoices_booked')
	}
}
cur_frm.cscript.number_of_jvs_passed = function(doc,cdt,cdn){
	if(doc.number_of_jvs_passed<=0){
		msgprint("Number of passed JV's value must be greater than zero")
		doc.number_of_jvs_passed=''
		refresh_field('number_of_jvs_passed')
	}
}
cur_frm.cscript.size_of_non_fund_based_limit = function(doc,cdt,cdn){
	if(doc.size_of_non_fund_based_limit<=0){
		msgprint("Size of non fund based limit value must be greater than zero")
		doc.size_of_non_fund_based_limit=''
		refresh_field('size_of_non_fund_based_limit')
	}
}
cur_frm.cscript.no_of_permanent_employee_on_rolls = function(doc,cdt,cdn){
	if(doc.no_of_permanent_employee_on_rolls<=0){
		msgprint("Number of permanent employee value must be greater than zero")
		doc.no_of_permanent_employee_on_rolls=''
		refresh_field('no_of_permanent_employee_on_rolls')
	}
}
cur_frm.cscript.no_of_permanent_emp_in_f_and_a = function(doc,cdt,cdn){
	if(doc.no_of_permanent_emp_in_f_and_a<=0){
		msgprint("Number of permanent employee in f & a department value must be greater than zero")
		doc.no_of_permanent_emp_in_f_and_a=''
		refresh_field('no_of_permanent_emp_in_f_and_a')
	}
}

cur_frm.cscript.annualised_cost_of_salary_of_all_emp_in_f_and_a = function(doc,cdt,cdn){
	if(doc.annualised_cost_of_salary_of_all_emp_in_f_and_a<=0){
		msgprint("Annualised cost of salary value must be greater than zero")
		doc.annualised_cost_of_salary_of_all_emp_in_f_and_a=''
		refresh_field('annualised_cost_of_salary_of_all_emp_in_f_and_a')
	}
}

cur_frm.cscript.no_of_fully_qualified_cwas_or_mbas_in_f_and_a = function(doc,cdt,cdn){
	if(doc.no_of_fully_qualified_cwas_or_mbas_in_f_and_a<=0){
		msgprint("Number of fully qualified value must be greater than zero")
		doc.no_of_fully_qualified_cwas_or_mbas_in_f_and_a=''
		refresh_field('no_of_fully_qualified_cwas_or_mbas_in_f_and_a')
	}
}

