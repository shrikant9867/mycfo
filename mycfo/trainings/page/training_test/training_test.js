frappe.pages['training-test'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Online Training Test',
		single_column: true
	});
	frappe.breadcrumbs.add("Trainings");
	$("<div class='online-test-page'</div>").appendTo(page.body);
	new OnlineTest(wrapper, page)
}


frappe.pages['training-test'].refresh = function(wrapper) {
	// wrapper.user_permissions.set_from_route();
}



OnlineTest = Class.extend({
	init:function(wrapper, page){
		this.wrapper = wrapper;
		this.page = page;
		this.body = $(page.body).find(".online-test-page");
		this.footer = $("<div class='online-test-footer'</div>").insertAfter(this.body);
		this.get_questions("AS0000000006");
	},
	render_instructions_page:function(test_data){
		$(this.body).html(frappe.render_template("test_instructions"));
		this.init_for_start_test_trigger(test_data);
	},
	init_for_start_test_trigger:function(test_data){
		var me = this;
		$(this.body).find(".start-test").click(function(){
			$(me.page.body).css("border", "")
			me.init_for_refresh_page(test_data, "AS0000000006")
			
		})
	},
	get_questions:function(ans_sheet){
		var me = this;
		frappe.call({
			module:"mycfo.trainings",
			page: "training_test",
			method: "get_question_list",
			args:{"ans_sheet": ans_sheet },
			callback:function(r){
				console.log(r.message)
				if(r.message.ans_sheet_status == "New"){
					me.render_instructions_page(r.message)
				}else{
					me.init_for_refresh_page(r.message, ans_sheet)
				}
			
			}
		})
	},
	init_for_refresh_page:function(test_data, ans_sheet){
		this.refresh_online_test_page(test_data, ans_sheet);	
		this.refresh_question_list(test_data.qtn_keys);
	},
	refresh_online_test_page:function(test_data, ans_sheet){
		this.ans_sheet = ans_sheet;
		this.question_dict = test_data.question_dict;
		this.current_question = test_data.last_qtn;
		this.qtn_keys = test_data.qtn_keys;
		this.question_index = test_data.qtn_keys.indexOf(test_data.last_qtn) + 1;
		this.questions_count = test_data.questions_count;
		this.instruction_page_flag = test_data.ans_sheet_status; 
	},
	refresh_questions:function(){
		console.log(["in refresh questions", this.question_dict])	
		$(this.body).find(".question-div").html(frappe.render_template("online_test", {"question_dict":this.question_dict[this.current_question], "qtn_count":this.questions_count, "qtn_index":this.question_index} ));
	},
	refresh_question_list:function(qtn_keys){
		$(this.body).html(frappe.render_template("question_list", {"qtn_dict":this.question_dict, "qtn_keys":qtn_keys} ));
		this.refresh_questions();
		this.init_for_next_previous_button();
	},
	init_for_next_previous_button:function(){
		this.init_for_next_button();
		this.init_for_prev_button();
		this.init_for_end_test();
		this.init_for_question_toggle();
		this.init_for_radio_button();
		this.init_for_subjective_text_box();
	},
	init_for_next_button:function(){
		var me = this;
		$(this.body).find(".next-qt").click(function(){
			console.log("in next button")
			console.log([me.current_question, me.question_index])
			me.init_for_common_next_prev_behaviour(me.question_index + 1)
		})
	},
	init_for_prev_button:function(){
		var me = this;
		$(this.body).find(".prev-qtn").click(function(){
			console.log("in prev button")
			me.init_for_common_next_prev_behaviour(me.question_index - 1)
		})
	},
	init_for_common_next_prev_behaviour:function(new_qtn_index){
		var me = this;
		console.log(this)
		if($(me.body).find(".panel").attr("qtn-type") == "Objective" ){
			console.log($(me.body).find("input[name='radio']").is(":checked"))
			new_class = $(me.body).find("input[name='radio']").is(":checked") ? "qtn-div attempted-qtn" : "qtn-div skipped-qtn";				
		}
		else{
			console.log("in else")
			new_class = $(me.body).find(".subj-ans").val() ? "qtn-div attempted-qtn" : "qtn-div skipped-qtn";
		}
		me.toggle_colour_of_question(new_class);
		me.store_user_answer(new_qtn_index);	
		me.set_current_question_and_index(new_qtn_index);
	},
	init_for_end_test:function(){
		var me = this;
		$(this.body).find(".end-test").click(function(){
			console.log("in end test")
		})
	},
	store_user_answer:function(new_qtn_index){
		var me = this;
		var mapper = { "option_a":"A", "option_b":"B", "option_c":"C", "option_d":"D", "option_e":"E" }
		var qtn_type = $(me.body).find(".panel").attr("qtn-type");
		var qtn_id = $(me.body).find(".panel").attr("qtn-id");
		var new_qtn_id = this.qtn_keys[new_qtn_index - 1]
		if(qtn_type == "Objective" ){
			answer = $(me.body).find("input[name='radio']:checked").attr("option-nm");				
			this.question_dict[qtn_id].user_answer = answer
		}
		else{
			console.log("in else")
			answer = $(me.body).find(".subj-ans").val();
			this.question_dict[qtn_id].user_subjective_answer = answer 
		}
		this.update_user_answer_sheet(answer, qtn_type, qtn_id, new_qtn_id)

	},
	update_user_answer_sheet:function(user_answer, qtn_type, qtn_id, new_qtn_id){
		console.log(["In user_answer sheet", qtn_type, qtn_id, user_answer])
		var me = this;
		return frappe.call({
			module:"mycfo.trainings",
			page: "training_test",
			method: "update_user_answer",
			args:{"request_data": {"user_answer":user_answer, "qtn_type":qtn_type, "qtn_id":qtn_id, 
										"new_qtn_id":new_qtn_id, "ans_sheet":me.ans_sheet} },
			callback:function(r){
				console.log(r.message)
			
			}
		})
		
	},
	init_for_question_toggle:function(){
		var me = this;
		$(this.body).on("click", ".qtn-div", function(event){
			console.log("in page test")
			console.log($(this))
			console.log($(this).attr("id"))
			me.set_current_question_and_index(parseInt($(this).attr("index")))
		})
	},
	set_current_question_and_index:function(current_qtn){
		this.current_question = this.qtn_keys[current_qtn - 1];
		this.question_index = current_qtn;
		console.log([current_qtn, this.current_question, this.question_index])
		this.refresh_questions();
		
	},
	init_for_radio_button:function(){
		var me = this;
		$(this.body).on("click", ".custom-radio", function(event){
			console.log("custom_radio")
			console.log($(this))
			me.toggle_colour_of_question("qtn-div attempted-qtn")
		})
	},
	init_for_subjective_text_box:function(){
		var me = this;
		console.log("in subjective")
		$(this.body).on("keyup", ".subj-ans" ,function(event){
			console.log("subject ans")
			console.log($(this))
			if($(this).val()){
				me.toggle_colour_of_question("qtn-div attempted-qtn")	
			}else{
				me.toggle_colour_of_question("qtn-div skipped-qtn")	
			}
			
		})
	},
	toggle_colour_of_question:function(new_class){
		$question = $(this.body).find("#{0}".replace("{0}", this.current_question));
		console.log(["in toggle coour", $question])
		$question.removeClass($question.attr("class")).addClass(new_class)
	},





})