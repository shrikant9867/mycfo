frappe.require("assets/mycfo/js/slick/lib/firebugx.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.cellrangedecorator.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.cellrangeselector.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.cellselectionmodel.js");



frappe.require("assets/mycfo/js/slick/slick.formatters.js");
frappe.require("assets/mycfo/js/slick/slick.editors.js");
frappe.require("assets/mycfo/js/slick/slick.grid.js");
frappe.require("assets/mycfo/js/slick/slick.core.js");



frappe.require("assets/mycfo/js/slick/slick.groupitemmetadataprovider.js");
frappe.require("assets/mycfo/js/slick/slick.dataview.js");
frappe.require("assets/mycfo/js/slick/controls/slick.pager.js");
frappe.require("assets/mycfo/js/slick/controls/slick.columnpicker.js");

frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.checkboxselectcolumn.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.rowselectionmodel.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.autotooltips.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellcopymanager.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.cellexternalcopymanager.js");
frappe.require("assets/frappe/js/lib/slickgrid/plugins/slick.rowselectionmodel.js");


cur_frm.add_fetch('employee', 'employee_name', 'employee_name');

//Validation Skill Mapping start date
cur_frm.cscript.start_date = function(doc,cdt,cdn){
  if(doc.start_date && doc.end_date){
    var start_date = new Date(doc.start_date);
    var end_date = new Date(doc.end_date);
    if(start_date>end_date)
      msgprint("End Date must be greater than Start Date")
  }
}

//validation Skill Mapping end date
cur_frm.cscript.end_date = function(doc,cdt,cdn){
  if(doc.start_date && doc.end_date){
    var start_date = new Date(doc.start_date);
    var end_date = new Date(doc.end_date);
    if(start_date>end_date)
      msgprint("End Date must be greater than Start Date")
  }
}
//calculate experience in month
frappe.ui.form.on("Skill Mapping", "validate", function(frm) {
var a = (Date.parse(frm.doc.end_date)-Date.parse(frm.doc.start_date))/(1000 * 3600 * 24*30);;
frm.doc.total_experience=Math.floor(a); 
});

frappe.ui.form.on("Skill Mapping", "onload", function(frm,doctype,name) {

    // $().appendTo($(wrapper).find('.layout-main-section'));

    $(cur_frm.fields_dict.mygrid.wrapper).append( "<table width='100%>\
  <tr>\
    <td valign='top' width='100%'>\
      <div id='myGrid' style='width:100%;height:500px;''></div>\
    </td>\
  </tr>\
</table>" );

});

// frappe.ui.form.on("Skill Mapping", "validate", function(frm,doctype,name) {
//     cur_frm.events.save_record();  
// });

// frappe.require("assets/frappe/js/slickgrid.min.js");
var selected_grid_data;
var grid_data;
var selectedData;
// var columnFilters = {};


// erpnext.selling.CustomQueryReport = erpnext.selling.QuotationController.extend({
frappe.ui.form.on("Skill Mapping", {
    prepare_data: function() {
    var me = this;
  //slick start
  // msgprint("in prepare data")
        // function requiredFieldValidator(value) {
        //     if (value == null || value == undefined || !value.length) {
        //         return {valid: false, msg: "This is a required field"};
        //     } else {
        //         return {valid: true, msg: null};
        //     }
        // }
var columns = [];
      var options = {
        // showHeaderRow: true,
        headerRowHeight: 30,
        editable: true,
        enableAddRow: true,
        asyncEditorLoading: false,
        enableCellNavigation: true,
        enableColumnReorder: false,
        explicitInitialization: true,
        editable: true,
      };
     
           var columns = [];
              columns.push(
{id: "sel", name: "#", field: "num", cssClass: "cell-selection", width: 40, resizable: false, selectable: false, focusable: false },
        {id: "industry", name: "Skills", field: "industry", width: 330, cssClass: "cell-title", validator: requiredFieldValidator},
        {id: "none_field", name: "None \(0\)", field: "none_field",width: 100,editor: Slick.Editors.Text, validator: requiredNoneFieldValidator},
        {id: "beginner", name: "Beginner \(1-4\)", field: "beginner",width: 100,editor: Slick.Editors.Text, validator: requiredBeginnerFieldValidator  },
        {id: "imtermediatory", name: "Imtermediatory \(5-7\)", field: "imtermediatory",width: 140, minWidth: 60, editor: Slick.Editors.Text, validator: requiredImtermediatoryFieldValidator},
        {id: "expert", name: "Expert \(8-10\)", field: "expert", minWidth: 60, width: 120,editor: Slick.Editors.Text, validator: requiredExpertFieldValidator}
        // {id: "master_industry", name: "Skill 18", field: "master_industry", width: 180, cssClass: "cell-title", validator: requiredFieldValidator}
             );

//validators for slick grid
      function requiredFieldValidator(value) {
        if (value <=10 && value >=0) {
          return {valid: true, msg: null};
        } else {
          return {valid: false, msg: msgprint("This is a required field") };
        }
      }
      function requiredNoneFieldValidator(value) {
        if (value==0) {
          return {valid: true, msg: null};
        } else {
          return {valid: false, msg: msgprint("Value should be Zero") };
        }
      }
      function requiredBeginnerFieldValidator(value) {
        if (value <=4 && value >=1) {
          return {valid: true, msg: null};
        } else {
          return {valid: false, msg: msgprint("Value should be 1 to 4") };
        }
      }
      function requiredImtermediatoryFieldValidator(value) {
        if (value <=7 && value >=5) {
          return {valid: true, msg: null};
        } else {
          return {valid: false, msg: msgprint("Value should be 5 to 7") };
        }
      }
      function requiredExpertFieldValidator(value) {
        if (value <=10 && value >=8) {
          return {valid: true, msg: null};
        } else {
          return {valid: false, msg: msgprint("Value should be 8 to 10") };
        }
      }

  var columnFilters = {};
    var grid;
      var data=[];

      if(cur_frm.doc.skill_mapping_details && cur_frm.doc.skill_mapping_details.length>2 ){
        // msgprint("first if");
           frappe.call({
            method: "mycfokpi.mykpi.doctype.skill_mapping.skill_mapping.get_sample_data_from_table",
            type: "GET",
            args: {
              "doc_name": cur_frm.doc.name
            },
            callback: function(r){
              // msgprint(r.message)
              if(r.message){
                me.data = r.message;
                me.make_grid(r.message,columns,options)
                //me.waiting.toggle(false);

              }
            }
          });
      }
      else{
        // msgprint("first else");

            frappe.call({
            method: "mycfokpi.mykpi.doctype.skill_mapping.skill_mapping.get_sample_data",
            type: "GET",
            args: {
              args:{

              }
            },
            callback: function(r){
              // msgprint(r.message)
              if(r.message){
                me.data = r.message;
                me.make_grid(r.message,columns,options);
                cur_frm.save();
                //me.waiting.toggle(false);

              }
            }
          });
      }

  },
make_grid:function(data1,columns,options){
        //start
        var me=this;

      var grid;

      // var columns = [
      //   {id: "sel", name: "#", field: "num", cssClass: "cell-selection", width: 40, resizable: false, selectable: false, focusable: false },
      //   {id: "industry", name: "#", field: "industry", width: 330, cssClass: "cell-title", validator: requiredFieldValidator},
      //   {id: "none_field", name: "None Field", field: "none_field",editor: Slick.Editors.Text, validator: requiredFieldValidator},
      //   {id: "beginner", name: "Beginner", field: "beginner",editor: Slick.Editors.Text, validator: requiredFieldValidator},
      //   {id: "imtermediatory", name: "Imtermediatory", field: "imtermediatory", minWidth: 60, editor: Slick.Editors.Text, validator: requiredFieldValidator},
      //   {id: "imtermediatory", name: "Expert", field: "expert", minWidth: 60, editor: Slick.Editors.Text, validator: requiredFieldValidator},
      //   {id: "master_industry", name: "Skill 18", field: "master_industry", width: 180, cssClass: "cell-title", validator: requiredFieldValidator},        
      //   ];
    var columnFilters = {};
      




        var data = [];
        for (var i = 0; i<data1.get_sample_data.length; i++) {
          data[i] = {
            id: i,
            num: i+1,
            master_industry: data1.get_sample_data[i][0],
            industry: data1.get_sample_data[i][1],
            none_field: data1.get_sample_data[i][2],
            beginner: data1.get_sample_data[i][3],
            imtermediatory: data1.get_sample_data[i][4],
            expert: data1.get_sample_data[i][5]

          };
        }


          var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
          dataView = new Slick.Data.DataView({
            groupItemMetadataProvider: groupItemMetadataProvider,
            inlineFilters: true
          });

            dataView.setItems(data)

            dataView.setGrouping({
              getter: "master_industry",
              formatter: function (g) {
                return g.value;
              },
              aggregators: [
                new Slick.Data.Aggregators.Sum("beginner")
              ],
              aggregateCollapsed: true,
              lazyTotalsCalculation: true
            });


              //call to create grid report
            grid = new Slick.Grid("#myGrid", dataView, columns, options);

            //filter start working
            grid.registerPlugin(groupItemMetadataProvider);
            grid.setSelectionModel(new Slick.CellSelectionModel());

                    dataView.onRowsChanged.subscribe(function (e, args) {
                      grid.invalidateRows(args.rows);
                      grid.render();
                    });

                    dataView.onRowCountChanged.subscribe(function (e, args) {
                      grid.updateRowCount();
                      grid.render();
                    });

                    grid.onHeaderRowCellRendered.subscribe(function(e, args) {
                        $(args.node).empty();
                        $("<input type='text'>")
                           .data("columnId", args.column.id)
                           .val(columnFilters[args.column.id])
                           .appendTo(args.node);
                    });
                    $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
                      var columnId = $(this).data("columnId");
                      if (columnId != null) {
                        columnFilters[columnId] = $.trim($(this).val());
                        dataView.refresh();
                      }
                    });
                    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
                    grid.init();

                    dataView.beginUpdate();
                    dataView.setItems(data);

                    dataView.setFilter(filter);
                    dataView.endUpdate();
                    // msgprint(grid.getDataLength())

            var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
            var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
    //Start filter in slick grid
            function filter(item, args) {
            // Regex pattern to validate numbers
            var patRegex_no = /^[$]?[-+]?[0-9.,]*[$%]?$/; // a number negative/positive with decimals with/without $, %
            for (var columnId in args) {
                if (columnId !== undefined && columnFilters[columnId] !== "") {
                    var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                    var filterVal = columnFilters[columnId].toString().toLowerCase();
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
                                if ( testCondition(condition, item[c.field].toString().toLowerCase(), filterNoCondVal.toString().toLowerCase()) == false )
                                    return false;
                            }
                        } 
                    }else{
                        if (item[c.field].toString().toLowerCase().indexOf(columnFilters[columnId].toString().toLowerCase()) == -1)
                            return false;
                    }
                }
            }
            return true ;
        }

    //end of filter
        

// msgprint("before greed data")
        me.grid_data = dataView.getItems()
         // msgprint(me.grid_data)

        // var ids = [];
        // for (var i=0; i<grid.getDataLength() ; i++) {
        //   // ids.push(grid.getDataItem(i).id);
        //   ids.push(grid.getDataItem(i));
        // }
        // msgprint(ids)
        // selectedData = ids;
        selectedData = dataView.getItems();
        // msgprint(selectedData)
        grid.onAddNewRow.subscribe(function (e, args) {
          var item = args.item;
          item.id =1;
          grid.invalidateRow(data.length);
          dataView.addItem(item);
          grid.updateRowCount();
          grid.render();
          // ids.push(grid.getDataItem(i).id);
          selectedData.push((item));


        });

    //end
        
  },
  render: function(frm){
        var me=this;
        // msgprint(frm.doc.customer)
      //   function requiredFieldValidator(value) {
      //   if (value == null || value == undefined || !value.length) {
      //     return {valid: false, msg: "This is a required field"};
      //   } else {
      //     return {valid: true, msg: null};
      //   }
      // }

      // var grid;
      // var columns = [
      //   {id: "sel", name: "#", field: "num", cssClass: "cell-selection", width: 40, resizable: false, selectable: false, focusable: false },
      //   {id: "industry", name: "Skill 18", field: "industry", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator},
      //   {id: "none_field", name: "None Field", field: "none_field",editor: Slick.Editors.Text,},
      //   {id: "beginner", name: "Beginner", field: "beginner",editor: Slick.Editors.Text},
      //   {id: "imtermediatory", name: "Imtermediatory", field: "imtermediatory", minWidth: 60, editor: Slick.Editors.Date},
      //   {id: "expert", name: "Expert", field: "expert", minWidth: 60, editor: Slick.Editors.Date}
      //   ];
      // var columnFilters = {};
      // var options = {
      //   showHeaderRow: true,
      //   headerRowHeight: 30,
      //   editable: true,
      //   enableAddRow: true,
      //   asyncEditorLoading: false,
      //   enableCellNavigation: true,
      //   enableColumnReorder: false,
      //   explicitInitialization: true,
      //   editable: true,
      // };
          cur_frm.events.prepare_data();

          // this.prepare_data();
      //   var data = [];

      //  frappe.call({
      //   method: "mycfokpi.mykpi.doctype.skill_mapping.skill_mapping.get_sample_data",
      //   freeze: true,
      //   type: "GET",
      //   args: {
      //     args:{

      //     }
      //   },
      //   callback: function(r){
      //     // msgprint(r.message)
      //     if(r.message){
      //       me.data = r.message;
      //       // me.make_grid(r.message,columns,options)
      //       // me.waiting.toggle(false);

      //     }
      //   }
      // });
// msgprint(data);
},
       //  for (var i = 0; i<data1.get_sample_data.length; i++) {
       //    msgprint(data1.get_sample_data[i][0])
       //    data[i] = {
       //      id: i,
       // industry: data1.get_sample_data[i][1]
       //    };
       //  }

        // for (var i = 0; i < 100; i++) {
        //   data[i] = {
        //     id: i,
        //     num: i+1,
        //     industry: "Industry " + i,
        //     none_field: i,
        //     beginner: i,
        //     imtermediatory: i,
        //     expert: i
        //   };
        // }
    //       var columnFilters = {};
    //           dataView = new Slick.Data.DataView();
    //           //call to create grid report
    //         grid = new Slick.Grid("#myGrid", dataView, columns, options);

    // //Start filter in slick grid
    //         function filter(item) {
    //         // Regex pattern to validate numbers
    //         var patRegex_no = /^[$]?[-+]?[0-9.,]*[$%]?$/; // a number negative/positive with decimals with/without $, %

    //         for (var columnId in columnFilters) {
    //             if (columnId !== undefined && columnFilters[columnId] !== "") {
    //                 var c = grid.getColumns()[grid.getColumnIndex(columnId)];
    //                 var filterVal = columnFilters[columnId].toString().toLowerCase();
    //                 var filterChar1 = filterVal.substring(0, 1); // grab the 1st Char of the filter field, so we could detect if it's a condition or not

    //                 if(item[c.field] == null)
    //                     return false;

    //                 // First let see if the user supplied a condition (<, <=, >, >=, !=, <>, =, ==)
    //                 // Substring on the 1st Char is enough to find out if it's a condition or not
    //                 // if a condition is supplied, we might have to transform the values (row values & filter value) before comparing
    //                 // for a String (we'll do a regular indexOf), for a number (parse to float then compare), for a date (create a Date Object then compare)
    //                 if( filterChar1 == '<' || filterChar1 == '>' || filterChar1 == '!' || filterChar1 == '=') {
    //                     // We found a Condition filter, find the white space index position of the condition substring (should be index 1 or 2)
    //                     var idxFilterSpace = filterVal.indexOf(" ");

    //                     if( idxFilterSpace > 0 ) {
    //                         // Split the condition & value of the full filter String
    //                         var condition = filterVal.substring(0, idxFilterSpace);
    //                         filterNoCondVal = columnFilters[columnId].substring(idxFilterSpace+1);

    //                         // Which type are the row values? We'll convert to proper format before applying the condition
    //                         // Then apply the condition comparison: String (we'll do a regular indexOf), number (parse to float then compare)
    //                         if( patRegex_no.test(item[c.field]) ) {                             
    //                             if( testCondition(condition, parseFloat(item[c.field]), parseFloat(filterNoCondVal)) == false ) 
    //                                 return false;
    //                         // whatever is remain will be tested as a regular String format     
    //                         }else {                             
    //                             if ( testCondition(condition, item[c.field].toString().toLowerCase(), filterNoCondVal.toString().toLowerCase()) == false )
    //                                 return false;
    //                         }
    //                     } 
    //                 }else{
    //                     if (item[c.field].toString().toLowerCase().indexOf(columnFilters[columnId].toString().toLowerCase()) == -1)
    //                         return false;
    //                 }
    //             }
    //         }
    //         return true;
    //     }
    // //end of filter
    //     dataView.onRowCountChanged.subscribe(function (e, args) {
    //       grid.updateRowCount();
    //       grid.render();
    //     });
    //     dataView.onRowsChanged.subscribe(function (e, args) {
    //       grid.invalidateRows(args.rows);
    //       grid.render();
    //     });
    //     $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
    //       var columnId = $(this).data("columnId");
    //       if (columnId != null) {
    //         columnFilters[columnId] = $.trim($(this).val());
    //         dataView.refresh();
    //       }
    //     });
    //     grid.onHeaderRowCellRendered.subscribe(function(e, args) {
    //         $(args.node).empty();
    //         $("<input type='text'>")
    //            .data("columnId", args.column.id)
    //            .val(columnFilters[args.column.id])
    //            .appendTo(args.node);
    //     });
    //     grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
    //     grid.init();
    //     dataView.beginUpdate();
    //     dataView.setItems(data);
    //     dataView.setFilter(filter);
    //     dataView.endUpdate();
    //     msgprint(grid.getDataLength())

    //     // me.grid_data = dataView.getItems()
    //     // msgprint(me.grid_data)
    //     var ids = [];
    //     for (var i=0; i<grid.getDataLength() ; i++) {
    //       // ids.push(grid.getDataItem(i).id);
    //       ids.push(grid.getDataItem(i));
    //     }
    //     me.selectedData = ids;

    //     grid.onAddNewRow.subscribe(function (e, args) {
    //       var item = args.item;
    //       item.id =1;
    //       grid.invalidateRow(data.length);
    //       dataView.addItem(item);
    //       grid.updateRowCount();
    //       grid.render();
    //       // ids.push(grid.getDataItem(i).id);
    //       me.selectedData.push((item));

    //     });
  // }, //end of render

  // get_columns:function(doc){
  //   var columns = [];
  //   if (doc.item_groups){
  //     columns = [
  //      {id: "0", name: "Sr", field: "0",width:40, sortable: true},
  //      {id: "1", name: "Quote Item", field: "1",width:100, sortable: true},
  //      {id: "2", name: "Brand", field: "2",width:80, sortable: true},
  //      {id: "3", name: "Performance", field: "3",width:120, sortable: true},
  //      {id: "4", name: "Previously Ordered", field: "4",width:70, sortable: true},
  //      {id: "5", name: "Batch", field: "5",width:80, sortable: true},
  //      {id: "6", name: "Rate", field: "6",width:100, sortable: true},
  //      {id: "7", name: "Actual Qty", field: "7",width:100, sortable: true}
  //     ]
  //   }
  //   else {
  //     columns = [
  //      {id: "0", name: "Sr", field: "0",width:40, sortable: true},
  //      {id: "1", name: "Quote Item", field: "1",width:100, sortable: true},
  //      {id: "2", name: "Brand", field: "2",width:80, sortable: true},
  //      {id: "3", name: "Item Group", field: "3",width:120, sortable: true},
  //      {id: "4", name: "Previously Ordered", field: "4",width:70, sortable: true},
  //      {id: "5", name: "Batch", field: "5",width:80, sortable: true},
  //      {id: "6", name: "Rate", field: "6",width:100, sortable: true},
  //      {id: "7", name: "Actual Qty", field: "7",width:100, sortable: true}
  //     ]
  //   }
  //   return columns
  // },
  save_record: function(frm) {
    var me=this;
    // msgprint(me.selectedData.length)
    // msgprint("first save")
    // msgprint(selectedData);
    cur_frm.events.update_skill_mapping_details(cur_frm,selectedData)
    // msgprint(me.grid_data);

  },
  update_skill_mapping_details: function(frm, data) {
    me = this;
    // me.frm = frm
    // msgprint(data)
    // msgprint("Testtttt: hi from update_skill_mapping_details")
    // msgprint(data)

    // aa = cur_frm.add_child("skill_mapping_details");
    // aa.industry = "sam";
    // refresh_field("skill_mapping_details");

      // frappe.call({
      //     method: "erp_customization.erp_customization.doctype.skill_map.skill_map.update_skill_details",
      //      args: {
      //       "data": data
      //       // "standards": c.standards,
      //       // "selectedData":selectedData
      //      }, 
      //     callback: function(r) {
      //         // location.reload();   
      //              }
      //   });

var args={
  'doc': frm.doc,
  'data': data
}
console.log(args)
  get_server_fields('update_skill_mapping_details', args, '', frm.doc,'','',1, function(r){
    frm.refresh()
  })
  // return frappe.call({  
  //     method: "update_skill_mapping_details",
  //     doc: args,
  //     callback: function(r, rt){
  //       frm.refresh()
  //     }
  //   });
  },

})

