$(document).ready(function() {
	var csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val()
	var path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf( "/" ) + 1);
	var sysnam_div = document.getElementById("sysnam_div");
	var detail_div = document.getElementById("detail_div");
	var spinner_sysnam = null;
	var spinner_detail = null;

    var deptTable = $('#deptTable').DataTable( {
		data: dataSet,
		order: [[ 1, "desc" ]],
		columns: [
			{ title: "機關 (點選任一列)" },
			{ title: "開缺數" },
		], 
		language: {
		    "search": "搜尋機關名稱:",
			"searchPlaceholder": "例: 北市"
		},
		select: {
			style: 'single'
		}
	} );
	
	var sysnamTable = $('#sysnamTable').DataTable( {
		//data: ,
		order: [[ 1, "desc" ]],
		columns: [
			{ title: "職系 (點選任一列)" },
			{ title: "開缺數" },
		],
		language: {
		    "search": "搜尋職系:",
			"searchPlaceholder": "例: 土木"
		},
		select: {
			style: 'single'
		}
	} );

	var detailTable = $('#detailTable').DataTable( {
		//data: ,
		order: [[ 2, "desc" ], [5, "desc"]],
		columns: [
			{ title: "機關" },
			{ title: "職系" },
			{ title: "開缺日期" },
			{ title: "職稱" },
			{ title: "職等起" },
			{ title: "職等迄" },
			{ title: "工作地址" },
			{ title: "連結" }
		],
		columnDefs: [
			{
				"render": function(data, type, row) {
					return '<a href="' + path + row[7]  + '" target="_blank">' + data  + '</a>';
				},
				"targets": [ 2 ]
			},
			{ "visible": false,  "targets": [ 7 ] }
		],
		language: {
		    "search": "搜尋關鍵字:"
		}
	} );

	$('#deptTable tbody').on('click', 'tr', function () {
		var rowdata = deptTable.row( this ).data();
		if (spinner_sysnam == null) {
			spinner_sysnam = new Spinner({color:'#000', lines: 12}).spin(sysnam_div);
		} 
		else {
			spinner_sysnam.spin(sysnam_div);
		}
		$.post(path + "api/dept/", {"csrfmiddlewaretoken": csrfmiddlewaretoken, "action": "get", "dept": rowdata[0]}, function(data) {
			if (data.succeeded) {
				$('#dept_name').text(rowdata[0]);
				sysnamTable.clear().draw();
				sysnamTable.rows.add(data['data']); // Add new data
				sysnamTable.columns.adjust().draw(); // Redraw the DataTable
				spinner_sysnam.stop(sysnam_div);
				//$("#sysnamTable").fadeOut(100).fadeIn();
			}
			else {
				spinner_sysnam.stop(sysnam_div);
			}
		}, "json");
	} );
    
	$('#sysnamTable tbody').on('click', 'tr', function () {
		if (sysnamTable.row( this ).data() == null) {
			return;
		}
		var rowdata = sysnamTable.row( this ).data();
		var dept_name = $('#dept_name').text();
		if (spinner_sysnam == null) {
			spinner_sysnam = new Spinner({color:'#000', lines: 12}).spin(sysnam_div);
		}
		else {
			spinner_sysnam.spin(sysnam_div);
		}
		if (spinner_detail == null) {
			spinner_detail = new Spinner({color:'#000', lines: 12}).spin(detail_div);
		} 
		else {
			spinner_detail.spin(detail_div);
		}
		$.post(path + "api/dept/", {"csrfmiddlewaretoken": csrfmiddlewaretoken, "action": "get", "dept": dept_name, "sysnam": rowdata[0]}, function(data) {
			if (data.succeeded) {
				$('#dept_name_2').text(dept_name);
				$('#sys_name').text(rowdata[0] + '職系');
				detailTable.clear().draw();
				detailTable.rows.add(data['data']); // Add new data
				detailTable.columns.adjust().draw(); // Redraw the DataTable
				spinner_sysnam.stop(sysnam_div);
				spinner_detail.stop(detail_div);
				//$("#detailTable").fadeOut(100).fadeIn();
			}
			else {
				spinner_sysnam.stop(sysnam_div);
				spinner_detail.stop(detail_div);
			}
		}, "json");
	} );
	
} );
