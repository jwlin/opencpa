$(function () { // document ready

	if (isExpired) {
		$('ul.navbar-nav li a').attr("href",  "./"+jobdata['id']);
	}
	else {
		$('ul.navbar-nav li a').attr("href",  "./"+jobdata['job']);	
	}

	var detail = "<dl class='dl-horizontal'>";
	if (!isExpired) {
		detail += "<dt>有效期間</dt>"
			+ "<dd>" + jobdata["date_from"].replace(/-/g,"/") + " - " + jobdata["date_to"].replace(/-/g,"/");
		// check if is expiring
		if (jobdata["isExpiring"]) {
			detail += "<span class='text-danger'>&nbsp;&nbsp;(即將到期)</span></dd>";
		}
	}

	if (!isExpired) {
		detail += "<dt>名額</dt>"
			+ "<dd>" + jobdata["num"] + "</dd>"
			+ "<dt>資格條件</dt>"
			+ "<dd>" + jobdata["work_quality"] + "</dd>"
			+ "<dt>工作項目</dt>"
			+ "<dd>" + jobdata["work_item"] + "</dd>"
			+ "<dt>工作地址</dt>"
			+ "<dd>" + jobdata["work_addr"] + "</dd>"
			+ "<dt>聯絡方式</dt>"
			+ "<dd>" + jobdata["contact"] + "</dd>";

		// check specific qualifications
		var qual = [];
		if (jobdata["is_handicap"]) qual.push("✔歡迎身障應徵");
		if (jobdata["is_orig"]) qual.push("✔歡迎原民應徵");
		if (jobdata["is_local_orig"]) qual.push("✔原民地區職缺");
		if (jobdata["is_training"]) qual.push("✔人事進階專班");
		if (qual.length > 0) {
			detail += "<dt>特殊條件</dt><dd>" + qual.join("&nbsp;&nbsp;") + "</dd>";
		}

		detail += "<dt>原職缺網址</dt>"
			+ "<dd><a href='" + jobdata["view_url"] + "' target='_blank'>前往</a></dd>";
	}
	else {	
		detail += "<dt>資格條件</dt>"
			+ "<dd>" + jobdata["work_quality"] + "</dd>"
			+ "<dt>工作項目</dt>"
			+ "<dd>" + jobdata["work_item"] + "</dd>";
	}

	// check history count and info
	detail += "<dt>開缺紀錄</dt><dd>";
	var his_date = [];
	historydata.forEach(function(dates) {
		his_date.push(dates["date_from"].replace(/-/g,"/") + " - " + dates["date_to"].replace(/-/g,"/"));
	});
	detail += his_date.join("、");
	detail += "</dd>";

	detail += "<dt>留言</dt><dd><div id='message-post-" + jobdata["job"] + "'>"
		+ "<p><textarea rows='2' class='form-control' maxlength='200' id='comment-" + jobdata["job"] + "'></textarea></p>"
		+ "<form class='form-inline' style='text-align:right;'><div class='form-group'><label>密碼</label>&nbsp;"
		+ "<a data-original-title='之後刪除留言時使用' href='#' data-toggle='tooltip' title=''>(?)</a>&nbsp;"
		+ "<input class='form-control' id='pwd-" + jobdata["job"] + "' type='password'></div>&nbsp;"
		+ "<input class='btn btn-default btn-comment' id='btn-comment-" + jobdata["job"] + "' value='送出' type='submit'></div>";
	detail += "<div id='message-get-" + jobdata["job"] + "'></div></dd>";
	detail += "</dl>";

	// draw the panel
	var panel = "<div class='panel panel-primary'><div class='panel-heading'><h3 class='panel-title'>";

	if (isExpired){
		panel += "<span style='background-color: #D9534F;'>&nbsp;已過期&nbsp;</span>&nbsp;&nbsp;";
	}

	panel += jobdata["sysnam"] + " / "
		+ jobdata["rank_from"] + "-" + jobdata["rank_to"] + " 職等 / ";

	if (!isExpired) {
		// convert place_id array to place names
		var places = jobdata["work_places_id"];
		places = places.replace(/[\[\]]/g,""); // replace [ or ]
		places = places.split(",");
		var places_name = []
		places.forEach(function(place) {
			var place_id = parseInt(place);
			places_name.push(placedata[place_id.toString()]); // look up dict placedata
		});
		panel += places_name.join(", ") + " / ";
	}

	panel += jobdata["org_name"] + " / "
		+ jobdata["title"] + " ";

	if (!isExpired) {
		panel += "/ " + jobdata["num"] + "人";
	}

	panel += "</h3></div>"
		+ "<div class='panel-body'>" + detail + "</div></div>";

	$("#item").append(panel);
	
	$.post("./api/message/" + jobdata['job'], {"csrfmiddlewaretoken": $('input[name="csrfmiddlewaretoken"]').val(), "action": "get",}, function(data) {
		if (data.succeeded) {
			var m = '<hr>';
			$.each(data['messages'], function(idx, val) {
				m += '<p class="text-info">' + val ['msg'] 
					+ '<br><span style="color:grey;">' + val["time"] + '</span>&nbsp;&nbsp;'
					+ '<a href="#" style="color:grey;" class="msg-delete" id="msg-' + val['id'] + '">刪除</a>'
					+ '</p>';
				});
				$("#message-get-" + jobdata['job']).html(m);
		}
		else {
			$("#message-get-" + jobid).html("[Exception]");
		}
	}, "json");


	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="tooltip"]').click(function( event ) {
		event.preventDefault();
	});
});
