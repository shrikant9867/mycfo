
frappe.provide('frappe.pages');
frappe.provide('frappe.views');
frappe.provide('mycfo');
frappe.require("assets/frappe/js/lib/slickgrid/slick.grid.js");
frappe.require("assets/frappe/js/lib/slickgrid/slick.grid.css");
frappe.require("assets/frappe/js/lib/slickgrid/slick.core.js");
frappe.require("assets/frappe/js/lib/slickgrid/slick.editors.js");
frappe.require("assets/frappe/js/lib/slickgrid/slick.formatters.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.checkboxselectcolumn.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.rowselectionmodel.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.autotooltips.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellrangedecorator.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellrangeselector.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellcopymanager.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellexternalcopymanager.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellselectionmodel.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.rowselectionmodel.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellselectionmodel.js");

frappe.require("assets/mycfo/js/slick/controls/slick.pager.js");
frappe.require("assets/mycfo/js/slick/controls/slick.columnpicker.js");

frappe.pages['resourcepool'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Resource Pool ',
		single_column: true
	});

	var options = {
		doctype: "Skill Mapping",
		parent: page
	};
	// created custom div, after making slickgrid, slickgrid will be append on custom div myGrid
	$("<table width='100%>\
  <tr>\
    <td valign='top' width='50%'>\
      <div id='myGrid' style='width:100%;height:500px;''></div>\
    </td>\
  </tr>\
</table>").appendTo($(wrapper).find('.layout-main-section'));
	setTimeout(function(){
		new new mycfo.SkillMapping(options, wrapper, page);	
	}, 1)
	frappe.breadcrumbs.add("KPI");

}	

mycfo.SkillMapping = Class.extend({
	init: function(opts, wrapper,page) {
		$.extend(this, opts);
		// this.make_filters(wrapper);
		this.page = wrapper.page;
		this.page.add_menu_item(__("Refresh"), function() { location.reload(); }, true);
		this.prepare_data();
			this.page.main.find(".page").css({"padding-top": "0px"});
	},
	make_fun: function(){
            this.page.set_title(__("Resource Pool"));

     },
    make: function(){
        this._super();
        this.make_fun();
    },
	prepare_data: function() {
		var me = this;
	//slick start
        function requiredFieldValidator(value) {
            if (value == null || value == undefined || !value.length) {
                return {valid: false, msg: "This is a required field"};
            } else {
                return {valid: true, msg: null};
            }
        }
		var columns = [];
		  var options = {
		    enableCellNavigation: true,
		    enableColumnReorder: false,
		    showHeaderRow: true,
		    headerRowHeight: 30,
		    explicitInitialization: true, //shoud be true
		    multiColumnSort: true,
		  };
		 
		var columnFilters = {};
		var grid;
  		var data=[];
			 frappe.call({
				method: "mycfo.kpi.page.resourcepool.resourcepool.get_sample_data",
				type: "GET",
				args: {
					args:{

					}
				},
				callback: function(r){
					if(r.message){
						me.data = r.message;
						// msgprint(r.message)
						me.make_grid(r.message,columns,options)
						//me.waiting.toggle(false);

					}
				}
			});
	},

	//function split to make new grid from frappe.call
	make_grid:function(data1,columns,options){

			$(function () {
		    var data = [];

		    function requiredFieldValidator(value) {
		        if (value <=10 && value > 0) {
		          return {valid: true, msg: null};
		        } else {
		          return {valid: false, msg: "This is a required field"};
		        }
		    }


		    var columns = [
	        {id: "sel", name: "#", field: "num", cssClass: "cell-selection", width: 40, resizable: false, selectable: false, focusable: false },
	        {id: "employee", name: "Employee", field: "employee", width: 150, cssClass: "cell-title", validator: requiredFieldValidator},        	        
	        {id: "master_industry", name: "Skill Matrix 18", field: "master_industry", width: 150, cssClass: "cell-title", validator: requiredFieldValidator},        
	        {id: "industry", name: "Skill Matrix 120", field: "industry", width: 330, cssClass: "cell-title", validator: requiredFieldValidator},
	        {id: "none_field", name: "None Field", field: "none_field",editor: Slick.Editors.Text, validator: requiredFieldValidator},
	        {id: "beginner", name: "Beginner", field: "beginner",editor: Slick.Editors.Text, validator: requiredFieldValidator},
	        {id: "imtermediatory", name: "Imtermediatory", field: "imtermediatory", minWidth: 60, editor: Slick.Editors.Text, validator: requiredFieldValidator},
	        {id: "imtermediatory", name: "Expert", field: "expert", minWidth: 60, editor: Slick.Editors.Text, validator: requiredFieldValidator},
	        {id: "skill_m_industry", name: "Industry", field: "skill_m_industry", width: 150, cssClass: "cell-title", validator: requiredFieldValidator},        	        
	        ];

	        for (var i = 0; i<data1.get_sample_data.length; i++) {
	        	if (data1.get_sample_data[i][1]!=''){
					data[i] = {
					    id: i,
					    num:i+1,
					    master_industry: data1.get_sample_data[i][0],
					    industry: data1.get_sample_data[i][1],
					    none_field: data1.get_sample_data[i][2],
					    beginner: data1.get_sample_data[i][3],
					    imtermediatory: data1.get_sample_data[i][4],
					    expert: data1.get_sample_data[i][5],
					    employee: data1.get_sample_data[i][7],
					    skill_m_industry:data1.get_sample_data[i][8]
					};
	     		}
	        }
		    // for (var i = 0; i<data1.get_sample_data.length; i++) {
		    //   data[i] = {
		    //   	id: ""+(i+1)+" ",
		    //   	checked:true,
		    //     sampleid: data1.get_sample_data[i][1],
		    //     customer: data1.get_sample_data[i][2],
		    //     type: data1.get_sample_data[i][3],
		    //     priority: data1.get_sample_data[i][4],
		    //     standard: data1.get_sample_data[i][5],
		    //     test_group: data1.get_sample_data[i][6]
		    //   };
		    // }
		    grid = new Slick.Grid("#myGrid", data, columns, options);
		    
		        var checkboxSelector = new Slick.CheckboxSelectColumn({
      			cssClass: "slick-cell-checkboxsel"
   				 });
    			// columns.push(checkboxSelector.getColumnDefinition());
			 //      columns.push(
				// {id: "id", name: "Sr.No", field: "id", minWidth:5},
			 //    {id: "sample_id", name: "Sample Id", field: "sampleid", minWidth:120,
				//     formatter: linkFormatter = function ( row, cell, value, columnDef, dataContext ) {
	   //         			 return '<a href="desk#Form/Sample Entry Register/' + dataContext['sampleid'] + '">' + value + '</a>';
	   //    			  }},
			 //    {id: "customer", name: "Customer", field: "customer",minWidth:200,
				// 	  formatter: linkFormatter = function ( row, cell, value, columnDef, dataContext ) {
		  //          			 return '<a href="desk#Form/Customer/' + dataContext['customer'] + '">' + value + '</a>';
		  //     			  }},
			 //    {id: "type", name: "Sample Type", field: "type",minWidth:120},
			 //    {id: "priority", name: "Priority", field: "priority",minWidth:120},
			 //    {id: "standard", name: "Standard", field: "standard",minWidth:120}
    // 			// {id: "test_group", name: "Test Group", field: "test_group",minWidth:120}
			 //       );

			// grid = new Slick.Grid("#myGrid", data, columns, options);	
			var columnFilters = {};
	        dataView = new Slick.Data.DataView();
	        //call to create grid report
   			grid = new Slick.Grid("#myGrid", dataView, columns, options);

//
  // function filter(item) {
  //   for (var columnId in columnFilters) {
  //     if (columnId !== undefined && columnFilters[columnId] !== "") {
  //       var c = grid.getColumns()[grid.getColumnIndex(columnId)];
  //       if (item[c.field] != columnFilters[columnId]) {
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // }
//

//Start filter in slick grid
   			function filter(item) {
        // Regex pattern to validate numbers
        var patRegex_no = /^[$]?[-+]?[0-9.,]*[$%]?$/; // a number negative/positive with decimals with/without $, %

        for (var columnId in columnFilters) {
            if (columnId !== undefined && columnFilters[columnId] !== "") {
                var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                var filterVal = columnFilters[columnId].toLowerCase();
                var filterChar1 = filterVal.substring(0, 1); // grab the 1st Char of the filter field, so we could detect if it's a condition or not

                if(item[c.field] == null)
                    return false;

                // First let see if the user supplied a condition (<, <=, >, >=, !=, <>, =, ==)
                // Substring on the 1st Char is enough to find out if it's a condition or not
                // if a condition is supplied, we might have to transform the values (row values & filter value) before comparing
                // for a String (we'll do a regular indexOf), for a number (parse to float then compare), for a date (create a Date Object then compare)
                if( filterChar1 == '<' || filterChar1 == '>' || filterChar1 == '!' || filterChar1 == '=') {
                    // We found a Condition filter, find the white space index position of the condition substring (should be index 1 or 2)
                    var idxFilterSpace = filterVal.indexOf(" ");

                    if( idxFilterSpace > 0 ) {
                        // Split the condition & value of the full filter String
                        var condition = filterVal.substring(0, idxFilterSpace);
                        filterNoCondVal = columnFilters[columnId].substring(idxFilterSpace+1);

                        // Which type are the row values? We'll convert to proper format before applying the condition
                        // Then apply the condition comparison: String (we'll do a regular indexOf), number (parse to float then compare)
                        if( patRegex_no.test(item[c.field]) ) {                             
                            if( testCondition(condition, parseFloat(item[c.field]), parseFloat(filterNoCondVal)) == false ) 
                                return false;
                        // whatever is remain will be tested as a regular String format     
                        }else {                             
                            if ( testCondition(condition, item[c.field].toLowerCase(), filterNoCondVal.toLowerCase()) == false )
                                return false;
                        }
                    } 
                }else{
                    if (item[c.field].toLowerCase().indexOf(columnFilters[columnId].toLowerCase()) == -1)
                        return false;
                }
            }
        }
        return true;
    }
//end of filter
    dataView.onRowCountChanged.subscribe(function (e, args) {
      grid.updateRowCount();
      grid.render();
    });
    dataView.onRowsChanged.subscribe(function (e, args) {
      grid.invalidateRows(args.rows);
      grid.render();
    });
    $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
      var columnId = $(this).data("columnId");
      if (columnId != null) {
        columnFilters[columnId] = $.trim($(this).val());
        dataView.refresh();
      }
    });
    grid.onHeaderRowCellRendered.subscribe(function(e, args) {
        $(args.node).empty();
        $("<input type='text'>")
           .data("columnId", args.column.id)
           .val(columnFilters[args.column.id])
           .appendTo(args.node);
    });

		    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
		    grid.registerPlugin(checkboxSelector);
		    grid.init();
		    dataView.beginUpdate();
		    //fill data into grid report
		    dataView.setItems(data);
		    dataView.setFilter(filter);
		    dataView.endUpdate();
		    var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

		  })

	},

})