function generateBubblePlot(config) {
    var data = config.data,
        sectors = data["sectors"];
    var html = config.html,
        width = config.width,
        height = config.height;
    var svg = d3.select(html).append("svg")
        .attr("width", width)
        .attr("height", height);

    var color = d3.scaleOrdinal()
        .domain(sectors)
        .range(config.colorscale);

    var z = d3.scaleLinear()
        .domain([-20, 20])
        .range(["red", "green"]);

    var tooltip = d3.select(html).append("div").attr("class", "toolTip");

    var pack = d3.pack() //creates a new pack layout with default settings: https://github.com/d3/d3-hierarchy/blob/master/README.md#pack
        .size([width, height])
        .padding(1.5);

    var root = d3.hierarchy(data) //https://github.com/d3/d3-hierarchy/blob/master/README.md#hierarchy
        .sum(function(d) {
            return d.mktcap;
        })
        .sort(function(a, b) {
            return b.value - a.value;
        });
    var node = svg.selectAll(".node")
        .data(pack(root).leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("circle")
        .attr("id", function(d) {
            return d.id;
        })
        .attr("class", function(d) {
            return d.data.sector.replace(/\//g, '').replace(/\s/g, "").toLowerCase()
        })
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", "lightgray")
        .on("mousemove", function(d) {
            d3.selectAll("." + d.data.sector.replace(/\//g, '').replace(/\s/g, "").toLowerCase()).style("fill", d3.rgb(color(d.data.sector)).darker(1));
            d3.selectAll("#" + d.data.sector.replace(/\//g, '').replace(/\s/g, "").toLowerCase() + " .area").style("fill", d3.rgb(color(d.data.sector)).darker(1));
            tooltip
                .style("left", d3.event.pageX + 20 + "px")
                .style("top", d3.event.pageY - 60 + "px")
                .style("display", "inline-block")
                .html((d.data.ticker.toUpperCase()) + "<br>" + "YTD: " + "<span style=color:" + rgb2hex(z(d.data.ytd)) + ">" + Math.round(d.data.ytd * 100) / 100 + "%" + "</span>" + "<br>" + "Market Cap: " + "$" + (Math.round(d.data.mktcap * 100) / 100) / 1000 + "B");
        })
        .on("mouseout", function(d) {
            d3.selectAll("." + d.data.sector.replace(/\//g, '').replace(/\s/g, "").toLowerCase()).style("fill", "lightgray");
            d3.selectAll("#" + d.data.sector.replace(/\//g, '').replace(/\s/g, "").toLowerCase() + " .area").style("fill", "none");
            tooltip.style("display", "none");
        });

    function rgb2hex(rgb) {
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
    }

}