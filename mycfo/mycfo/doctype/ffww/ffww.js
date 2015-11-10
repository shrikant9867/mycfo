// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

{% include 'controllers/js/contact_address_common.js' %};

frappe.ui.form.on("FFWW", "refresh", function(wrapper) {
	console.log($(wrapper))

	wrapper.disable_save();
	wrapper.make_tree = function() {
		var ctype = 'Designation';
		console.log(["ctype",ctype])
		this.designation = $(wrapper.body).find("#designation");

		return frappe.call({
			method: 'mycfo.mycfo.doctype.ffww.ffww.get_children',
			args: {ctype: ctype},
			callback: function(r) {
				var root = 'Designation';
				dms = new DMS(ctype, root,
					wrapper.page.main.css({
						"min-height": "500px",
						"padding-bottom": "25px"
					}));
			}
		});
	}
	wrapper.make_tree();
	
 });


DMS = Class.extend({
	init: function(ctype, root,  parent) {
		console.log("inside init")
		console.log([parent])
		$(parent).empty();
		var me = this;
		me.ctype = ctype;
		//me.page = page;
		me.can_read = frappe.model.can_read(this.ctype);
		me.can_create = frappe.boot.user.can_create.indexOf(this.ctype) !== -1 ||
					frappe.boot.user.in_create.indexOf(this.ctype) !== -1;
		me.can_write = frappe.model.can_write(this.ctype);
		me.can_delete = frappe.model.can_delete(this.ctype);
      

		this.tree = new frappe.ui.Tree1({
			parent: $(parent),
			label: __(root),
			args: {ctype: ctype},
			method: 'mycfo.mycfo.doctype.ffww.ffww.get_children',
			toolbar: [
				{toggle_btn: true},		
			]
		});
		console.log(["tree",$(this.tree)])
	},   
});

// frappe.provide("contact")
// contact.operations = {
// 	init:function(frm){
// 		var me = this;
// 		this.doc = frm.doc
// 		if(frappe.route_options){
// 			me.enable_contact(frm,frappe.route_options["doc"])
// 		}
// 		else {
// 			if(frm.doc.customer)
// 				me.enable_contact_posting(frm)
// 		}
// 	},

// 	enable_contact:function(frm,doc){
// 		var me = this;
// 		var me = this;
// 		frm.disable_save();
// 		frm.doc.customer = frappe.route_options['customer']
// 		if(frm.doc.customer){
// 			frappe.call({
// 				method:"mycfo.mycfo.doctype.ffww.ffww.load_address_and_contact",
// 				args:{doc: frm.doc,key:'customer'},
// 				callback: function(r) {
// 					if(frm.fields_dict['contact_html']) {
// 						$(frm.fields_dict['contact_html'].wrapper)
// 							.html(frappe.render_template("contact_list",
// 								r.message))
// 							.find(".btn-contact").on("click", function() {
// 								new_doc("Contact");
// 							}
// 						);
// 				}
// 				},
// 				always: function() {
// 					frappe.ui.form.is_saving = false;
// 				}
// 		})
// 	}
	

// 	},

// 	enable_contact_posting:function(frm){
// 		var me = this;
// 		me.manage_primary_operations(frm)	
// 	},

// 	manage_primary_operations:function(frm){
// 		var me = this;
// 		frm.disable_save();
// 		frappe.call({
// 				method:"mycfo.mycfo.doctype.ffww.ffww.load_address_and_contact",
// 				args:{doc: frm.doc,key:'customer'},
// 				callback: function(r) {
// 					if(frm.fields_dict['contact_html']) {
// 						$(frm.fields_dict['contact_html'].wrapper)
// 							.html(frappe.render_template("contact_list",
// 								r.message))
// 							.find(".btn-contact").on("click", function() {
// 								new_doc("Contact");
// 							}
// 						);
// 				}
// 				},
// 				always: function() {
// 					frappe.ui.form.is_saving = false;
// 				}
// 		})
// 	},
// }


frappe.ui.Tree1 = Class.extend({
	init: function(args) {
		console.log("treee1")
		$.extend(this, args);
		this.nodes = {};
		this.$w = $('<div class="col-md-12 tree">\
			<div class="col-md-4" id ="designation"></div>\
		<div class="col-md-4" id ="contact"></div>\
		<div class="col-md-4" id ="address"></div></div>').appendTo(this.parent);
		this.rootnode = new frappe.ui.TreeNode({
			tree: this,
			parent: $("#designation"),
			label: this.label,
			parent_label: null,
			expandable: true,
			root: true,
			count: 0,
			data: {
				value: this.label,
				parent: this.label,
				expandable: true
			}
		});
		this.rootnode.toggle();


		$('#new').click(function(){
			console.log("in new")
			new_doc('Contact');
				//contact.customer =  frappe.route_options['customer']
				//frappe.set_route("Form","Contact");
		})

		$('#new_add').click(function(){
			console.log("in new")
			new_doc('Contact');
				//contact.customer =  frappe.route_options['customer']
				//frappe.set_route("Form","Contact");
		})
	},
	get_selected_node: function() {
		return this.selected_node;
	},
	toggle: function() {
		this.get_selected_node().toggle();
	}
})



frappe.ui.TreeNode = Class.extend({
	init: function(args) {
		console.log(["args",args])
		$.extend(this, args);
		this.loaded = false;
		this.expanded = false;
		this.tree.nodes[this.label] = this;
		console.log(this.id)
		if(this.parent_label)
			this.parent_node = this.tree.nodes[this.parent_label];

		this.make();
		this.setup_drag_drop();

		if(this.tree.onrender) {
			this.tree.onrender(this);
		}
	},
	make: function() {
		console.log("make")
		var me = this;
		this.$a = $('<span class="tree-link">')
			.click(function(event) {
				me.tree.selected_node = me;
				me.tree.$w.find(".tree-link.active").removeClass("active");
				me.$a.addClass("active");
				if(me.tree.toolbar) {
					me.show_toolbar();
				}
				if(me.toggle_on_click) {
					me.toggle();
				}
				if(me.tree.click)
					me.tree.click(this);
			})
			.bind('reload', function() { me.reload(); })
			.data('label', this.label)
			.data('node', this)
			.appendTo(this.parent);

		this.$ul = $('<ul class="tree-children">')
			.toggle(false).appendTo(this.parent);

		this.make_icon();
		//me.count++;

	},
	make_icon: function() {
		// label with icon
		console.log("make_icon")
		var me= this;
		var icon_html = '<i class="icon-fixed-width octicon octicon-primitive-dot text-extra-muted"></i>';
		if(this.expandable) {
			icon_html = '<i class="icon-fixed-width icon-folder-close text-muted"></i>';
		}
		$(icon_html + ' <a class="tree-label grey h6" id ='+this.get_label()+'>' + this.get_label() + "</a>").
			appendTo(this.$a);

		this.$a.find('i').click(function() {
			console.log("hello")
			setTimeout(function() { me.toolbar.find(".btn-expand").click(); }, 100);
		});

		$('#'+this.get_label()+'').click(function(){
			console.log($(this).text())
			frappe.call({
				method:"mycfo.mycfo.doctype.ffww.ffww.load_address_and_contact",
				args:{record:$(this).text(),key:'name',key1:'contact'},
				callback: function(r) {
					console.log(r.message['contact_list'])
					console.log($('#contact'))
					$("#contact")
								.html(frappe.render_template("contact_list",
									r.message))
								.find(".btn-contact").on("click", function() {
									new_doc("Contact");
								}
					);

					$("#address")
								.html(frappe.render_template("address_list",
									r.message))
								.find(".btn-address").on("click", function() {
									new_doc("Address");
								}
					);
				},
				always: function() {
					frappe.ui.form.is_saving = false;
				}
		})
		})
	},
	get_label: function() {
		if(this.tree.get_label) {
			return this.tree.get_label(this);
		}

		console.log(["label",this.label])
		return __(this.label);
	},
	toggle: function(callback) {
		if(this.expandable && this.tree.method && !this.loaded) {
			this.load(callback)
		} else {
			this.toggle_node(callback);
		}
	},
	show_toolbar: function() {
		if(this.tree.cur_toolbar)
			$(this.tree.cur_toolbar).toggle(false);

		if(!this.toolbar)
			this.make_toolbar();

		this.tree.cur_toolbar = this.toolbar;
		this.toolbar.toggle(true);
	},
	make_toolbar: function() {
		var me = this;
		this.toolbar = $('<span class="tree-node-toolbar btn-group"></span>').insertAfter(this.$a);

		$.each(this.tree.toolbar, function(i, item) {
			if(item.toggle_btn) {
				item = {
					condition: function() { return me.expandable; },
					get_label: function() { return me.expanded ? __("Collapse") : __("Expand") },
					click:function(node, btn) {
						node.toggle(function() {
							$(btn).html(node.expanded ? __("Collapse") : __("Expand"));
						});
					},
					btnClass: "btn-expand"
				}
			}
			if(item.condition) {
				if(!item.condition(me)) return;
			}
			var label = item.get_label ? item.get_label() : item.label;
			var link = $("<button class='btn btn-default btn-xs'></button>")
				.html(label)
				.appendTo(me.toolbar)
				.click(function() { item.click(me, this); return false; });
			console.log(["var lonk",link])

			if(item.btnClass) link.addClass(item.btnClass);
		})

	},
	setup_drag_drop: function() {
		// experimental
		var me = this;
		if(this.tree.drop && this.parent_label) {
			this.$ul.droppable({
				hoverClass: "tree-hover",
				greedy: true,
				drop: function(event, ui) {
					event.preventDefault();
					var dragged_node = $(ui.draggable).find(".tree-link:first").data("node");
					var dropped_node = $(this).parent().find(".tree-link:first").data("node");
					me.tree.drop(dragged_node, dropped_node, $(ui.draggable), $(this));
					return false;
				}
			});
		}

	},
	addnode: function(data,id) {
		var $li = $('<li class="tree-node">');
		console.log(["liiii",$li])
		if(this.tree.drop) $li.draggable({revert:true});
		return new frappe.ui.TreeNode({
			tree:this.tree,
			parent: $li.appendTo(this.$ul),
			parent_label: this.label,
			label: data.value,
			expandable: data.expandable,
			data: data,
			id:id
		});
	},
	toggle_node: function(callback) {
		// expand children
		if(this.$ul) {
			if(this.$ul.children().length) {
				this.$ul.toggle(!this.expanded);
			}

			// open close icon
			this.$a.find('i').removeClass();
			if(!this.expanded) {
				this.$a.find('i').addClass('icon-fixed-width icon-folder-open text-muted');
			} else {
				this.$a.find('i').addClass('icon-fixed-width icon-folder-close text-muted');
			}
		}

		// select this link
		this.tree.$w.find('.selected')
			.removeClass('selected');
		this.$a.toggleClass('selected');
		this.expanded = !this.expanded;
		if(callback) callback();
	},
	reload: function() {
		this.load();
	},
	load: function(callback) {
		var me = this;
		args = $.extend(this.tree.args || {}, {
			parent: this.data ? (this.data.parent || this.data.value) : null
		});

		return frappe.call({
			method: this.tree.method,
			args: args,
			callback: function(r) {
				me.$ul.empty();
				if (r.message) {
					$.each(r.message, function(i, v) {
						node = me.addnode(v,i);
						node.$a
							.data('node-data', v)
							.data('node', node);
					});
				}

				if(!me.expanded)
					me.toggle_node(callback);
				me.loaded = true;

			}
		})
	}
})
