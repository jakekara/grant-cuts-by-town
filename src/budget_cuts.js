// var d3 = require("d3-selection");
var d3 = Object.assign({}, require("d3-dsv"), require("d3-request"), require("d3-selection"));

var numeral = require("numeraljs");

var data_file = "./data/output/town_runs.csv";
var diff_col = "diff"

var total_18_col = "TOTAL Statutory Formula Aid_FY 2018";
var total_17_col = "TOTAL Statutory Formula Aid_FY 2017";
var town_col = "Town_Town";

var go = function(data){

    var data = data.map(function(r){
	r["diff"] = numeral(r[total_18_col]).value() - numeral(r[total_17_col]).value()
	return r;
    })

    // console.log(data);
    // var data = data.filter(function(d){
    // 	return (numeral(d[total_col]).value() != 0
    // 		&& numeral(d["cumulative total_diff fy 18 gov rec vs gov rec ii"]) != 0
    // 		&& Number(d["grantee"].indexOf("Various") < 0));
    // });

    var sel = d3.select("#container");

    var items = sel.selectAll(".item")
	.data(data).enter().append("div")
	.classed("item", true)
	.classed("neg", function(d){
	    if (Number(d[diff_col]) < 0 ) return true;
	    return false;
	})
    	.classed("pos", function(d){
	    if (Number(d[diff_col]) > 0 ) return true;
	    return false;
	});


    var heads = items.append("h3")
	.html(function(d){
	    var orig = numeral(d[total_17_col]).value();
	    // var diff = d["cumulative total_diff fy 18 gov rec vs gov rec ii"];
	    var diff = numeral(d[diff_col]).value();

	    return d[town_col] + " " + numeral(diff / orig).format("+0%") + " <small>" + numeral(diff).format("+$0,0").replace("$+","+$") + " <a hre=''>(Click for details)</a></small>";
	});


    var table = items.append("table");

    var thead = table.append("thead").append("tr");

    var tbody = table.append("tbody");
    
    var topics = [];
    
    var cols = {"FY 2017":"FY 2017",
		// "gov rec original fy 18":"gov rec original fy 18",
		// "gov rec original fy 19":"gov rec original fy 19",
		"FY 2018":"Executive order",
		// "gov rec revised fy 19":"gov rec revised fy 19"
	       }

    var topics = {"pilot state owned real property":"aid for tax-emempt state property",
		  "pilot colleges hospitals":"aid for tax-exempt colleges/hospitals",
		  "mashantucket pequot and mohegan fund grant":"casino slot aid",
		  "town aid road grant":"town aid road grant",
		  "local capital improvement locip ":"local capital improvement locip ",
		  "adult education ":"adult education ",
		  "education cost sharing ":"education cost sharing ",
		  "special education":"special education",
		  "grants for municipal projects":"grants for municipal projects",
		  "mrsf municipal revenue sharing grant":"municipal revenue sharing grant",
		  "mrsf additional payment in lieu of taxes ":"additional payment in lieu of taxes ",
		  "mrsf motor vehicle property tax grants":"motor vehicle property tax grants",
		  "mrsf urban stabilization grants":"urban stabilization grants",
		  "total statutory formula aid ":"total statutory formula aid ",
		  "less reimbursement from towns for teachers retirement":"less reimbursement from towns for teachers retirement",
		  "local property tax revenue on hospital real property ":"local property tax revenue on hospital real property "
		 };

    var topics = {
	"PILOT StateOwned Real Property":"Payment in lieu of taxes (PILOT) State-owned Real Property",
	"PILOT Colleges  Hospitals":"PILOT Collegets and hospitals",
	"Mashantucket Pequot And Mohegan Fund Grant":"Mashantucket Pequot And Mohegan Fund",
	"Adult Education":"Adult education",
	"Education Cost Sharing":"Education Cost Sharing",
	"MRSA Municipal Revenue Sharing Grant":"Municipal Revenue Sharing (MRSA)",
	"MRSA Additional Payment in Lieu of Taxes":"MRSA - Payment in Lieu of Taxes",
	"MRSA Motor Vehicle Property Tax Grants":"MRSA Motor Vehicle Property Tax Grants",
    }


    thead.append("td").text("");

    thead.selectAll(".col")
	.data(
	    Object.keys(cols)
	)
	.enter()
	.append("th")
	.classed("col", true)
	.text(function(d){
	    return cols[d];
	});
    
    var rows = tbody.selectAll("tr")
	.data(Object.keys(topics))
	.enter()
	.append("tr");

    rows.append("th").classed("title", true).text(function(d){
	return topics[d];
    })
	.attr("data-topic", function(d){ return d; });

    rows.selectAll(".col")
	.data(function(d, i){

	    var ret = [];

	    // console.log(data[i]);
	    // console.log(d3.select(this.parentNode.parentNode.parentNode).data()[0]);
	    var row_data = d3.select(this.parentNode.parentNode.parentNode).data()[0];
	    Object.keys(cols).forEach(function(a){

		// console.log(d, a, row_data);
		try{
		    ret.push(row_data[ d + "_" + a]);
		}
		catch(e){
		    ret.push("--");
		}
	    });

	    return ret;
	})
	.enter()
	.append("td")
	.classed("col", true)
	.text(function(d, i){
	    if ( typeof(d) == "undefined" ) return d;
	    if ( d == "--") return d;
	    // console.log(d);
	    if ( isNaN(d.trim().replace("$","").replace(",",""))
		 && numeral(d).value() == 0) {
		console.log("isNaN", d.trim().replace("$","").replace(",",""),numeral(d).value())
		return d;
	    }
	    return numeral(d).format("$0,0");
	});

    
    items.on("click", function(){
	var that = this;

	if (d3.select(this).classed("selected") == true)
	    d3.select(this).classed("selected", false);
	else if (d3.select(this).classed("selected") == false)
	    d3.select(this).classed("selected", true);
    });

    var update_search = function(){
	// console.log("Update search called");
	// console.log(d3.select("#searchbar").node().value);

	var search_term = d3.select("#searchbar").node().value.trim();

	d3.selectAll(".item").style("display","none");

	if (search_term == "") return;

	d3.selectAll(".item")
	    .style("display", function(){
		
		if (d3.select(this).text()
		    .toUpperCase().indexOf(search_term.toUpperCase()) >= 0)
		    return "block";
		return "none";
	    });
	
	
    }

    d3.select("#searchbar").on("keyup", update_search);

    d3.select("#searchbar").attr("value", "Hartford");

    update_search();
    
    d3.select("#searchbar").attr("value", null);
    
}

// go(data);
d3.csv(data_file, go);

