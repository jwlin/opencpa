var areas = ["all",[10, 23], [30, 31, 32, 33, 35], [42, 50, 54], [60, 61, 63, 72], [82, 90], [24, 26], [95, 97], [101, 168, 169]];
var areaIndex = [0];
var criterion = "RANK";
var sysnam = ["資訊處理"];

$(function () { // document ready

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
});

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
            if (jobdata[i]["fields"]["is_handicap"]) qual.push("✔歡迎身障應徵");
            if (jobdata[i]["fields"]["is_orig"]) qual.push("✔歡迎原民應徵");
            if (jobdata[i]["fields"]["is_local_orig"]) qual.push("✔原民地區職缺");
            if (jobdata[i]["fields"]["is_training"]) qual.push("✔人事進階專班");
            if (qual.length > 0) {
                detail += "<dt>特殊條件</dt><dd>" + qual.join("&nbsp;&nbsp;") + "</dd>";
            }

		    detail += "<dt>原職缺網址</dt>"
				+ "<dd><a href='" + jobdata[i]["fields"]["view_url"] + "' target='_blank'>前往</a></dd>"
            
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
					}
				});
				detail += ")</dd>";
			}

			detail += "</dl>";
																							
			// draw the panel
			var panel = "<div class='panel panel-primary'><div class='panel-heading'>"
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
				+ jobdata[i]["fields"]["num"] + "人" 
				+ "</h3></div>"
				+ "<div class='panel-body'>" + detail + "</div></div>";

			$("div.list").append(panel);

			count ++;
		}
	}
	$("div.panel-body").toggle();
	$("div.panel-heading" ).click(function( event ) {
		event.preventDefault();
		$(this).siblings(".panel-body").toggle(200);
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
