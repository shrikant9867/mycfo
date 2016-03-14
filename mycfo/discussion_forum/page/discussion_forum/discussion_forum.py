
from __future__ import unicode_literals
import frappe
from frappe.utils import cint
from frappe.website.render import resolve_path
from frappe import _
from frappe.website.render import clear_cache
from frappe.utils import today, cint, global_date_format, get_fullname, strip_html_tags,flt
from frappe.website.utils import find_first_image
from markdown2 import markdown
import datetime
import math
STANDARD_USERS = ("Guest", "Administrator")


no_cache = 1
no_sitemap = 1

@frappe.whitelist(allow_guest=True)
def get_data(category=None,user=None,assigned_to_me=None,page_no=0,limit=3):
	"""Returns processed HTML page for a standard listing."""
	conditions = []
	assign_condition = []
	todo_owner = ''
	if page_no:
		offset = (cint(page_no) * cint(limit))
	else:
		offset = 0	 
	#next_start = cint(limit_start) + cint(limit_page_length)
	if user:
		conditions.append('t1.post_by="%s"' % frappe.db.escape(user))

	if category:
		conditions.append('t1.blog_category="%s"' % frappe.db.escape(category))

	if assigned_to_me:
		assign_condition.append('left join `tabToDo`t3 on t1.name = t3.reference_name ')
		todo_owner = ' and t3.owner="%s" '% frappe.db.escape(frappe.session.user)	
		
	limit_query = " limit %(start)s offset %(page_len)s"%{"start": limit, "page_len":offset }
 
	query = """\
		select
			distinct t1.name,t1.title, t1.blog_category, t1.published_on,
				t1.published_on as creation,
				ifnull(t1.intro, t1.content) as content,
				t2.employee_name,t1.post_by,
				(select count(name) from `tabComment` where
					comment_doctype='Discussion Topic' and comment_docname=t1.name and comment_type="Comment") as comments
		from `tabDiscussion Topic` t1 left join 
		`tabEmployee` t2 
		on t1.post_by = t2.name
		{assign_condition} 
		where ifnull(t1.published,0)=1
		{condition} {to_do_and}
		order by published_on desc, name asc""".format(
			condition= (" and "  + " and ".join(conditions)) if conditions else "",
			to_do_and = todo_owner,
			assign_condition = (" and ".join(assign_condition)) if assign_condition else "",
		)
	
	posts = frappe.db.sql(query+ limit_query, as_dict=1)

	for post in posts:
		post.published = global_date_format(post.creation)
		post.content = strip_html_tags(post.content[:140])
		post.assigned = check_if_assigned(post)
		if not post.comments:
			post.comment_text = _('No comments yet')
		elif post.comments==1:
			post.comment_text = _('1 comment')
		else:
			post.comment_text = _('{0} comments').format(str(post.comments))

	total_records = get_total_topics(query)
	paginate = True if total_records > limit else False
	total_pages = math.ceil(total_records/flt(limit))
	return posts,total_pages,int(page_no)+1,paginate  if posts else {}

def check_if_assigned(post):
	assigned = frappe.db.get_value("ToDo",
		{"owner":frappe.session.user,"reference_type":"Discussion Topic","reference_name":post.name},"name")
	return 1 if assigned else 0


def get_total_topics(query):
	executable_query = frappe.db.sql(query, as_list=1)
	return len([topic for topic in executable_query if topic])	

# def get_total_topics(conditions):
# 	condition = (" and " + " and ".join(conditions)) if conditions else ""
# 	return frappe.db.sql("""select count(*) from `tabDiscussion Topic` as t1
# 		where ifnull(t1.published,0)=1 {0}""".format(condition),as_list=1)[0][0] or 0

@frappe.whitelist(allow_guest=True)
def get_post(topic_name):
	topic = frappe.get_doc("Discussion Topic",topic_name).as_dict()
	topic.update({
			"comment_list":get_comments(topic_name),
			"employee_name":frappe.db.get_value("Employee",topic.post_by,"employee_name")
		})
	return topic

@frappe.whitelist(allow_guest=True)
def get_comments(topic_name,page_no=0,is_sorted='false', limit=3):
	if is_sorted=="true":
		comment_list = get_sorted_comment_list("Discussion Topic",topic_name,page_no,limit)
	else:
		comment_list = get_comment_list("Discussion Topic",topic_name,page_no,limit)
	total_records = get_comment_count(topic_name)
	paginate = True if total_records > limit else False
	total_pages = math.ceil(total_records/flt(limit))
	page_no = int(page_no) + 1
	for comment in comment_list:
		ratings = get_rating_details(comment)
		comment["creation"] = comment.creation.strftime('%d-%m-%Y,%I:%M %p')
		comment.update({
			"average_rating":ratings.get("avg",0.0),
			"ratings":ratings.get("ratings",0),
			"user_rating":ratings.get("user_rating"),
			"no_of_users":ratings.get("number_of_users")
		})
	return comment_list,total_pages,page_no,paginate,is_sorted

@frappe.whitelist(allow_guest=True)
def sort_comments(topic_name,page_no=0,limit=3):
	comment_list = get_sorted_comment_list("Discussion Topic",topic_name,page_no,limit)
	total_records = get_comment_count(topic_name)
	paginate = True if total_records > limit else False
	total_pages = math.ceil(total_records/flt(limit))
	page_no = int(page_no) + 1
	for comment in comment_list:
		ratings = get_rating_details(comment)
		comment["creation"] = comment.creation.strftime('%d-%m-%Y,%I:%M %p')
		comment.update({
			"average_rating":ratings.get("avg",0.0),
			"ratings":ratings.get("ratings",0),
			"user_rating":ratings.get("user_rating"),
			"no_of_users":ratings.get("number_of_users")
		})
	comment_list.sort(key=lambda x: x['average_rating'],reverse=True)
	return comment_list,total_pages,page_no,paginate

def get_comment_count(topic_name):
	return frappe.get_list("Comment",fields=["count(*)"],
		filters={"comment_type":"Comment","comment_docname":topic_name},as_list=1,ignore_permissions=1)[0][0] or 0


def get_sorted_comment_list(doctype, name,page_no,limit):
	if page_no:
		offset = (cint(page_no) * cint(limit))
	else:
		offset = 0
	return frappe.db.sql("""select
		name,comment, comment_by_fullname, creation, comment_by, name as cname,
		CASE WHEN 5!=6 then (select avg(ratings) from `tabTopic Ratings` where comment=cname)
		ELSE " "
		END AS ratings
		from `tabComment` where comment_doctype=%s
		and ifnull(comment_type, "Comment")="Comment"
		and comment_docname=%s order by ratings desc limit %s offset %s""",(doctype,name,limit,offset), as_dict=1) or []

def get_comment_list(doctype, name,page_no,limit):
	if page_no:
		offset = (cint(page_no) * cint(limit))
	else:
		offset = 0
	return frappe.db.sql("""select
		name,comment, comment_by_fullname, creation, comment_by
		from `tabComment` where comment_doctype=%s
		and ifnull(comment_type, "Comment")="Comment"
		and comment_docname=%s order by creation desc limit %s offset %s""",(doctype,name,limit,offset), as_dict=1) or []


def get_rating_details(comment):
	ratings = {}
	if comment.get("name"):
		comment = comment.get("name")
		ratings["avg"] = round(frappe.get_list("Topic Ratings", fields=["ifnull(avg(ratings),0.0)"], 
					filters={ "comment":comment}, as_list=True)[0][0],2)
		ratings["ratings"] = frappe.db.sql("""select count(*) from 
			`tabTopic Ratings` where comment='{0}'""".format(comment),as_list=1)[0][0]
		ratings["user_rating"] = frappe.db.get_value("Topic Ratings",{"comment":comment,"user":frappe.session.user},"ratings")
		ratings['number_of_users'] = frappe.db.sql("""select count(distinct user) from `tabTopic Ratings` where comment = '{0}'""".format(comment),as_list=1)[0][0]
	return ratings	


@frappe.whitelist(allow_guest=True)
def add_comment(comment,topic_name):
	import datetime
	frappe.get_doc({
		"doctype":"Comment",
		"comment_by": frappe.session.user,
		"comment_doctype":"Discussion Topic",
		"comment_docname": topic_name,
		"comment": comment,
		"comment_type":"Comment"
	}).insert(ignore_permissions=True)

@frappe.whitelist(allow_guest=True)
def add_rating(rating,comment,topic_name):
	comment_doc = frappe.get_doc("Comment",comment)
	if(comment_doc.comment_by==frappe.session.user):
		frappe.throw("You can not rate your own comments")
	import datetime
	frappe.get_doc({
		"doctype":"Topic Ratings",
		"user": frappe.session.user,
		"comment":comment,
		"ratings":flt(rating,1)
	}).insert(ignore_permissions=True)
	ratings = get_rating_details({"name":comment})
	comments = {}
	comments.update({
		"average_rating":ratings.get("avg",0.0),
		"ratings":ratings.get("ratings",0),
		"user_rating":ratings.get("user_rating")
	})
	return comments
	
@frappe.whitelist()
def assign_topic(args=None):
	"""add in someone's to do list
		args = {
			"assign_to": ,
			"doctype": ,
			"name": ,
			"description":
		}

	"""
	if not args:
		args = frappe.local.form_dict

	from frappe.utils import nowdate
	emp_list = eval(args['assign_to'])
	for employee in emp_list:
		d = frappe.get_doc({
			"doctype":"ToDo",
			"owner": employee,
			"reference_type": args['doctype'],
			"reference_name": args['name'],
			"description": args.get('description'),
			"priority": args.get("priority", "Medium"),
			"status": "Open",
			"date": args.get('date', nowdate()),
			"assigned_by": frappe.session.user,
		}).insert(ignore_permissions=True)

	# set assigned_to if field exists
	if frappe.get_meta(args['doctype']).get_field("assigned_to"):
		for employee in emp_list:
			frappe.db.set_value(args['doctype'], args['name'], "assigned_to", employee)

	# notify
	if not args.get("no_notification"):
		from frappe.desk.form.assign_to import notify_assignment
		notify_assignment(d.assigned_by, d.owner, d.reference_type, d.reference_name, action='ASSIGN', description=args.get("description"), notify=1)

	return

# def user_query(doctype, txt, searchfield, start, page_len, filters):
# 	from frappe.desk.reportview import get_match_cond
# 	txt = "%{}%".format(txt)
# 	return frappe.db.sql("""select name, concat_ws(' ', first_name, middle_name, last_name)
# 		from `tabUser`
# 		where ifnull(enabled, 0)=1
# 			and docstatus < 2
# 			and name not in ({standard_users})
# 			and user_type != 'Website User'
# 			and name in (select parent from `tabUserRole` where role='Employee')
# 			and ({key} like %s
# 				or concat_ws(' ', first_name, middle_name, last_name) like %s)
# 			{mcond}
# 		order by
# 			case when name like %s then 0 else 1 end,
# 			case when concat_ws(' ', first_name, middle_name, last_name) like %s
# 				then 0 else 1 end,
# 			name asc
# 		limit %s, %s""".format(standard_users=", ".join(["%s"]*len(STANDARD_USERS)),
# 			key=searchfield, mcond=get_match_cond(doctype)),
# 			tuple(list(STANDARD_USERS) + [txt, txt, txt, txt, start, page_len]))


def users_query(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql("""select usr.name, usr.first_name 
								from `tabUser` usr
								where usr.name != '{0}' 
								and usr.name != '{1}'
								and usr.name not in ( select owner from `tabToDo` 
														where  reference_type= "Discussion Topic" and reference_name= "{2}" and status="Open") 
								and (usr.name like '{txt}'
											or usr.first_name like '{txt}' )
									limit 20
								""".format(filters['doc'],frappe.session.user,filters['doc_name'],txt= "%%%s%%" % txt),as_list=1)


@frappe.whitelist(allow_guest=True)
def get_categories():
	return frappe.get_list("Discussion Category", fields=["name","title"],ignore_permissions=1)







