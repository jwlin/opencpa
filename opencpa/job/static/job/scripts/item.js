$(function () { // document ready
	csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val();

	if (isExpired) {
		jid = jobdata['id']
	}
	else {
		jid = jobdata['job']
	}

	var path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf( "/" ) + 1);
	path = path + "api/message/" + jid;

	$('ul.navbar-nav li a').attr("href",  "./"+jid);	

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
        if (jobdata["is_resume_required"]) qual.push("<a href='http://web3.dgpa.gov.tw/want03front/doc/103_User%20Manual_Resume.htm' target='_blank'>✔同意開放簡歷</a>");
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
			+ "<dd>" + jobdata["work_item"] + "</dd>"
			+ "<dt>工作地址</dt>"
			+ "<dd>" + jobdata["work_addr"] + "</dd>";
	}

	// check history count and info
	detail += "<dt>開缺紀錄</dt><dd>(" + historydata.length + " 次) ";
	var his_date = [];
	historydata.forEach(function(dates) {
		his_date.push(dates["date_from"].replace(/-/g,"/") + " - " + dates["date_to"].replace(/-/g,"/"));
	});
	detail += his_date.join("、");
	detail += "</dd>";

	detail += "<dt>留言</dt><dd><div id='message-post-" + jid + "'>"
		+ "<form><div class='form-group'><textarea id='comment-" + jid 
		+ "' maxlength='200' class='form-control' rows='2'></textarea></div>"
		+ "<div class='form-group form-inline' style='text-align:right;'><span>密碼 (刪除留言時使用)</span>&nbsp;"
		+ "<input type='password' maxlength='20' class='form-control' id='pwd-" + jid +"'>&nbsp;"
		+ "<input type='submit' value='送出' autocomplete='off' data-loading-text='...' id='btn-comment-" + jid + "' class='btn btn-default btn-sm btn-comment'></div></form></div>";
	detail += "<div id='message-get-" + jid + "'></div></dd>";
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
	
	getMessages(jid, csrfmiddlewaretoken);

	// action for post comments
	$("input.btn-comment" ).click(function( event ) {
		event.preventDefault();
		var jobid = $(this).attr('id');
		jobid = jobid.split('-')[2];
		if( !$("#comment-" + jobid).val() ) {
			$("#comment-" + jobid).parent().addClass('has-error');
		}
		else if( !$("#pwd-" + jobid).val() ) {
			$("#pwd-" + jobid).parent().addClass('has-error');
		}
		else {
			var $btn = $(this).button('loading');
			$("#comment-" + jobid).parent().removeClass('has-error');
			$("#pwd-" + jobid).parent().removeClass('has-error');
			$.post(path, {
				"csrfmiddlewaretoken": csrfmiddlewaretoken, 
				"action": "add", 
				"pwd": $("#pwd-" + jobid).val(),
				"comment": $("#comment-" + jobid).val(),
			}, function(data) {
				if (data.succeeded) {
					getMessages(jobid, csrfmiddlewaretoken);
					$btn.button('reset')
					$("#pwd-" + jobid).val("");
					$("#comment-" + jobid).val("");
				}
				else {
					$("#btn-comment-" + jobid).val("Exception");
					$("#btn-comment-" + jobid).attr("disabled", "disabled");
				}
			}, "json");
		}
	});

	$('#msgDelModal').on('show.bs.modal', function (event) {
		$('#hidden-msgDelModal').val($(event.relatedTarget).data('whatever'));
		$('#msgDelPwd').val('');
		$('#alertDelPwd').hide();
		$('#msgDelPwd').focus(); // why not working?
	})
	
	$("#btn-msgDelModal").click(function( event ) {
		event.preventDefault();
		var jobid = $("#hidden-msgDelModal").val().split('-')[0];
		var msgid = $("#hidden-msgDelModal").val().split('-')[1];
		var pwd = $('#msgDelPwd').val();
		
		$.post(path, {
			"csrfmiddlewaretoken": csrfmiddlewaretoken,
			"action": "delete",
			"pwd": pwd,
			"msgid": msgid,
			}, function(data) {
				if (data.succeeded) {
					$('#msgDelModal').modal('hide');
					getMessages(jobid, csrfmiddlewaretoken);
					//$("#msg-" + msgid).fadeOut(500, function() { $(this).remove(); });
				}
				else {
					$('#alertDelPwd').fadeOut().fadeIn();
				}
			}, 
		"json");
	});
	
});


function getMessages(jobid, csrfmiddlewaretoken) {
	var m = "";
	var path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf( "/" ) + 1);
	path = path + "api/message/" + jobid;
	$.post(path, {"csrfmiddlewaretoken": csrfmiddlewaretoken, "action": "get",}, function(data) {
		if (data.succeeded) {
			if (data['messages'].length != 0) {
				m = '<hr>';
				$.each(data['messages'], function(idx, val) {
					m += '<p class="text-info" id="msg-' + val['id'] + '">' + val ['msg'] 
						+ '<br><span style="color:grey;">' + val["time"] + '</span>&nbsp;&nbsp;'
						+ '<a href="#" style="color:grey;" data-toggle="modal" data-target="#msgDelModal" data-whatever="' + jobid + '-' + val['id'] + '">刪除</a>'
						+ '</p>';
				});
			}
			$("#message-get-" + jobid).fadeOut(100).fadeIn().html(m);
		}
		else {
			$("#message-get-" + jobid).html("[Exception]");
		}
	}, "json");
}
