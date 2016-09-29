var FOL = FOL || {};

FOL.mult = {};

FOL.mult.path = "img/multiples/new_";
FOL.mult.div = "#foliage-multiples";
FOL.mult.phases =
    [
	{phase1: "Sept. 17 - Sept. 20"},
	{phase2: "Sept. 21 - Sept. 25"},
	{phase3: "Sept. 26 - Sept. 29"},
	{phase4: "Sept. 30 - Oct. 2"},
	{phase5: "Oct. 3 - Oct. 8"},
	{phase6: "Oct. 9 - Oct. 15"},
	{phase7: "Oct. 16 - Oct. 23"},
	{phase8: "Oct. 24 - Oct. 30"},
	{phase9: "Oct. 31 - Nov. 6"},
	{phase10: "Nov. 7 - Nov. 14"},
	{phase11: "Past Peak"}
    ];

FOL.mult.colors = [
    {"Very low": "rgb(4,76,34)"},
    {"Low": "rgb(251,254,9)"},
    {"Moderate": "rgb(254,130,9)"},
    {"Peak": "rgb(217,9,9)"},
    {"Past peak": "rgb(82,12,15)"}
]

FOL.mult.legend = function(){
    var detached = d3.select(document.createElement("div"));

    detached.selectAll(".legend-item")
	.data(FOL.mult.colors)
	.enter()
	.append("label")
	.classed("legend-item", true)
	.text(function(d){
	    for (k in d){
		return k;
	    }
	})
    	.style("background-color", function(d){
	    for (k in d){
		var bg = d[k];
		return bg;
	    }
	})
        .style("color", function(d){
	    for (k in d){
		if (k == "Low"){
		    return "#222";
		}
	    }
	});


    
    return detached;
}

FOL.mult.go = function(){
    // Add a container
    var container = d3.select(FOL.mult.div)
	.append("div")
	.classed("container", true);

    // Add each multple
    var mults = container.selectAll("div.fol-multiple")
	.data(FOL.mult.phases)
	.enter()
	.append("div")
	.classed("fol-multiple", true)
	.classed("col-xs-4", true)
	.classed("col-sm-3", true)
	.classed("col-md-2", true)

    mults.append("img")
	.classed("border", true)
	.attr("src", function(d){
	    for (k in d){
		return FOL.mult.path + k + ".png";
	    }
	});

    mults.append("label")
    	.classed("date-range", true)
	.text(function(d){

	    for (k in d){
		return d[k];
	    }
	});

    container.append("div")
	.classed("legend", true)
    	.classed("fol-multiple", true)
	.classed("col-xs-4", true)
	.classed("col-sm-3", true)
	.classed("col-md-2", true)
	.html(FOL.mult.legend().html());

    //
    var bottom = container.append("div")
	.classed("row", true);
    
    bottom.append("div")
	.classed("clear-both", true);
    
    // Add sourceline
    bottom.append("div")
	.classed("sourceline", true)
	.text("SOURCE: CT DEEP")
}

FOL.mult.go();
