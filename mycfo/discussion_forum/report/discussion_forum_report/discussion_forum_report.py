# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _


def execute(filters=None):
	columns, data = [], []
	columns = get_columns(filters)
	data = get_data(filters)
	return columns, data


def get_columns(filters):
	if filters.get("report_type") == "Discussion Topic Report":
		return [
			_("Topic Posted By  (User)") + ":Link/User:200",
			_("Topic Name") + ":Data:250",
			_("Discussion Category") + ":Link/Discussion Category:180",
			_("Posted Datetime") + ":Datetime:200"		
		] 
	else:
		return [
			_("Topic Commentar (User)") + ":Link/User:200",
			_("Topic Name") + ":Data:250",
			_("Comment Count") + ":Int:150"
		]


def get_data(filters):
	if filters.get("report_type") == "Discussion Topic Report": 
		return frappe.db.sql(""" select owner,title,blog_category, creation 
							from `tabDiscussion Topic`  
							where creation between %(start_time)s and %(end_time)s """, 
							{"start_time":filters.get("start_time"), "end_time":filters.get("end_time")}, as_list=1)
	else:
		return frappe.db.sql(""" select com.comment_by, topic.title , count(com.name) from 
								`tabComment` com
								join `tabDiscussion Topic` topic
								on com.comment_docname = topic.name
								where com.comment_doctype = "Discussion Topic" and com.comment_type = "Comment"
								and com.creation between %(start_time)s and %(end_time)s 
								group by com.comment_by, com.comment_docname """,
								{"start_time":filters.get("start_time"), "end_time":filters.get("end_time")}, as_list=1)	


