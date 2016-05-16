var areas = ["all",[10, 23], [30, 31, 32, 33, 35], [42, 50, 54], [60, 61, 63, 72], [82, 90], [24, 26], [95, 97], [101, 168, 169]];
var areaIndex = [0];
var criterion = "RANK";
var sysnam = ["資訊處理"];
var csrfmiddlewaretoken="";

$(function () { // document ready

	csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val();

	for(var i=0; i<sysdata[0].length; i++) {
		$('#sys_admin').append('<li><a href="#">' + sysdata[0][i]  + '</a></li>');
	}

	for(var i=0; i<sysdata[1].length; i++) {
		$('#sys_tech').append('<li><a href="#">' + sysdata[1][i]  + '</a></li>');
	}

	display();

	$( "#sortByRank" ).click(function( event ) {
		event.preventDefault();
		if (criterion != "RANK") {
			criterion = "RANK";
		}
		else {
			criterion = "RANK_INVERSE";
		}
		display();
	});

	$( "#sortByArea" ).click(function( event ) {
		event.preventDefault();
		if (criterion != "AREA") {
			criterion = "AREA";
		}
		else {
			criterion = "AREA_INVERSE";
		}
		display();
	});

	$( "ul.name-filter li" ).click(function( event ) {
		event.preventDefault();
		$(this).toggleClass('active');
		
		// get all the selected sysnam
		sysnam = [];
		$( "ul.name-filter li" ).each(function() {
			if ( $(this).hasClass("active") ) {
				sysnam.push($(this).text().split(" ")[0]);
			}
		});

		event.stopPropagation(); // keep the dropdown menu open
		display();
	});

	$( "ul.area-filter li" ).click(function( event ) {
		event.preventDefault();
		$(this).toggleClass('active');
		
		if ($(this).index()==0) {	// select all
			if ( $(this).hasClass("active") ) {
				$( "ul.area-filter li" ).each(function() {
					$(this).addClass( "active" );
				});
			}
			else {
				$( "ul.area-filter li" ).each(function() {
					$(this).removeClass( "active" );
				});				
			}
		}

		// check if all indices are selected
		var isAllSelected = true;
		$( "ul.area-filter li:gt(0)" ).each(function() {
			if ( !$(this).hasClass("active") ) {
				isAllSelected = false;
			}
		});
		if (isAllSelected) {
			$( "ul.area-filter li:eq(0)").addClass("active");
		}
		else {
			$( "ul.area-filter li:eq(0)").removeClass("active");
		}

		// get all the selected area indices
		areaIndex = []
		$( "ul.area-filter li" ).each(function(index) {
			if ( $(this).hasClass("active") ) {
				areaIndex.push(index);
			}
		});
		
		event.stopPropagation(); // keep the dropdown menu open
		display();
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
		
		$.post(window.location.pathname + "api/message/" + jobid, {
			"csrfmiddlewaretoken": csrfmiddlewaretoken,
			"action": "delete",
			"pwd": pwd,
			"msgid": msgid,
			}, function(data) {
				if (data.succeeded) {
					$('#msgDelModal').modal('hide');
					//$("#msg-" + msgid).fadeOut(500, function() { $(this).remove(); });
					getMessages(jobid, csrfmiddlewaretoken);
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
	$.post(window.location.pathname + "api/message/" + jobid, {"csrfmiddlewaretoken": csrfmiddlewaretoken, "action": "get",}, function(data) {
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

function display() {
	// Clear before drawing
	$("div.list").html("");

	sortjobdata(criterion);

	var count=0;
	for (var i=0; i<jobdata.length; ++i) {
		var isInArea = false;
		if ( areaIndex.indexOf(0) == -1) { // 限地區，需檢查
			var work_places_id = JSON.parse(jobdata[i]["fields"]["work_places_id"]);
			for (var j=0; j<work_places_id.length; ++j) {
				for (var k=0; k<areaIndex.length; ++k) {
					if (areas[areaIndex[k]].indexOf(work_places_id[j]) != -1) { // work_place_type.id 在 areas 內
						isInArea = true;
					}
				}
			}
		}
		else {
			isInArea = true
		}
		
		var isInSysnam = false;
		for (var j=0; j<sysnam.length; ++j) {
			if (jobdata[i]["fields"]["sysnam"].indexOf(sysnam[j]) > -1) {
				isInSysnam = true;
			}
		}
		if (isInSysnam && isInArea) {
			// construct the detail for panel-body
			var detail = "<dl class='dl-horizontal'>"
				+ "<dt>有效期間</dt>"
				+ "<dd>" + jobdata[i]["fields"]["date_from"].replace(/-/g,"/") + " - " + jobdata[i]["fields"]["date_to"].replace(/-/g,"/");
			
			// check if is expiring
			if (jobdata[i]["fields"]["isExpiring"]) {
				detail += "<span class='text-danger'>&nbsp;&nbsp;(即將到期)</span></dd>";
			}

			detail += "<dt>名額</dt>"
				+ "<dd>" + jobdata[i]["fields"]["num"] + "</dd>"
				+ "<dt>資格條件</dt>"
				+ "<dd>" + jobdata[i]["fields"]["work_quality"] + "</dd>"
				+ "<dt>工作項目</dt>"
				+ "<dd>" + jobdata[i]["fields"]["work_item"] + "</dd>"
				+ "<dt>工作地址</dt>"
				+ "<dd>" + jobdata[i]["fields"]["work_addr"] + "</dd>"
				+ "<dt>聯絡方式</dt>"
				+ "<dd>" + jobdata[i]["fields"]["contact"] + "</dd>";

            // check specific qualifications
            var qual = [];
            if (jobdata[i]["fields"]["is_resume_required"]) qual.push("<a href='http://web3.dgpa.gov.tw/want03front/doc/103_User%20Manual_Resume.htm' target='_blank'>✔同意開放簡歷</a>");
            if (jobdata[i]["fields"]["is_handicap"]) qual.push("✔歡迎身障應徵");
            if (jobdata[i]["fields"]["is_orig"]) qual.push("✔歡迎原民應徵");
            if (jobdata[i]["fields"]["is_local_orig"]) qual.push("✔原民地區職缺");
            if (jobdata[i]["fields"]["is_training"]) qual.push("✔人事進階專班");
            if (qual.length > 0) {
                detail += "<dt>特殊條件</dt><dd>" + qual.join("&nbsp;&nbsp;") + "</dd>";
            }

		    detail += "<dt>本職缺網址</dt>"
				+ "<dd><a href='http://" + window.location.host + window.location.pathname + jobdata[i]["fields"]["job"] +"' target='_blank'>本站</a>&nbsp;&nbsp;"
				+ "<a href='" + jobdata[i]["fields"]["view_url"] + "' target='_blank'>人事行政總處</a></dd>";
            
			// check history count and info
			if (parseInt(jobdata[i]["fields"]["history_count"]) > 1) {
				detail += "<dt>近期開缺紀錄</dt><dd>"+ jobdata[i]["fields"]["history_count"]  + " 次 (";
				historydata.forEach(function(entry) {
				    if (entry[0] == jobdata[i]["fields"]["job"]) {
						var his_date = [];
						entry[1].forEach(function(dates) {
							his_date.push(dates["date_from"].replace(/-/g,"/") + " - " + dates["date_to"].replace(/-/g,"/"));
						});
						detail += his_date.join("、");
						if (parseInt(jobdata[i]["fields"]["history_count"]) > 5) {
							detail += " ...";
						}
					}
				});
				detail += ")</dd>";
			}

			detail += "<dt>留言</dt><dd><div id='message-post-" + jobdata[i]["fields"]["job"] + "'>"
				+ "<form><div class='form-group'><textarea id='comment-" + jobdata[i]["fields"]["job"] 
				+ "' maxlength='200' class='form-control' rows='2'></textarea></div>"
				+ "<div class='form-group form-inline' style='text-align:right;'><span>密碼 (刪除留言時使用)</span>&nbsp;"
				+ "<input type='password' maxlength='20' class='form-control' id='pwd-" + jobdata[i]["fields"]["job"] +"'>&nbsp;"
				+ "<input type='submit' value='送出' autocomplete='off' data-loading-text='...' id='btn-comment-" + jobdata[i]["fields"]["job"] + "' class='btn btn-default btn-sm btn-comment'></div></form></div>";
			detail += "<div id='message-get-" + jobdata[i]["fields"]["job"] + "'></div></dd>";
			detail += "</dl>";
																							
			// draw the panel
			var panel = "<div class='panel panel-primary'><div class='panel-heading panel-heading-cursor' id='pheading-" + jobdata[i]["fields"]["job"] + "'>"
				+ "<h3 class='panel-title'>" + jobdata[i]["fields"]["rank_from"] + "-" + jobdata[i]["fields"]["rank_to"] + " 職等 / ";

			// convert place_id array to place names
			var places = jobdata[i]["fields"]["work_places_id"];
			places = places.replace(/[\[\]]/g,""); // replace [ or ]
			places = places.split(",");
			var places_name = []
			places.forEach(function(place) {
				var place_id = parseInt(place);
				places_name.push(placedata[place_id.toString()]); // look up dict placedata
			});
			panel += places_name.join(", ") + " / ";
				
			panel += jobdata[i]["fields"]["org_name"] + " / "
				+ jobdata[i]["fields"]["title"] + " / "
				+ jobdata[i]["fields"]["num"] + "人" ;

			// expiring or new job
			var tdate = new Date();
			today = tdate.toISOString().split("T")[0];
			tdate = tdate.setDate(tdate.getDate()-1);
			var yesterday = new Date(tdate);
			yesterday = yesterday.toISOString().split("T")[0];
			if (jobdata[i]["fields"]["isExpiring"]) {
				panel += "&nbsp;&nbsp;<span class='expiringjob'>&nbsp;Expiring&nbsp;</span>";
			}
			else if ((jobdata[i]["fields"]["date_from"] == today) || (jobdata[i]["fields"]["date_from"] == yesterday)) {
				panel += "&nbsp;&nbsp;<span class='newjob'>&nbsp;New&nbsp;</span>";
			}
			
			panel += "</h3></div>"
				+ "<div class='panel-body' id='pbody-" + jobdata[i]["fields"]["job"] + "'>" + detail + "</div></div>";

			$("div.list").append(panel);

			count ++;
		}
	}
	$("div.panel-body").toggle();
	$("div.panel-heading" ).click(function( event ) {
		event.preventDefault();
		var jobid = $(this).attr('id');
		jobid = jobid.split('-')[1];
		$("#pbody-" + jobid).toggle(200);
		setTimeout(function(){ // wait for pbody folding/unfolding
			if ($("#pbody-" + jobid).css("display") == "block") {
				getMessages(jobid, csrfmiddlewaretoken);
			}
		}, 250);	
	});
	$("#count").text(count);

	// display selected sysnam
	var sysnam_text = [];
	for (var i=0; i<sysnam.length; ++i) {
		sysnam_text.push(sysnam[i]);
	}
	$("#filter-name").text( sysnam_text.join("、") );

	// display selected areas
	if ( areaIndex.indexOf(0) != -1 ) {
		$("#area").text( $("ul.area-filter li:eq(0)").text() );
	}
	else {
		var area_text = [];
		$( "ul.area-filter li:gt(0)" ).each(function() {
			if ( $(this).hasClass("active") ) {
				area_text.push($(this).text());
			}
		});
		$("#area").text( area_text.join("、") );
	}

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
			$.post(window.location.pathname + "api/message/" + jobid, {
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

}

function sortjobdata(criterion) {
	switch(criterion)
	{
		case "RANK":
			jobdata.sort(function (a, b) {
				if (b["fields"]["rank_to"] != a["fields"]["rank_to"]) {
					return b["fields"]["rank_to"] - a["fields"]["rank_to"];
				}
				else if (b["fields"]["rank.from"] != a["fields"]["rank_from"]) {
					return b["fields"]["rank_from"] - a["fields"]["rank_from"];
				}
				else {
					var a_place = JSON.parse(a["fields"]["work_places_id"]);
					var b_place = JSON.parse(b["fields"]["work_places_id"]);
					return a_place[0] - b_place[0];
				}
			});
			break;
		case "RANK_INVERSE":
			jobdata.sort(function (a, b) {
				if (b["fields"]["rank_to"] != a["fields"]["rank_to"]) {
					return a["fields"]["rank_to"] - b["fields"]["rank_to"];
				}
				else if (b["fields"]["rank_from"] != a["fields"]["rank_from"]) {
					return a["fields"]["rank_from"] - b["fields"]["rank_from"];
				}
				else {
					var a_place = JSON.parse(a["fields"]["work_places_id"]);
					var b_place = JSON.parse(b["fields"]["work_places_id"]);
					return a_place[0] - b_place[0];
				}
			});
			break;
		case "AREA":
			jobdata.sort(function (a, b) {
				var a_place = JSON.parse(a["fields"]["work_places_id"]);
				var b_place = JSON.parse(b["fields"]["work_places_id"]);
				if (a_place[0] != b_place[0]) {
					return a_place[0] - b_place[0];
				}
				else if (b["fields"]["rank_to"] != a["fields"]["rank_to"]) {
					return b["fields"]["rank_to"] - a["fields"]["rank_to"];
				}
				else {
					return b["fields"]["rank_from"] - a["fields"]["rank_from"];
				}
			});
			break;
		case "AREA_INVERSE":
			jobdata.sort(function (a, b) {
				var a_place = JSON.parse(a["fields"]["work_places_id"]);
				var b_place = JSON.parse(b["fields"]["work_places_id"]);
				if (a_place[0] != b_place[0]) {
					return b_place[0] - a_place[0];
				}
				else if (b["fields"]["rank_to"] != a["fields"]["rank_to"]) {
					return b["fields"]["rank_to"] - a["fields"]["rank_to"];
				}
				else {
					return b["fields"]["rank_from"] - a["fields"]["rank_from"];
				}
			});			
			break;
		default:
			console.log("Error in sortJobArray: unknown criterion");
			break;
	}
}
