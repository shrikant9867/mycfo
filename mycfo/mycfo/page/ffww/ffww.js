frappe.pages['FFWW'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'FFWW Details',
		single_column: true
	});

	$("<div class='user-settings'></div>").appendTo(page.main);

	wrapper.property = new FFWW(wrapper);
}


FFWW = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".user-settings");
		this.make();
		this.refresh();
	},
	make: function() {
		var me = this;

	},

	refresh: function() {
		var me = this;
		
		if(!frappe.route_options){
			this.body.html("<p class='text-muted'>"+__("No contacts is available against the current customer.")+"</p>");
			return;
		}
		else{
			var customer_name = frappe.route_options['customer']
			$("<div class='col-md-12 row'><p><button class='btn btn-sm btn-default btn-address'> <i class='icon-plus'></i><a id='new'> New Contact</a></button></p></div>\
			<div id='property' class='col-md-12 row'>\
			<div class='row' style='height: 120px;'><ul id='mytable'style='list-style-type:none'></ul>\
			</div></div>").appendTo(me.body);

			$.each(frappe.route_options, function(i, d) {

				$("<li id='property_list' list-style-position: inside;><div class='col-md-12 property-div'>\
				<div id='image' class='col-md-6 property-image'>  \
				<div id='img' class='col-md-12 image-div'>\
				<div id="+i+" class='row property_img'></div>\
				</div>\
				</div>\
			 <div id='details' class='col-md-6 property-main-div'>\
			 <div id='edit-button' class='col-md-12 property-id'><p><button class='btn btn-sm btn-default btn-address' id= "+d['contact_person']+"><a href='#Form/Contact/"+""+d['contact_person']+"'>Edit</a></button></p>\
			 </div></div>\
			 </div></li>").appendTo($(me.body).find("#mytable"))

				if(d['contact_person']){
					$($(me.body).find("#mytable").find("#"+i+"")).append('<div class="row property-row">\
						<div class="col-md-12 row">'+d['contact_person']+'</div>\
						</div>')
				}
				if(d['contact_display']){
					$($(me.body).find("#mytable").find("#"+i+"")).append('<div class="row property-row">\
						<div class="col-md-12 row">'+d['contact_display']+'</div>\
						</div>')
				}
				if(d['contact_email']){
					$($(me.body).find("#mytable").find("#"+i+"")).append('<div class="row property-row">\
						<div class="col-md-12 row">'+d['contact_email']+'</div>\
						</div>')
				}
				if(d['contact_designation']){
					$($(me.body).find("#mytable").find("#"+i+"")).append('<div class="row property-row">\
						<div class="col-md-12 row">'+d['contact_designation']+'</div>\
						</div>')
				}
				if(d['contact_mobile_official']){
					$($(me.body).find("#mytable").find("#"+i+"")).append('<div class="row property-row">\
						<div class="col-md-12 row">'+d['contact_mobile_official']+'</div>\
						</div>')
				}

			})

			
		}


		$('#new').click(function(){
			contact = frappe.new_doc('Contact');
			contact.customer =  frappe.route_options['customer']
			//frappe.set_route("Form","Contact");
		})

		



	},

})