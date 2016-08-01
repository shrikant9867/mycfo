frappe.ui.form.on("Customer", "refresh", function(frm) {
	if(!frm.doc.__islocal) {
		frappe.call({
			method: "mycfo.ip_library.page.ip_file_dashboard.ip_file_dashboard.validate_user_is_el",
			args: {
				"customer": frm.doc.name
			},
			callback: function(r) {
				if (r.message['is_el'] == 1){
					frm.add_custom_button(__("EL Sign Off"), function() {
						var di = new frappe.ui.Dialog({
							title: __("EL Sign Off Confirmation"),
							fields: [
								{fieldtype:"HTML", label:__("Message"), fieldname:"msg"},
							]
						});

						$(di.body).find("[data-fieldname='msg']").html(frappe.render_template("sign_off_details", {}));
						di.show();
						
						$(di.body).find("#sign_off").on("click", function(){
							frappe.call({
								freeze: true,
		                        freeze_message:"EL Sign Off Authentication & Updation...",
								method: "mycfo.mycfo.doctype.el_sign_off_details.el_sign_off_details.get_info",
								args: {
									"customer": frm.doc.name,
									"user" : user
								},
								callback: function(r) {
									if(r.message == "Sign Off Entry Created"){
										di.hide();
										msgprint(__("Customer '{0}' Signed Off Successfully..!!!", [frm.doc.name]));
									}
								}
							});
						})
					}).removeClass("btn-default").addClass("btn-primary");
				}
			}
		});
	}
})