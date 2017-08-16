# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, HttpResponseServerError
from django.views import View
import os
import csv
import json
import time

class Schema(View):
	def get(self, request, *args, **kwargs):
		filePath = request.GET['data']
		print(filePath)
		data = {}
		fsock = open("data/"+filePath, "r")
		for entry in fsock:
			data = json.loads(entry)
			break
		schema = []
		for key in data:
			schema.append(key)
		return HttpResponse(json.dumps({"schema" : schema}), content_type='application/json')
		

class Data(View):
	def get(self, request, *args, **kwargs):
		filePath = request.GET['data']
		print(filePath)
		data = []
		fsock = open("data/"+filePath, "r")
		for entry in fsock:
			data.append(json.loads(entry))
		return HttpResponse(json.dumps({"rows" : data}), content_type='application/json')

class DataFile(View):
	def handle_uploaded_file(self, f, name):
		filePath = 'data//' + name + '.json'
		print(filePath)
		with open(filePath, 'w') as destination:
			for chunk in f.chunks():
				destination.write(chunk)

	def get(self, request, *args, **kwargs):
		os.system("ls data > logs/datafile")
		fsock = open("logs/datafile", "r")
		result = []
		for entry in fsock:
			result.append(entry.strip('\n'))
		file = json.dumps({"datafile": result},ensure_ascii=False)
		return HttpResponse(file, content_type='application/json')

	def post(self, request, *args, **kwargs):
		print("Received data of table ", request.POST['name'])
		self.handle_uploaded_file(request.FILES['file'], request.POST['name'])
		return HttpResponse('success')

class Index(View):
	def get(self, request, *args, **kwargs):
		return render(request, 'index.html')

class Rule(View):
	def get(self, request, *args, **kwargs):
		ruleFile = request.GET['rulefile']
		fsock = open("rule/"+ruleFile, "r")
		result = []
		for entry in fsock:
			p = entry.split(",")
			ru = {"id":p[0], "left":p[1], "right":p[2], "simFunc":p[3], "threshold":p[4].strip('\n')}
			result.append(ru)
		return HttpResponse(json.dumps({"rows": result}), content_type='application/json')

	def post(self, request, *args, **kwargs):
		ruleFile = request.POST['path']
		ruleSet = json.loads(request.POST["rules"])
		with open("rule/"+ruleFile, 'w') as destination:
			for rule in ruleSet:
				destination.write(rule['id']+","+rule['left']+","+rule['right']+","+rule['simFunc']+","+rule['threshold'] + "\n")
		return HttpResponse("success")

class Sql(View):
	def get(self, request, *args, **kwargs):
		sqlFile = request.GET['sqlfile']
		fsock = csv.reader(open('sql/'+sqlFile))
		result = []
		for entry in fsock:
			ru = {"id":entry[0], "leftSignature":entry[1], "rightSignature":entry[2], "sql":entry[3]}
			result.append(ru)
		return HttpResponse(json.dumps({"rows": result}), content_type='application/json')

	def post(self, request, *args, **kwargs):
		sqlFile = request.POST['path']
		sqlSet = json.loads(request.POST["sqls"])
		out = open("sql/"+sqlFile, 'w')
		csv_writer = csv.writer(out)
		for sql in sqlSet:
			csv_writer.writerow([sql['id'], sql['leftSignature'], sql['rightSignature'], sql['sql']])
		return HttpResponse("success")


class RuleFile(View):
	def handle_uploaded_file(self, f, name):
		filePath = 'rule//' + name
		print(filePath)
		with open(filePath, 'w') as destination:
			for chunk in f.chunks():
				destination.write(chunk)

	def get(self, request, *args, **kwargs):
		os.system("ls rule > logs/rulefile")
		fsock = open("logs/rulefile", "r")
		result = []
		for entry in fsock:
			result.append(entry.strip('\n'))
		file = json.dumps({"rulefile": result},ensure_ascii=False)
		return HttpResponse(file, content_type='application/json')

	def post(self, request, *args, **kwargs):
		print(request.FILES['file'].name, request.POST)
		self.handle_uploaded_file(request.FILES['file'], request.FILES['file'].name)
		return HttpResponse('success')

class EntityMatching(View):
	def getResult(self, filePath):
		result = []
		fsock = open("result/"+filePath, "r")
		for entry in fsock:
			result.append(json.loads(entry))
		schema = []
		if len(result) > 0:
			for key in result[0]:
				if key[-1] == '1':
					schema.append(key)
				else:
					schema = [key] + schema
		return HttpResponse(json.dumps({"schema" : schema, "rows" : result}), content_type='application/json')

	def get(self, request, *args, **kwargs):
		print(request.GET)
		type = request.GET["type"]
		left = request.GET["left"]
		right = request.GET["right"]
		conf = request.GET["path"]
		t = time.time()
		resultPath = str(int(round(t * 1000))) + ".txt"
		command = ""
		if type == "0":
			command = "java -jar lib/EntityMatching.jar "+type+" data/"+left+" data/"+right+" rule/"+conf+"  > result/"+resultPath
		else:
			command = "java -jar lib/EntityMatching.jar "+type+" data/"+left+" data/"+right+" sql/"+conf+" > result/"+resultPath
		print(command)
		code = os.system(command)
		if (code != 0):
			return HttpResponseServerError("Dima Runtime Error! Please recheck the input file")
		return self.getResult(resultPath)
