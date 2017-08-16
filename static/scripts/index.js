function getColumns(tableId, tableName, tabId, callback) {
	$.get("/entity_matching/test/schema/", {data: tableName}, function(result)		{
		schema = result["schema"]
		console.log(schema)
		column = $.map(schema, function(row){
			return {field: row, title: row}
		})
    	callback(tableId, tableName, column, tabId)
  	});	
}

function queryParams(tableName) {
	return { data: tableName }
}

function queryParams1(leftFilePath, rightFilePath) {
	return { left: leftFilePath, right: rightFilePath}
}

function responseFunc() {
	return result
}

function getAllTableName() {
	return
}

function loadData(tableId, tableName, column, tabId) {
	$('#'+tableId).bootstrapTable('destroy')
	$.get(
		'/entity_matching/test/data/',
		{data: tableName},
		function(result) {
		$('#'+tableId).bootstrapTable({
            //url: '/entity_matching/test/data/',         //请求后台的URL（*）
            //method: 'get',                      //请求方式（*）
			data: result['rows'],
            toolbar: '#'+tabId,                //工具按钮用哪个容器
            striped: true,                      //是否显示行间隔色
            pagination: true,                   //是否显示分页（*）
            sortable: true,                     //是否启用排序
            sortOrder: "asc",                   //排序方式
            pageNumber:1,                       //初始化加载第一页，默认第一页
            pageSize: 10,                       //每页的记录行数（*）
            pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
            search: true,
            strictSearch: false,
            showColumns: true,                  //是否显示所有的列
            showRefresh: true,                  //是否显示刷新按钮
            minimumCountColumns: 2,             //最少允许的列数
            clickToSelect: false,                //是否启用点击选中行
            height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
            // uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
            showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
            cardView: false,                    //是否显示详细视图
            detailView: false,                   //是否显示父子表
            columns: column
		});
		}
	)
}

function formatTableUnit(value, row, index) {
    var front_color = 'black';
    var bg_color = '#CCCCCC';
    return {
        css: {
            "color":front_color,
            "background-color": bg_color
        }
    }
}

function showResult(tableId, type, leftFilePath, rightFilePath, path) {
		$("button").attr("disabled", "disabled")
		enableInfo()
		$('#'+tableId).bootstrapTable('destroy')
		$.ajax({
			url: '/entity_matching/test/entity_matching/',
			data: { type: type, left: leftFilePath, right: rightFilePath, path: path},
			type: 'GET',
			complete: function() {
				$("button").removeAttr("disabled")
			},
			success: function(result) {
				console.log(result['schema'])
				$('#'+tableId).bootstrapTable({
					data: result['rows'],
            		//toolbar: '#run',
            		striped: false,
            		cache: false,
            		pagination: true,
            		sortable: false,
            		sortOrder: "asc",                   //排序方式
					sidePagination: "client",
            		pageNumber:1,
            		pageSize: 10,
            		pageList: [10, 25, 50, 100],
            		search: true,
            		strictSearch: false,
            		showColumns: true,                  //是否显示所有的列
            		showRefresh: true,                  //是否显示刷新按钮
            		minimumCountColumns: 2,             //最少允许的列数
            		clickToSelect: false,
            		height: 500,
            		uniqueId: "ID",
            		showToggle:false,
            		cardView: false,                    //是否显示详细视图
            		detailView: false,                   //是否显示父子表
            		columns: $.map(result['schema'], function(row){
						len = row.length - 1
						if (row.charAt(len) == '1') {
							return {field: row, title: row, cellStyle:formatTableUnit}
						}
						return {field: row, title: row}
					})
				});
				enableSuccess('', 'Please check the result at the bottom of the page')
				$('html,body').animate({scrollTop:$('table#result').offset().top}, 800);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
            	console.log(XMLHttpRequest, textStatus, errorThrown)
            	enableDanger(XMLHttpRequest.status + ": " + XMLHttpRequest.responseText)
        	}
		})
}

function loadRules(ruleFile, csrf) {
	$.get(
		'/entity_matching/test/rule/',
		{rulefile: ruleFile},
		function(result) {	
		$('#rule').bootstrapTable('destroy').bootstrapTable({
            toolbar: '#toolbar',                //工具按钮用哪个容器
            striped: true,                      //是否显示行间隔色
			editable: true,
            cache: false,
            pagination: false,                   //是否显示分页（*）
            sortable: false,                     //是否启用排序
            sortOrder: "asc",                   //排序方式
            //queryParams: queryParams,    传递参数（*）
            sidePagination: "client",
            pageNumber:1,                       //初始化加载第一页，默认第一页
            pageSize: 10,                       //每页的记录行数（*）
            pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
            search: false,                       //是否显示表格搜索，此搜索是客户端搜索，>不会进服务端，所以，个人感觉意义不大
            strictSearch: false,
            showColumns: true,                  //是否显示所有的列
            showRefresh: true,                  //是否显示刷新按钮
            minimumCountColumns: 2,             //最少允许的列数
            clickToSelect: true,                //是否启用点击选中行
            height: 300,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
            uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
            showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
            cardView: false,                    //是否显示详细视图
            detailView: false,                   //是否显示父子表
			onEditableSave: function (field, row, oldValue, $el) {
				data = JSON.stringify($('#rule').bootstrapTable('getData'))
    			$.post("/entity_matching/test/rule/", { path: window.ruleName, rules: data , csrfmiddlewaretoken: csrf}, function(request){$('#rule').bootstrapTable('refresh')});
            },
            columns: [{
                checkbox: true
            }, {
                field: 'id',
                title: 'id'
            }, {
                field: 'left',
                title: 'leftField',
				editable: {  
                    type: 'text',  
					validate: function(value) {
						if($.trim(value) == '') {
        					return 'This field is required';
						}
					}
                 }
            }, {
                field: 'right',
                title: 'rightField',
				editable: {  
                    type: 'text',  
					validate: function(value) {
						if($.trim(value) == '') {
        					return 'This field is required';
						}
					}
				}
            }, {
                field: 'simFunc',
                title: 'simFunc',
				editable: { 
                    type: 'select',  
        			source: [
              			{value: 'EDSIMILARITY', text: 'EDSIMILARITY'},
              			{value: 'JACCARDSIMILARITY', text: 'JACCARDSIMILARITY'},
           			],
				}
            }, {
                field: 'threshold',
                title: 'threshold',
				editable: {  
                    type: 'text',  
					validate: function(value) {
						if($.trim(value) == '') {
        					return 'This field is required';
						}
					}
				}

            }],
			data: result['rows'],
        });
	})
}

function loadSqls(sqlFile, csrf) {
	$.get(
		'/entity_matching/test/sql/',
		{sqlfile: sqlFile},
		function(result) {	
		$('table#sql').bootstrapTable('destroy').bootstrapTable({
            toolbar: '#toolbar1',                //工具按钮用哪个容器
            striped: true,                      //是否显示行间隔色
			editable: true,
            cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            pagination: false,                   //是否显示分页（*）
            sortable: false,                     //是否启用排序
            sortOrder: "asc",                   //排序方式
            //queryParams: queryParams,    传递参数（*）
            sidePagination: "client",           //分页方式：client客户端分页，server服务端分页（*）
            search: false,
            strictSearch: false,
            showColumns: true,                  //是否显示所有的列
            showRefresh: true,                  //是否显示刷新按钮
            minimumCountColumns: 2,             //最少允许的列数
            clickToSelect: true,                //是否启用点击选中行
            height: 300,
            uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
            showToggle:false,                    //是否显示详细视图和列表视图的切换按钮
            cardView: false,                    //是否显示详细视图
            detailView: false,                   //是否显示父子表
			onEditableSave: function (field, row, oldValue, $el) {
				data = JSON.stringify($('table#sql').bootstrapTable('getData'))
    			$.post("/entity_matching/test/sql/", { path: window.sqlName, sqls: data , csrfmiddlewaretoken: csrf});
            },
            columns: [{
                checkbox: true
            }, {
                field: 'id',
                title: 'id'
            }, {
                field: 'leftSignature',
                title: 'leftTableName',
            }, {
                field: 'rightSignature',
                title: 'rightTableName',
            }, {
                field: 'sql',
                title: 'SQL',
				editable: {  
                    type: 'textarea',  
					validate: function(value) {
						if($.trim(value) == '') {
        					return 'This field is required';
						}
					},
					inputclass: 'sqlinput'
                 }
            },],
			data: result['rows'],
        });
	})
}


function displayAll() {
//	$('div#chooseLeft').attr('style', 'display: none')
//	$('div#chooseRight').attr('style', 'display: none')
//	$('div#chooseRule').attr('style', 'display: none')
//	$('div#runDemo').attr('style', 'display: none')
	
	$('li#restaurant').removeAttr('class')
	$('li#academic').removeAttr('class')
	$('li#product').removeAttr('class')
//	$('li#runDemo').removeAttr('class')
}

function toggleNav(type, csrf) {
	displayAll()
	$('table#result').bootstrapTable('destroy')
	switch(type) {
	case '0':
		$('div#contents').attr('style', 'display:block')
        $('div#abouts').attr('style', 'display:none')
		$('li#restaurant').attr('class', 'active')
		chooseTable('left', 'restaurant')
		chooseTable('right', 'restaurant')
		window.ruleName = 'rule.conf'
		window.sqlName = 'sql.conf'
		$('#left_table_name').text('Restaurant')
		$('#right_table_name').text('Restaurant')
		loadRules(window.ruleName, csrf)
		loadSqls(window.sqlName, csrf)
		break
	case '1':
		$('div#contents').attr('style', 'display:block')
        $('div#abouts').attr('style', 'display:none')
		$('li#product').attr('class', 'active')
		chooseTable('left', 'GoogleProducts')
        chooseTable('right', 'AmazonProducts')
		window.ruleName = 'rule1.conf'
		window.sqlName = 'sql1.conf'
		$('#left_table_name').text('GoogleProducts')
		$('#right_table_name').text('AmazonProducts')
		loadRules(window.ruleName, csrf)
		loadSqls(window.sqlName, csrf)
		break
	case '2':
		$('div#contents').attr('style', 'display:block')
        $('div#abouts').attr('style', 'display:none')
		$('li#academic').attr('class', 'active')
		chooseTable('left', 'Scholar')
        chooseTable('right', 'DBLP')
		window.ruleName = 'rule2.conf'
		window.sqlName = 'sql2.conf'
		$('#left_table_name').text('Scholar')
		$('#right_table_name').text('DBLP')
		loadRules(window.ruleName, csrf)
		loadSqls(window.sqlName, csrf)
		break
	case '3':
		$('div#contents').attr('style', 'display:none')
		$('div#abouts').attr('style', 'display:block')
	}
}

function init(csrf){
	window.leftTableName = 'restaurant.json'
	window.rightTableName = 'restaurant.json'
	window.sqlName = 'sql.conf'
	window.ruleName = 'rule.conf'
	getColumns('lefttable', 'restaurant.json', 'leftTab', loadData)
	getColumns('righttable', 'restaurant.json', 'rightTab',loadData)
	loadRules(window.ruleName, csrf)
	loadSqls(window.sqlName, csrf)
}
