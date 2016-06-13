//set filter on Resouce Assigned
cur_frm.fields_dict["kpi_business_details"].grid.get_field("resouce_assigned").get_query = function(doc){
   	return {
   		query: "mycfo.kpi.doctype.kpi.kpi.get_kpi_resouce_assigned_list",
   		filters: { "customer":cur_frm.doc.customer }
   	}
}
cur_frm.fields_dict["kpi_people_details"].grid.get_field("resouce_assigned").get_query = function(doc){
   	return {
   		query: "mycfo.kpi.doctype.kpi.kpi.get_kpi_resouce_assigned_list",
   		filters: { "customer":cur_frm.doc.customer }
   	}
}
cur_frm.fields_dict["kpi_finance_details"].grid.get_field("resouce_assigned").get_query = function(doc){
   	return {
   		query: "mycfo.kpi.doctype.kpi.kpi.get_kpi_resouce_assigned_list",
   		filters: { "customer":cur_frm.doc.customer }
   	}
}
cur_frm.fields_dict["kpi_process_details"].grid.get_field("resouce_assigned").get_query = function(doc){
   	return {
   		query: "mycfo.kpi.doctype.kpi.kpi.get_kpi_resouce_assigned_list",
   		filters: { "customer":cur_frm.doc.customer }
   	}
}

cur_frm.add_fetch("resouce_assigned", "employee_name", "employee_name");
cur_frm.add_fetch("skill_matrix_120", "skill_matrix_18", "skill_matrix_18");


//Validation kpi start date
cur_frm.cscript.start_date = function(doc,cdt,cdn){
	if(doc.start_date && doc.end_date){
		var start_date = new Date(doc.start_date);
		var end_date = new Date(doc.end_date);
		if(start_date>end_date)
			msgprint("Closing Date must be greater than Start Date")
	}
}

//validation kpi end date
cur_frm.cscript.end_date = function(doc,cdt,cdn){
	if(doc.start_date && doc.end_date){
		var start_date = new Date(doc.start_date);
		var end_date = new Date(doc.end_date);
		if(start_date>end_date)
			msgprint("Closing Date must be greater than Start Date")
	}
}

//algorithm implimentation for weightage calculation
frappe.ui.form.on("KPI", "validate", function(frm,cdt,cdn) {
    var total=0;

	 //2nd
    if(frm.doc.kpi_people_details){
	 	for(i=0;i<frm.doc.kpi_people_details.length;i++){
			var a;
			var b;
			var c;
			var d;
			if(frm.doc.kpi_people_details[i].priority=="High"){
				a =5;
			}
			if(frm.doc.kpi_people_details[i].priority=="Medium"){
				a =3;
			}
			if(frm.doc.kpi_people_details[i].priority=="Low"){
				a =1;
			}

			if(frm.doc.kpi_people_details[i].criticality=="High"){
				b =5;
			}
			if(frm.doc.kpi_people_details[i].criticality=="Medium"){
				b =3;
			}
			if(frm.doc.kpi_people_details[i].criticality=="Low"){
				b =1;
			}
			c=a+b;
	        d=flt(c);
	   		total=total+d;
			frm.doc.kpi_people_details[i].sum = d;
	 	}
	}

    if(frm.doc.kpi_finance_details){
	 	for(i=0;i<frm.doc.kpi_finance_details.length;i++){
			var a;
			var b;
			var c;
			var d;
			if(frm.doc.kpi_finance_details[i].priority=="High"){
				a =5;
			}
			if(frm.doc.kpi_finance_details[i].priority=="Medium"){
				a =3;
			}
			if(frm.doc.kpi_finance_details[i].priority=="Low"){
				a =1;
			}

			if(frm.doc.kpi_finance_details[i].criticality=="High"){
				b =5;
			}
			if(frm.doc.kpi_finance_details[i].criticality=="Medium"){
				b =3;
			}
			if(frm.doc.kpi_finance_details[i].criticality=="Low"){
				b =1;
			}
			c=a+b;
	        d=flt(c)
	   		total=total+d;
			frm.doc.kpi_finance_details[i].sum = d;
		}
	}

	
    if(frm.doc.kpi_process_details){
		for(i=0;i<frm.doc.kpi_process_details.length;i++){
			var a;
			var b;
			var c;
			var d;
			if(frm.doc.kpi_process_details[i].priority=="High"){
				a =5;
			}
			if(frm.doc.kpi_process_details[i].priority=="Medium"){
				a =3;
			}
			if(frm.doc.kpi_process_details[i].priority=="Low"){
				a =1;
			}

			if(frm.doc.kpi_process_details[i].criticality=="High"){
				b =5;
			}
			if(frm.doc.kpi_process_details[i].criticality=="Medium"){
				b =3;
			}
			if(frm.doc.kpi_process_details[i].criticality=="Low"){
				b =1;
			}
			c=a+b;
	        d=flt(c)
	   		total=total+d;
			frm.doc.kpi_process_details[i].sum = d;
		}
	}
    if(frm.doc.kpi_business_details){
		for(i=0;i<frm.doc.kpi_business_details.length;i++){
			var a=0;
			var b=0;
			var c=0;	
			var d=0;
			if(frm.doc.kpi_business_details[i].priority==""){
				a =0;
			}
			if(frm.doc.kpi_business_details[i].priority=="High"){
				a =5;
			}
			if(frm.doc.kpi_business_details[i].priority=="Medium"){
				a =3;
			}
			if(frm.doc.kpi_business_details[i].priority=="Low"){
				a =1;
			}

			if(frm.doc.kpi_business_details[i].criticality==""){
				b =0
			}
			if(frm.doc.kpi_business_details[i].criticality=="High"){
				b =5;
			}
			if(frm.doc.kpi_business_details[i].criticality=="Medium"){
				b =3;
			}
			if(frm.doc.kpi_business_details[i].criticality=="Low"){
				b =1;
			}
			c=a+b;
	        d=flt(c)
	   		total=total+d;
			frm.doc.kpi_business_details[i].sum = d;
		 }
	}


    if(frm.doc.kpi_people_details){
		for(i=0;i<frm.doc.kpi_people_details.length;i++){
			frm.doc.kpi_people_details[i].weightage = flt(frm.doc.kpi_people_details[i].sum/total*100);
		 }
    }
    if(frm.doc.kpi_finance_details){
		for(i=0;i<frm.doc.kpi_finance_details.length;i++){
			frm.doc.kpi_finance_details[i].weightage = flt(frm.doc.kpi_finance_details[i].sum/total*100);
		 }
    }
    if(frm.doc.kpi_process_details){
		for(i=0;i<frm.doc.kpi_process_details.length;i++){
			frm.doc.kpi_process_details[i].weightage = flt(frm.doc.kpi_process_details[i].sum/total*100);
		 }
    }
    if(frm.doc.kpi_business_details){
		for(i=0;i<frm.doc.kpi_business_details.length;i++){
			frm.doc.kpi_business_details[i].weightage = flt(frm.doc.kpi_business_details[i].sum/total*100);
		 }
    }


    //accept all child client status on Accepting KPI Status.
  //   if(frm.doc.kpi_status=="Accepted"){
		// for(i=0;i<frm.doc.kpi_business_details.length;i++){
		// 	frm.doc.kpi_business_details[i].client_status = "Accept";
		//  };
		//  for(i=0;i<frm.doc.kpi_finance_details.length;i++){
		// 	frm.doc.kpi_finance_details[i].client_status = "Accept";
		//  };
		//  for(i=0;i<frm.doc.kpi_people_details.length;i++){
		// 	frm.doc.kpi_people_details[i].client_status = "Accept";
		//  };
		//  for(i=0;i<frm.doc.kpi_process_details.length;i++){
		// 	frm.doc.kpi_process_details[i].client_status = "Accept";
		//  };
  //   }

});

// on save event, if customer accept all % complition, then kpi status will be closed
frappe.ui.form.on("KPI", "validate", function(frm,cdt,cdn) {
	var k_accpt_status = true;
	if(frm.doc.kpi_business_details){
		for(i=0;i<frm.doc.kpi_business_details.length;i++){
			if(frm.doc.kpi_business_details[i].client_kpi_acceptance=="Reject" || frm.doc.kpi_business_details[i].client_kpi_acceptance==""){
				k_accpt_status = false;
			}
		 }
	}
	if(frm.doc.kpi_people_details){
		for(i=0;i<frm.doc.kpi_people_details.length;i++){
			if(frm.doc.kpi_people_details[i].client_kpi_acceptance=="Reject" || frm.doc.kpi_people_details[i].client_kpi_acceptance==""){
				k_accpt_status = false;
			}
		 }
	}
	if(frm.doc.kpi_finance_details){
		for(i=0;i<frm.doc.kpi_finance_details.length;i++){
			if(frm.doc.kpi_finance_details[i].client_kpi_acceptance=="Reject" || frm.doc.kpi_finance_details[i].client_kpi_acceptance==""){
				k_accpt_status = false;
			}
		 }
	}
	if(frm.doc.kpi_process_details){
		for(i=0;i<frm.doc.kpi_process_details.length;i++){
			if(frm.doc.kpi_process_details[i].client_kpi_acceptance=="Reject" || frm.doc.kpi_process_details[i].client_kpi_acceptance==""){
				k_accpt_status = false;
			}
		 }
	}
	if(frm.doc.kpi_status!="Reviewed"){
		if(k_accpt_status){
			frm.doc.kpi_status="Accepted";
		}
		else{
			frm.doc.kpi_status="Open";
		}
	}
});


//on save event, if customer accept all % complition, then kpi status will be closed
// frappe.ui.form.on("KPI", "validate", function(frm,cdt,cdn) {
// 	var k_status = true;
// 	if(frm.doc.kpi_business_details){
// 		for(i=0;i<frm.doc.kpi_business_details.length;i++){
// 			if(frm.doc.kpi_business_details[i].client_status=="Reject"){
// 				k_status = false;
// 			}
// 		 }
// 	}
// 	if(frm.doc.kpi_people_details){
// 		for(i=0;i<frm.doc.kpi_people_details.length;i++){
// 			if(frm.doc.kpi_people_details[i].client_status=="Reject"){
// 				k_status = false;
// 			}
// 		 }
// 	}
// 	if(frm.doc.kpi_finance_details){
// 		for(i=0;i<frm.doc.kpi_finance_details.length;i++){
// 			if(frm.doc.kpi_finance_details[i].client_status=="Reject"){
// 				k_status = false;
// 			}
// 		 }
// 	}
// 	if(frm.doc.kpi_process_details){
// 		for(i=0;i<frm.doc.kpi_process_details.length;i++){
// 			if(frm.doc.kpi_process_details[i].client_status=="Reject"){
// 				k_status = false;
// 			}
// 		 }
// 	}
// 	frm.doc.kpi_status="Closed";
// });

//before submit validate kpi status and customer accpet all % complition
// frappe.ui.form.on("KPI Business Details", "client_kpi_acceptance", function(frm,cdt,cdn) {

//     if(frm.doc.kpi_business_details){
//     	var k_status = true;
// 		for(i=0;i<frm.doc.kpi_business_details.length;i++){
// 			if(frm.doc.kpi_business_details[i].client_kpi_acceptance=="Reject" || frm.doc.kpi_business_details[i].client_kpi_acceptance==""){
// 				k_status = false;
// 			}
// 		 }
// 		if(k_status){
// 			cd_fields = ['task','due_date','priority','criticality','resouce_assigned','skill_matrix_120','client_kpi_acceptance','client_kpi_acceptance_comment']

// 			$.each(cd_fields, function(index, value){
// 				var df = frappe.meta.get_docfield("KPI Business Details",value, cur_frm.doc.name);
// 				df.read_only = 1;
// 			})
// 		}
//     }	
// });
frappe.ui.form.on("KPI", "onload", function(frm,cdt,cdn) {
	if(frm.doc.kpi_status=="Accepted"){
		cur_frm.set_df_property("kpi_status", "read_only", 1);
	}
	else{
		cur_frm.set_df_property("kpi_status", "read_only", 0);
	}
});
frappe.ui.form.on("KPI", "refresh", function(frm,cdt,cdn) {
	if(frm.doc.kpi_status=="Accepted"){
		cur_frm.set_df_property("kpi_status", "read_only", 1);
	}
	else{
		cur_frm.set_df_property("kpi_status", "read_only", 0);
	}
});
frappe.ui.form.on("KPI", "before_submit", function(frm,cdt,cdn) {
	var k_status = true;

    if(frm.doc.kpi_business_details){
		for(i=0;i<frm.doc.kpi_business_details.length;i++){
			if(frm.doc.kpi_business_details[i].client_status=="Reject"){
				k_status = false;
			}
		 }
    }
    if(frm.doc.kpi_people_details){
		for(i=0;i<frm.doc.kpi_people_details.length;i++){
			if(frm.doc.kpi_people_details[i].client_status=="Reject"){
				k_status = false;
			}
		 }
    }
    if(frm.doc.kpi_finance_details){
		for(i=0;i<frm.doc.kpi_finance_details.length;i++){
			if(frm.doc.kpi_finance_details[i].client_status=="Reject"){
				k_status = false;
			}
		 }
    }
    if(frm.doc.kpi_process_details){
		for(i=0;i<frm.doc.kpi_process_details.length;i++){
			if(frm.doc.kpi_process_details[i].client_status=="Reject"){
				k_status = false;
			}
		}
    }

		 if(!k_status){
		 	frappe.throw("Customer should accept all Actual Completion (%) befor KPI Submision");
		 }
		 if(frm.doc.kpi_status=="Open" || frm.doc.kpi_status==""){
		 	frappe.throw("KPI Status should be Closed/Accepted befor KPI Submision");
		 }
	
});

//read only mycfo user fields on accept on kpi by customer
cur_frm.cscript.kpi_business_details_on_form_rendered = function(doc, cdt, cdn){	
	var row = cur_frm.cur_grid.get_open_form(); 
	if (row.doc.client_kpi_acceptance == "Accept"){
		console.log("in if")
		toggle_read_only_property_of_fields(1,"kpi_business_details")
	}else{
		console.log("in else")
		toggle_read_only_property_of_fields(0,"kpi_business_details")
	}	

	if (row.doc.client_status == "Accept"){
		console.log("in if2")
		toggle_read_only_property_of_fields_ap(1,"kpi_business_details")
	}else{
		console.log("in else2")
		toggle_read_only_property_of_fields_ap(0,"kpi_business_details")
	}	
}
cur_frm.cscript.kpi_people_details_on_form_rendered = function(doc, cdt, cdn){	
	var row = cur_frm.cur_grid.get_open_form(); 
	if (row.doc.client_kpi_acceptance == "Accept"){
		console.log("in if")
		toggle_read_only_property_of_fields(1,"kpi_people_details")
	}else{
		console.log("in else")
		toggle_read_only_property_of_fields(0,"kpi_people_details")
	}	

	if (row.doc.client_status == "Accept"){
		console.log("in if2")
		toggle_read_only_property_of_fields_ap(1,"kpi_people_details")
	}else{
		console.log("in else2")
		toggle_read_only_property_of_fields_ap(0,"kpi_people_details")
	}
}
cur_frm.cscript.kpi_finance_details_on_form_rendered = function(doc, cdt, cdn){	
	var row = cur_frm.cur_grid.get_open_form(); 
	if (row.doc.client_kpi_acceptance == "Accept"){
		console.log("in if")
		toggle_read_only_property_of_fields(1,"kpi_finance_details")
	}else{
		console.log("in else")
		toggle_read_only_property_of_fields(0,"kpi_finance_details")
	}	

	if (row.doc.client_status == "Accept"){
		console.log("in if2")
		toggle_read_only_property_of_fields_ap(1,"kpi_finance_details")
	}else{
		console.log("in else2")
		toggle_read_only_property_of_fields_ap(0,"kpi_finance_details")
	}
}
cur_frm.cscript.kpi_process_details_on_form_rendered = function(doc, cdt, cdn){	
	var row = cur_frm.cur_grid.get_open_form(); 
	if (row.doc.client_kpi_acceptance == "Accept"){
		console.log("in if")
		toggle_read_only_property_of_fields(1,"kpi_process_details")
	}else{
		console.log("in else")
		toggle_read_only_property_of_fields(0,"kpi_process_details")
	}	

	if (row.doc.client_status == "Accept"){
		console.log("in if2")
		toggle_read_only_property_of_fields_ap(1,"kpi_process_details")
	}else{
		console.log("in else2")
		toggle_read_only_property_of_fields_ap(0,"kpi_process_details")
	}
}
toggle_read_only_property_of_fields = function(property,table_name){
	var field_index = [0,1,2,3,4];	
	$.each(field_index, function(i, value){
		cur_frm.get_field(table_name).grid.docfields[value].read_only = property;
	})
	refresh_field(table_name)	
}
toggle_read_only_property_of_fields_ap = function(property,table_name){
	var field_index = [15];	
	$.each(field_index, function(i, value){
		cur_frm.get_field(table_name).grid.docfields[value].read_only = property;
	})
	refresh_field(table_name)	
}


//calculate table wise weightage
frappe.ui.form.on("KPI", "validate", function(frm,cdt,cdn) {
    var business_w_total=0;
    if(frm.doc.kpi_business_details){
		for(i=0;i<frm.doc.kpi_business_details.length;i++){
			business_w_total +=frm.doc.kpi_business_details[i].weightage
		 }
		 frm.set_value("business_total_weightage",business_w_total)
	}

	var people_w_total=0;
    if(frm.doc.kpi_people_details){
		for(i=0;i<frm.doc.kpi_people_details.length;i++){
			people_w_total +=frm.doc.kpi_people_details[i].weightage
		 }
		 frm.set_value("people_total_weightage",people_w_total)
	}

	var finance_w_total=0;
    if(frm.doc.kpi_finance_details){
		for(i=0;i<frm.doc.kpi_finance_details.length;i++){
			finance_w_total +=frm.doc.kpi_finance_details[i].weightage
		 }
		 frm.set_value("finance_total_weightage",finance_w_total)
	}

	var process_w_total=0;
    if(frm.doc.kpi_process_details){
		for(i=0;i<frm.doc.kpi_process_details.length;i++){
			process_w_total +=frm.doc.kpi_process_details[i].weightage
		 }
		 frm.set_value("process_total_weightage",process_w_total)
	}
});


frappe.ui.form.on("KPI", "accept_all_client_kpi_acceptance", function(frm,cdt,cdn) {
	for(i=0;i<frm.doc.kpi_business_details.length;i++){
		frm.doc.kpi_business_details[i].client_kpi_acceptance = "Accept";
	 };
	 for(i=0;i<frm.doc.kpi_finance_details.length;i++){
		frm.doc.kpi_finance_details[i].client_kpi_acceptance = "Accept";
	 };
	 for(i=0;i<frm.doc.kpi_people_details.length;i++){
		frm.doc.kpi_people_details[i].client_kpi_acceptance = "Accept";
	 };
	 for(i=0;i<frm.doc.kpi_process_details.length;i++){
		frm.doc.kpi_process_details[i].client_kpi_acceptance = "Accept";
	 };
	msgprint("Accepted all Client KPI Acceptance")
});
frappe.ui.form.on("KPI", "accept_all_client_final_acceptance", function(frm,cdt,cdn) {
	for(i=0;i<frm.doc.kpi_business_details.length;i++){
		frm.doc.kpi_business_details[i].client_status = "Accept";
	 };
	 for(i=0;i<frm.doc.kpi_finance_details.length;i++){
		frm.doc.kpi_finance_details[i].client_status = "Accept";
	 };
	 for(i=0;i<frm.doc.kpi_people_details.length;i++){
		frm.doc.kpi_people_details[i].client_status = "Accept";
	 };
	 for(i=0;i<frm.doc.kpi_process_details.length;i++){
		frm.doc.kpi_process_details[i].client_status = "Accept";
	 };
	msgprint("Accepted all Client Final Acceptance")
});