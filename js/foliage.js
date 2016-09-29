var TRENDCT = TRENDCT || {};

TRENDCT.common = TRENDCT.common || {};

TRENDCT.common.months = TRENDCT.common.months || {};

TRENDCT.helpers = TRENDCT.helpers || {};

TRENDCT.helpers.throttle = function(f, args, time){
    var time = time || 100;
    this.f = f;
    this.args = args;
    var that = this;
    this.cancel();
    
    this.to = setTimeout(function(){
	that.go();
    }, time);
}

TRENDCT.helpers.throttle.prototype.cancel = function(){
    clearTimeout(this.to);
}

TRENDCT.helpers.throttle.prototype.go = function(){
    try{
	return this.f.apply(null, this.args);
	// console.log("Able to apply throttle method");
    }
    catch (e){
	// console.log(this);
	// console.log(this.f);
	// console.log("Error applying throttle method", e);
    }
}

TRENDCT.helpers.lpad = function(pad_len, num){
    var num_str = String(num);
    var num_len = num_str.length;
    for (var i = 0; i < pad_len - num_len; i++){
	num_str = "0" + num_str;
    }
    return num_str;
}

TRENDCT.common.months.ap = {
    1: "Jan.",
    2: "Feb.",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "Aug.",
    9: "Sept.",
    10: "Oct.",
    11: "Nov.",
    12: "Dec."
}

// Foliage app namespace
var FOL= FOL || {};
FOL.width = 0;
FOL.data = {};
// loc_id, loc_name
FOL.locations = {
    2319: "Talcott Mountain",
    2318: "Mohawk Mountain",
    // 2320: "Criscuolo Park"
}

FOL.parse_date = function(d){
    d_str = String(d);
    var year = d_str.substring(0,4);
    var month = d_str.substring(4,6);
    var day = d_str.substring(6,8);

    return {
	"day":day,
	"month":month,
	"year":year
    }
}

FOL.years = [2012,2013,2014,2015];

FOL.csv_name = function(loc_id){
    // return "data/" + loc_id + "_hexes.csv";
    return "data/" + loc_id + "_edited.csv";
}

FOL.div = "#app_container";

FOL.year_timeline = function(data, loc_id, year){

    var detached = d3.select(document.createElement("div"))

    // filter out other years
    var data = data.filter(function(a){
	return Number(a.year) == Number(year);
    });

    var rect = d3.select(FOL.div).node().getBoundingClientRect();
    
    var day_blocks = detached.selectAll(".fol-day-block")
	.data(data)
	.enter()
	.append("div")
	.attr("data-date", function(d){
	    return d.date;
	})
	.attr("data-year", function(d){
	    return d.year;
	})
	.attr("data-month", function(d){
	    return FOL.parse_date(d.date).month;
	})
	.attr("data-day", function(d){
	    return FOL.parse_date(d.date).day;
	})
	.attr("data-loc_id", loc_id)
	.classed("fol-day-block", true)
	.style("background-color", function(d){
	    return d.color;
	})
	.style("width", function(){
	    return (rect.width / (data.length + 1)) + "px";
	})
	.each(function(d){
	    FOL.preload(loc_id, d.date, d.month, d.day, d.year);
	});

    detached.append("div")
	.classed("clear-both", true)

    return detached;
    
}

FOL.timeline = function(data, loc_id){
    var detached = d3.select(document.createElement("div"))

    // Add a timeline for each year

    var max_len = 0;
    for (y in FOL.years){
	var year_label = detached.append("label")
	    .classed("fol-year-label", true)
	    .html("<small>" + FOL.years[y] + "</small>");
	
	var year_timeline = detached.append("div")
	    .classed("fol-year-timeline", true)
	    .attr("data-year", FOL.years[y])
	    .attr("data-loc_id", loc_id)
	    .html(FOL.year_timeline(data, loc_id, FOL.years[y]).html());

	var data_len = FOL.data[loc_id].filter(function(a){
	    var match = a.year == Number(FOL.years[y]);
	    return match
	}).length;

	if (data_len > max_len){
	    max_len = data_len;
	}
    }

    var slider = detached.append("input")
	.classed("fol-day-slider", true)
    	.attr("type","range")
	.attr("min", 1)
	.attr("max", 366)
	.attr("data-loc_id", loc_id)
    // .attr("data-year", year);

    return detached;
}

FOL.image_error = function(){
    // console.log("error loading image", this);
    // var color = d3.select(this)
    // 	.style("background-color");

    // d3.select(this)
    // 	.style("background-color", color)
    // 	.attr("src",null);
}

FOL.layout = function(data, loc_id){

    // console.log("FOL.layout", loc_id, data);
    
    // include only 2012 to 2015 
    var data = data.filter(function (a){
	return a.year >= Math.min.apply(null, FOL.years)
	    && a.year <= Math.max.apply(null, FOL.years);
	// return (a.date >= Math.min.apply(null,FOL.years) * 10000)
	//     && (a.date < Math.max.apply(null,FOL.years) * 10000);
    });

    // Add a thumbnail preview
    var detached = d3.select(document.createElement("div"));

    // Add the location title and day, month container
    var header = detached.append("h3")
	.classed("fol", true)
	.classed("big-title", true)
	.text(function(){
	    return FOL.locations[loc_id];
	});

    header.append("small")
	.classed("fol", true)
	.classed("month-day-label", true)
	.attr("data-loc_id", loc_id);

    var top = detached.append("div")
	.classed("fol-top", true);
    
    var thumbs = top.selectAll("div")
	.data(FOL.years)
	.enter()
	.append("div")
	.classed("fol-thumbnail", true)
	.attr("data-loc_id", loc_id)
	.attr("data-loc_name", FOL.locations[loc_id])

    thumbs.append("img")
	.attr("onError","this.src='img/fallback.png'")
	.attr("data-year", function(d){
	    return d;
	})
	.attr("src", function(d){
	    // return "img/" + loc_id + "/" + d + moment().format("MMDD.jpg");
	});
		  
    thumbs.append("div")
	.classed("year-label", true)
	.style("background-color", "rgba(255,255,255,0.5)")
	.attr("data-loc_id", loc_id)
	.attr("data-year", function(d){
	    return d;
	})
	.text(function(d){
	    return d;
	});
    
    detached.append("div").classed("clear-both", true);
    
    // Add a timeline slider
    var timeline = FOL.timeline(data, loc_id);
    detached.append("div")
	.classed("fol-slider", true)
	.html(timeline.html());

    // Append a byline and sourceline
    detached.append("div")
	.classed("fol-sourceline", true)
	.text("SOURCE: CT DEEP, EarthCam")

    d3.select(FOL.div).html("");
    // Append the layout to the div
    d3.select(FOL.div).append("div")
	.html(detached.html())
	.classed("fol-section", true);


    FOL.load_date(loc_id, 
		  moment().format("MM"),
		  moment().format("DD"),
		  2015);

    

    // Handle events
    d3.selectAll("input[type='range']")
	.on("input", function(){
	    // var year = d3.select(this).attr("data-year");
	    var loc_id = d3.select(this).attr("data-loc_id");
	    var bar_sel = ".fol-year-timeline"
		+ "[data-loc_id='"+
		loc_id+"']";

	    // Select all the spectrum bars
	    var bars = d3.select(bar_sel);
	    var longest = bars.sort(function(a, b){
		return a[0].length - b[0].length
	    })[bars.length - 1];

	    // Get the date of the this.valueth element of the longest bar
	    // console.log(this.value);
	    // console.log(longest[0]);
	    // var days_in_longest = d3.select(longest[0]).selectAll(".fol-day-block");
	    // console.log(days_in_longest);
	    // console.log(this.value);
	    // var cur_day_block = days_in_longest[0][this.value - 1];
	    // console.log(cur_day_block);
	    
	    // var day= d3.select(cur_day_block).attr("data-day");
	    // var month= d3.select(cur_day_block).attr("data-month");
	    // set the needle of each bar to that
	    var all_day_blocks = d3.selectAll(".fol-day-block"
						+ "[data-loc_id='"+loc_id+"']"
						+ "[data-day='"+day+"']"
						+ "[data-month='"+month+"']");

	    // var year = d3.select(cur_day_block).attr("data-year");

	    // use moments

	    var day = moment("2016 " + this.value,"YYYY DDD").format("DD")
	    var month = moment("2016 " + this.value,"YYYY DDD").format("MM")
	    FOL.load_date (loc_id, month, day, 2015); // , 2020); 
	    
	    // load the date

	    // var bar = d3.select(bar_sel)
	    // var box = d3.select(bar.selectAll(".fol-day-block")[0][this.value - 1]);

	    
	    // FOL.load_date = function(loc_id, month, day, year){
	    // console.log(bar);
	    // console.log(box[0][this.value - 1]);
	    
	    // var month = box.attr("data-month");
	    // var day = box.attr("data-day");
	    // FOL.load_date(loc_id, month, day, year);

	    // // Change the other sliders
	    // var other_sliders_sel  = ".fol-year-timeline[data-loc_id='" + loc_id + "'] input[type='range']"
	    // var other_sliders = d3.selectAll(other_sliders_sel)
	    // other_sliders.property("value",this.value);
	});

    d3.selectAll(".fol-day-block").on("mouseover", function(){
	var loc_id = d3.select(this).attr("data-loc_id");


	var date = d3.select(this).attr("data-date");
	var year = d3.select(this).attr("data-year");
	var month = d3.select(this).attr("data-month");
	var day = d3.select(this).attr("data-day");

	FOL.load_throttle = new TRENDCT.helpers.throttle(FOL.load_date,
							 [loc_id, month, day, year]);
	// FOL.load_date(loc_id, month, day, year);
	
    });

    // d3.selectAll(".fol-day-block")
    // 	.style("width", function(){
    // 	    var rect = d3.select(FOL.div).node().getBoundingClientRect();
    // 	    var width = Math.floor(rect.width / 365);
    // 	    return width + "px";
    // 	});

    pymChild.sendHeight();
    return detached;
}


// Get an appropriate image background color for a given day
// Try to find a non-white value for each year.
FOL.get_color = function(loc_id, month, day){

    for (y in FOL.years){
	var year = FOL.years[y];
	var date_str = year
	    + TRENDCT.helpers.lpad(2, month)
	    + TRENDCT.helpers.lpad(2, day)
	
	try {
	    var color = FOL.data[loc_id].filter(function(a){
		return a.date == date_str;
	    })[0].color;
	    if (color === "#FFFFFF"){
		continue;
	    }
	    return color;
	}
	catch (e){
	}
    }
    return "#FFFFFF";
}

FOL.load_date = function(loc_id, month, day, year){

    // reset colors
    d3.selectAll(".fol-day-block")
	.classed("day-highlight", false);

    // the nth day of the year
    var day_num = moment(year + month + day, "YYYYMMDD").format("DDD");

    d3.select("input[type='range'][data-loc_id='"+loc_id+"']")
	.property("value", day_num);
    
    var blocks = d3.selectAll(".fol-day-block"
			   + "[data-loc_id='" + loc_id + "']"
			   + "[data-month='" + month + "']"
			   + "[data-day='" + day + "']")
	.classed("day-highlight",true);
    
    // var color = d3.select(this).style("background-color");
    // Get a non-white color to use for the image panel background
    var color = FOL.get_color(loc_id, month, day, year);
    
    d3.select(".big-title small[data-loc_id='" + loc_id  + "']")
	.text(TRENDCT.common.months.ap[Number(month)] + " " + Number(day));
    
    var label_sel = ".fol-thumbnail .year-label[data-year='"
	+ year + "'][data-loc_id='" + loc_id + "']";

    d3.selectAll(".fol-thumbnail .year-label")
	.style("background-color", "rgba(255,255,255,0.5)");
    d3.select(label_sel)
	.style("background-color", "indianred");
    
    for (var y in FOL.years){
	var y = FOL.years[y];
	var img_sel = ".fol-thumbnail[data-loc_id='"
	    + loc_id
	    + "'] img[data-year='" + y + "']";
	var img_sel_general = ".fol-thumbnail[data-loc_id='"
	    + loc_id
	    + "']";

	d3.selectAll(img_sel_general)
	    .style("background-color", color);
	
	var img_file = "img/" + loc_id + "/" + y +  month + day + ".jpg";

	d3.select(img_sel)
	    .attr("src", img_file)
    }

}

FOL.layout_maker = function(loc_id){
    return function(data){
	FOL.data[loc_id] = data;
	FOL.layout(data, loc_id);
    }
}

FOL.preloaded = {};

FOL.preload = function(loc_id, date, month, day, year){

    return;
    var path = 'img/' + loc_id + "/" + date + '.jpg';
    if (FOL.preloaded.hasOwnProperty(path)) {
	// console.log("Already had preloaded", path)
	return;
    }

    FOL.preloaded[path] = new Image(100, 200);
    FOL.preloaded[path].src = path;
    // console.log("preloaded", path);
}

FOL.go = function(){
    
    // Clear the layout
    d3.select(FOL.div).html("");
    
    // For each data file, generate the layout
    // console.log("for");
    for (k in FOL.locations){
	// console.log(k);
	// console.log("location", k);
	var filename = FOL.csv_name(k);
	d3.csv(filename, FOL.layout_maker(k));
    }
    // console.log("end for");
}

FOL.setup = function(locations){
    // console.log("Setting up with locations", locations);
    var rect = d3.select(FOL.div).node().getBoundingClientRect();
    // console.log(rect);
    if (typeof(locations)!="undefined"){
	rect = d3.select(FOL.div).node().getBoundingClientRect();
	var tmp_locations = {};
	for (i in locations){
	    tmp_locations[locations[i]] = FOL.locations[locations[i]];
	}
	FOL.locations = tmp_locations;
	// console.log("locations: ", FOL.locations);
    }

    // new TRENDCT.helpers.throttle(FOL.go, null, 100);
    FOL.go();
    // FOL.width = rect.width;
    d3.select(window).on("resize", function(){
	// console.log("resize event", rect.width, FOL.width);
    	// if (rect.width != FOL.width){
    	// var resizer = new TRENDCT.helpers.throttle(FOL.go, null, 100);
    	// FOL.width = rect.width;
    	// }
    });
}

// FOL.setup([2319, 2318]);
