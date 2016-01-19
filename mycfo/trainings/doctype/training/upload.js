
upload = Class.extend({
	init:function(opts){
		this.wrapper = opts.parent;
		this.$upload = $(frappe.render_template("upload", {opts:opts})).appendTo(opts.parent);
		this.$file_input = this.$upload.find(".input-upload-file");
		this.opts = opts;
		this.init_for_mul_file_upload();
	},
	init_for_mul_file_upload: function() {
		var me = this;
		this.$upload.find(".btn-browse").on("click", function() { 
			me.$file_input.click(); 
		});
		this.init_for_file_browse();
		this.init_for_attach_button();
	},
	init_for_file_browse :function(){
		var outer_me = this;
		this.$file_input.on("change", function() {
			if (this.files.length > 0) {
				var me = this;
				var file_length = this.files.length
				$.each(this.files, function(index, file_data){
					var fileobj = me.files[index];
					var freader = new FileReader();
					
					freader.onload = function() {
						console.log(index)
						args = { "file_name":fileobj.name, "file_src":freader.result }
						$(frappe.render_template("upload_file", args)).appendTo($(outer_me.wrapper).find(".uploaded-filename"));
		 				if( file_length == index + 1){
		 					outer_me.init_for_file_remove();
		 				}
		 			};
		 			freader.readAsDataURL(fileobj);	

				})				
				
			}
		});

	},
	init_for_file_remove:function(){
		$(this.wrapper).find(".uploaded-file-remove").click(function() {
			console.log("remove")
			$(this).closest(".file-row").remove()
		});
	},
	init_for_attach_button:function(opts){
		var me = this;
		$(this.opts.btn).unbind("click");
		$(this.opts.btn).click(function() {
			console.log("in attach")
			me.upload_file()
		});
	},
	check_extension:function(filename){
		return (/\.(gif|jpg|jpeg|tiff|png|svg|doc|docx|xlsx|xls|ppt|pptx|pdf|txt|csv)$/i).test(filename);
	},
	upload_file: function() {
		var me = this;
 		var file_list = [];
 		var file_names = [];		
		if( ! $(this.wrapper).find(".uploaded-filename").children().length) {
			msgprint(__("Please attach a file or set a URL"));
			return;
		}

		$.each($(cur_dialog.body).find(".uploaded-filename-display"), function(index, data){
			this.file_dict = {}			
			console.log(data.src)
			this.file_dict["file_data"] = $(data).attr("file-src")
			this.file_dict["file_ext"] = $(data).attr("file-src").split(",")[0].split(":")[1].split(";")[0].split("/")[1];
			this.file_dict["file_name"] = $(data).attr("title")
			file_list.push(this.file_dict)
			file_names.push($(data).attr("title")) 		
		})
		console.log(file_list)
		attobj = this.opts.callback({"file_list":JSON.stringify(file_list), "file_names":file_names});
	}
})