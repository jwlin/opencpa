var margin = {top: 20, right: 20, bottom: 100, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
var x = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);
var y = d3.scale.linear()
	.range([height, 0]);
var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");
var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

var svgAdmin = d3.select("#admin-chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
d3.tsv("https://dl.dropboxusercontent.com/u/3227595/dd/data.csv", type, function(error, data) {
//d3.json(admindata, type, function(error, data) {
	x.domain(data.map(function(d) { return d.sysnam; }));
	y.domain([0, d3.max(data, function(d) { return d.num; })]);
	
	svgAdmin.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis).
		selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(90)")
		.style("text-anchor", "start");
	
	svgAdmin.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("職缺數");

	svgAdmin.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.sysnam); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d.num); })
		.attr("height", function(d) { return height - y(d.num); });	
});

var svgTech = d3.select("#tech-chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
d3.tsv("https://dl.dropboxusercontent.com/u/3227595/dd/data.csv", type, function(error, data) {
//d3.json(techdata, type, function(error, data) {
	x.domain(data.map(function(d) { return d.sysnam; }));
	y.domain([0, d3.max(data, function(d) { return d.num; })]);
	
	svgTech.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis).
		selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(90)")
		.style("text-anchor", "start");
	
	svgTech.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("職缺數");

	svgTech.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.sysnam); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d.num); })
		.attr("height", function(d) { return height - y(d.num); });	
});

function type(d) {
	d.num = +d.num;
	return d;
}
