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


cur_frm.add_fetch("skill_matrix_120", "skill_matrix_18", "skill_matrix_18")


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
		 if(frm.doc.kpi_status!="Closed"){
		 	frappe.throw("KPI Status should be closed befor KPI Submision");
		 }
	
});