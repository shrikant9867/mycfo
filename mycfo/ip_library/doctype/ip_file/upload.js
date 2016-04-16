
upload = {
	make: function(opts) {

		if(!opts.args) opts.args = {};
		var $upload = $(frappe.render_template("upload", {opts:opts})).appendTo(opts.parent);
		var $file_input = $upload.find(".input-upload-file");

		// bind pseudo browse button
		$upload.find(".btn-browse").on("click",
			function() { $file_input.click(); });

		$file_input.on("change", function() {
			if (this.files.length > 0) {
				var $uploaded_file_display = $(repl('<div class="btn-group" role="group">\
					<button type="button" class="btn btn-default btn-sm \
						text-ellipsis uploaded-filename-display">%(filename)s\
					</button>\
					<button type="button" class="btn btn-default btn-sm uploaded-file-remove">\
						&times;</button>\
				</div>', {filename: this.files[0].name}))
				.appendTo($upload.find(".uploaded-filename").removeClass("hidden").empty());

				$uploaded_file_display.find(".uploaded-filename-display").on("click", function() {
					$file_input.click();
				});

				$uploaded_file_display.find(".uploaded-file-remove").on("click", function() {
					$file_input.val("");
					$file_input.trigger("change");
					$('.my_file').remove()

				});
				
				var fileobj = $upload.find(":file").get(0).files[0];
				var freader = new FileReader();
				file_data = {}
				freader.onload = function() {
					$("<p></p>",{
	 					class : "my_file",
	 					src : freader.result,
	 					title : fileobj.name
	 				}).insertAfter(".file-upload");
	 			};
	 			freader.readAsDataURL(fileobj);

				

			} else {
				$upload.find(".uploaded-filename").addClass("hidden")
			}
		});


		if(!opts.btn) {
			opts.btn = $('<button class="btn btn-default btn-sm">' + __("Attach")
				+ '</div>').appendTo($upload);
		} else {
			$(opts.btn).unbind("click");
		}

		// get the first file
		opts.btn.click(function() {
			// convert functions to values

			if(opts.get_params) {
				opts.args.params = opts.get_params();
			}

			opts.args.file_url = $upload.find('[name="file_url"]').val();

			var fileobj = $upload.find(":file").get(0).files[0];
			upload.upload_file(fileobj, opts.args, opts);
		});
	},
	check_extension:function(filename){
		return (/\.(gif|jpg|jpeg|tiff|png|svg|doc|docx|xlsx|xls|ppt|pptx|pdf|txt|csv|zip|xlsm)$/i).test(filename);
	},
	upload_file: function(fileobj, args, opts) {
		if(!fileobj && !args.file_url) {
			console.log("just code")
			msgprint(__("Please attach a file."));
			return;
		}
		else if (! (upload.check_extension(fileobj.name))){
			console.log("extension check")
			msgprint(__("File with extension gif, jpg, jpeg, tiff, png, svg, doc, docx, xlsx, xls, ppt, \
				pptx, pdf, txt, odt, odp, odf & csv are allowed in IP Library "))
			return;
		}
		var me = this
		this.file_dict = {} 
		$.each($(cur_dialog.body).find(".my_file"), function(index, data){
			
			console.log(data.src)
			me.file_dict["file_data"] = $(data).attr("src")
			me.file_dict["file_ext"] = $(data).attr("src").split(",")[0].split(":")[1].split(";")[0].split("/")[1];
			me.file_dict["file_name"] = $(data).attr("title")
			 		
		})
		// console.log(file_data)
		attobj = opts.callback(this.file_dict);
	}
}