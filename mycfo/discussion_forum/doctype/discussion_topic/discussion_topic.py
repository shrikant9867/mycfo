# -*- coding: utf-8 -*-
# Copyright (c) 2015, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from datetime import datetime, timedelta
from frappe.model.document import Document

class DiscussionTopic(Document):
	pass

def mail_topic_list():
	template = "/templates/discussion_topics.html"	
	send_mail(template)

def send_mail(template):
	subject = "Discussion Topic Notification"
	now = datetime.now()
	past = now - timedelta(days=1)
	previous_day_topic = frappe.db.sql("""select t1.title,
										(select employee_name from `tabEmployee` where name = t1.post_by) 
										as post_by  
										from `tabDiscussion Topic`t1 
										where t1.creation > '{1}' 
										and t1.creation < '{0}' """
										.format(now,past),as_dict=1)
 	
 	unanswer_topic = frappe.db.sql("""select t1.title,
 									(select employee_name from `tabEmployee` where name = t1.post_by) 
									as post_by 
 									from `tabDiscussion Topic` t1 
 	 								left join `tabComment` com 
 	 								on t1.name = com.comment_docname 
 	 								and com.comment_type = "Comment" 
 	 								and com.comment_doctype = "Discussion Topic"
 	 								group by t1.title 
 	 								having count(com.name) < 1  
 									""",as_dict=1)

 	email = frappe.db.sql("""select email from `tabUser`""",as_list=1)
 	list_email = [e[0] for e in email]
	args = {"p_day_topic":previous_day_topic if previous_day_topic else "","unans":unanswer_topic if unanswer_topic else ""}
	frappe.sendmail(recipients= list_email, sender=None, subject=subject,
		message=frappe.get_template(template).render(args))	