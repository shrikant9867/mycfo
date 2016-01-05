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

cur_frm.fields_dict['industry'].get_query = function(doc, dt, dn) {
	if(doc.industry_group){
		return{
			filters:{'sector': doc.sector,
					'industry_group': doc.industry_group
					}
		}
	}
	else{
		msgprint("First select the Industry Group.")
		doc.industry =''
		refresh_field('industry')
	}
}

cur_frm.fields_dict['sub_industry'].get_query = function(doc, dt, dn) {
	if(doc.industry){
		return{
			filters:{'sector': doc.sector,
					'industry_group': doc.industry_group,
					'industry': doc.industry
					}
		}
	}
	else{
		msgprint("First select the Industry.")
		doc.sub_industry =''
		refresh_field('sub_industry')
	}
}