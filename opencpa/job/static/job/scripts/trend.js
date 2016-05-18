$(document).ready(function() {
	var csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val()
	var path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf( "/" ) + 1);
	var admin_div = document.getElementById("admin_div");
	var tech_div = document.getElementById("tech_div");
	var detail_div = document.getElementById("detail_div");
	var spinner_admin= null;
	var spinner_tech = null;
	var spinner_detail = null;
	
	var adminTable = $('#adminTable').DataTable( {
		data: dataSet,
		order: [[ 1, "desc" ]],
		columns: [
			{ title: "職系" },
			{ title: "開缺數" },
		],
		language: {
	    	"search": "搜尋職系:",
			"searchPlaceholder": "例: 圖書"
		},
		select: {
			style: 'single'
		}
	} );
	
	var techTable = $('#techTable').DataTable( {
		data: dataSet2,
		order: [[ 1, "desc" ]],
		columns: [
			{ title: "職系" },
			{ title: "開缺數" },
		],
		language: {
		    "search": "搜尋職系:",
			"searchPlaceholder": "例: 電子"
		},
		select: {
			style: 'single'
		}
	} );

	var detailTable = $('#detailTable').DataTable( {
		//data: ,
		order: [[ 1, "desc" ]],
		columns: [
			{ title: "機關" },
			{ title: "開缺數" }
		],
		language: {
		    "search": "搜尋關鍵字:"
		}
	} );

	$('#adminTable tbody').on('click', 'tr', function () {
		if (adminTable.row( this ).data() == null) {
			return;
		}
		techTable.rows().deselect();
		var rowdata = adminTable.row( this ).data();
		var sysnam = rowdata[0]
		if (spinner_admin == null) {
			spinner_admin = new Spinner({color:'#000', lines: 12}).spin(admin_div);
		}
		else {
			spinner_admin.spin(admin_div);
		}
		if (spinner_tech == null) {
			spinner_tech = new Spinner({color:'#000', lines: 12}).spin(tech_div);
		} 
		else {
			spinner_tech.spin(tech_div);
		}
		if (spinner_detail == null) {
			spinner_detail = new Spinner({color:'#000', lines: 12}).spin(detail_div);
		} 
		else {
			spinner_detail.spin(detail_div);
		}
		$.post(path + "api/trend/", {"csrfmiddlewaretoken": csrfmiddlewaretoken, "action": "get", "sysnam": sysnam}, function(data) {
			if (data.succeeded) {
				$('#detail_title').text(sysnam + '職系 開缺機關');
				detailTable.clear().draw();
				detailTable.rows.add(data['data']); // Add new data
				detailTable.columns.adjust().draw(); // Redraw the DataTable
				spinner_admin.stop(admin_div);
				spinner_tech.stop(tech_div);
				spinner_detail.stop(detail_div);
			}
			else {
				spinner_admin.stop(admin_div);
				spinner_tech.stop(tech_div);
				spinner_detail.stop(detail_div);
			}
		}, "json");
	} );
	
	$('#techTable tbody').on('click', 'tr', function () {
		if (techTable.row( this ).data() == null) {
			return;
		}
		adminTable.rows().deselect();
		var rowdata = techTable.row( this ).data();
		var sysnam = rowdata[0]
		if (spinner_admin == null) {
			spinner_admin = new Spinner({color:'#000', lines: 12}).spin(admin_div);
		}
		else {
			spinner_admin.spin(admin_div);
		}
		if (spinner_tech == null) {
			spinner_tech = new Spinner({color:'#000', lines: 12}).spin(tech_div);
		} 
		else {
			spinner_tech.spin(tech_div);
		}
		if (spinner_detail == null) {
			spinner_detail = new Spinner({color:'#000', lines: 12}).spin(detail_div);
		} 
		else {
			spinner_detail.spin(detail_div);
		}
		$.post(path + "api/trend/", {"csrfmiddlewaretoken": csrfmiddlewaretoken, "action": "get", "sysnam": sysnam}, function(data) {
			if (data.succeeded) {
				$('#detail_title').text(sysnam + '職系 開缺機關');
				detailTable.clear().draw();
				detailTable.rows.add(data['data']); // Add new data
				detailTable.columns.adjust().draw(); // Redraw the DataTable
				spinner_admin.stop(admin_div);
				spinner_tech.stop(tech_div);
				spinner_detail.stop(detail_div);
			}
			else {
				spinner_admin.stop(admin_div);
				spinner_tech.stop(tech_div);
				spinner_detail.stop(detail_div);
			}
		}, "json");
	} );
} );
