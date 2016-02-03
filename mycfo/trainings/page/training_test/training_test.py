from __future__ import unicode_literals
import frappe
from frappe.utils import flt, cstr, cint, time_diff_in_hours, now, time_diff, add_days, formatdate
from frappe import _
import json
import math
import re


@frappe.whitelist()
def get_question_list(ans_sheet):
	qtn_list = frappe.get_all("Assessment Answers", filters={"parent":ans_sheet}, order_by="name asc", fields= "*")
	qtn_dict = format_question_list(qtn_list)
	last_attempted_qtn, ans_sheet_status = frappe.db.get_value("Answer Sheet", {"name":ans_sheet}, ["last_attempted_question", "answer_sheet_status"])
	last_attempted_qtn = last_attempted_qtn if last_attempted_qtn else qtn_list[0].get("name") 
	qtn_count = len(qtn_list)
	qtn_keys = [ qtn.get("name") for qtn in qtn_list]
	return {"question_dict":qtn_dict, "questions_count":qtn_count, 
			"last_qtn":last_attempted_qtn, "qtn_keys":qtn_keys, "ans_sheet_status":ans_sheet_status }


def format_question_list(qtn_list):
	qtn_dict = {}
	for qtn in qtn_list:
		qtn_dict[qtn.get("name")] = qtn
	return qtn_dict

@frappe.whitelist()
def update_user_answer(request_data):
	request_data = json.loads(request_data)
	request_data["user_answer"] = request_data.get("user_answer") if request_data.get("user_answer") else ""
	mapper = {"Objective":"user_answer = '{0}' ".format(request_data.get("user_answer")), "Subjective":"user_subjective_answer = '{0}' ".format(request_data.get("user_answer"))}
	frappe.db.sql(""" update `tabAssessment Answers` 
						set {col_nm}, visited_flag = 1 
						where name = '{row_id}'  """.format(col_nm = mapper.get(request_data.get("qtn_type")), 
						row_id = request_data.get("qtn_id")) ,debug=1)
	frappe.db.sql(""" update `tabAnswer Sheet` 
						set last_attempted_question = %(qtn)s where name = %(ans_sheet)s """,
						{"qtn":request_data.get("new_qtn_id"), "ans_sheet":request_data.get("ans_sheet")}, debug=1)