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

frappe.require("assets/mycfo/js/slick/plugins/slick.checkboxselectcolumn.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.rowselectionmodel.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.autotooltips.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.cellcopymanager.js");
// frappe.require("assets/mycfo/js/slick/plugins/slick.cellexternalcopymanager.js");
frappe.require("assets/mycfo/js/slick/plugins/slick.rowselectionmodel.js");




var selected_grid_data;
var grid_data;
var selectedData;

frappe.ui.form.on("Customer Skill Mapping", {
    refresh:function(frm){
      if(!frm.doc.__islocal){
        cur_frm.events.render();
      }
    },
    render: function(frm){
      var me=this;
      cur_frm.events.prepare_data();
    },
    save_record: function(frm) {
      var me=this;
      cur_frm.events.update_skill_mapping_details(cur_frm, selectedData)
    },
    prepare_data: function() {
      var me = this;
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
        {id: "industry", name: "Skills", field: "industry", width: 330, cssClass: "cell-title"},
        {id: "none_field", name: "None", field: "none_field",width: 120,editor: Slick.Editors.Checkbox, formatter:init_checkbox_formatter},
        {id: "beginner", name: "Beginner", field: "beginner",width: 120, editor: Slick.Editors.Checkbox, formatter:init_checkbox_formatter},
        {id: "imtermediatory", name: "Imtermediatory", field: "imtermediatory",width: 150, minWidth: 60, editor: Slick.Editors.Checkbox, formatter:init_checkbox_formatter},
        {id: "expert", name: "Expert", field: "expert", minWidth: 60, width: 120,editor: Slick.Editors.Checkbox, formatter:init_checkbox_formatter}
      );



      function init_checkbox_formatter(row, cell, value, columnDef, dataContext){
         return value ? '<input  type="checkbox" data-name="checkbox" row-number='+ row +' class="editor-checkbox slick-checkbox checkbox_' + row + '" checked/>': "";
      }

      var columnFilters = {};
      var grid;
      var data=[];

      if(cur_frm.doc.skill_mapping_details.length){
           frappe.call({
            method: "mycfo.mycfo.doctype.customer_skill_mapping.customer_skill_mapping.get_sample_data_from_table",
            type: "GET",
            args: {
              "doc_name": cur_frm.doc.name
            },
            callback: function(r){
              if(r.message){
                me.data = r.message;
                me.make_grid(r.message,columns,options)
              }
            }
          });
      }

  },
  make_grid:function(data1, columns, options){
        //start
      var me=this;
      var grid;
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
        

        me.grid_data = dataView.getItems()

        selectedData = dataView.getItems();
        grid.onAddNewRow.subscribe(function (e, args) {
          var item = args.item;
          item.id =1;
          grid.invalidateRow(data.length);
          dataView.addItem(item);
          grid.updateRowCount();
          grid.render();
          selectedData.push((item));
        });
         init_for_checkbox_trigger(grid , dataView)
    //end
        
  },
  update_skill_mapping_details: function(frm, data) {
    me = this;
    var args={
      'doc': frm.doc,
      'data': data
    }
      get_server_fields('update_skill_mapping_details', args, '', frm.doc,'','',1, function(r){
        frm.refresh()
      })
  },

})



init_for_checkbox_trigger = function(grid, dataview){

  var criteria_list = ["none_field", "beginner", "imtermediatory", "expert"]
  $("#myGrid").on("change", $("[data-name=checkbox]"), function(event){
    
      this.mapper = {2:"none_field", 3:"beginner", 4:"imtermediatory", 5:"expert"}
      var active_cell = grid.getActiveCell()
      var data = dataview.getItems();
      var current_row_data = grid.getDataItem(active_cell.row)
      var master_skill = current_row_data.master_industry 
      var sub_skill = current_row_data.industry
      var field = this.mapper[active_cell.cell]
      var field_value = $(event.target).prop("checked") ? 1 :0
      var new_dict = {}
      new_dict[field] = field_value
      delete this.mapper[active_cell.cell]
      get_updated_dict(this.mapper, new_dict)
      $.extend(current_row_data, new_dict) 
      data[current_row_data.id] = current_row_data
      grid.updateRow(active_cell.row)

  })
}


get_data_index = function(element, master_skill, sub_skill){
  if (element.master_industry == master_skill  && element.industry == sub_skill){
     return element
  }
}

get_updated_dict = function(mapper, new_dict){
  $.each(mapper, function(key, value){
     new_dict[value] = 0
  })
}