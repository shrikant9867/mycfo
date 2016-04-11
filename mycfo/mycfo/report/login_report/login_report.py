# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_columns()
	data = get_data(filters)
	return columns, data



def get_data(filters):
	format = "%H:%i"
	return frappe.db.sql(""" select lo.user, count(lo.name), usr.last_login,  
							TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(timediff(lo.log_out_time, lo.login_time)  ))), %(format)s  ) as avg_duration 
							from `tabLogin Log` lo
							left join `tabUser` usr
							on lo.user = usr.name 
							where  ( lo.login_time between %(start_time)s and %(end_time)s )
							or ( lo.log_out_time between %(start_time)s and %(end_time)s )
							group by lo.user  """, {"start_time":filters.get("start_time"), 
							"end_time":filters.get("end_time"), "format":format}, as_list = 1)

def get_columns():
	return [
		_("User") + ":Link/User:200",
		_("Logged In Count") + ":Int:150",
		_("Last Login") + ":Datetime:180",
		_("Average Duration (HH:MM)") + ":Data:200"		
	] 