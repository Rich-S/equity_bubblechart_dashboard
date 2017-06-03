function generateParabolaPlot(config) {
    var data = config.data.children.sort(function(a, b) {
            return a.ytd - b.ytd;
        }),
        variance = d3.variance(data.map(function(d) {
            return d.ytd
        }));
    console.log(data)
    var xdomain = d3.extent(data, function(d, i) {
            v = i == 0 ? d.ytd / 1.1 : d.ytd * 1.1;
            return v;
        }),
        pdf = gaussian(xdomain);

    var color = d3.scaleOrdinal()
        .domain(config.scale)
        .range(config.colorscale);

    var z = d3.scaleLinear()
        .domain([-10, 10])
        .range(["red", "green"]);

    var html = config.html,
        W = config.width,
        H = config.height,
        margin = {
            top: H * .125,
            right: W * .020,
            bottom: H * .125,
            left: W * .15
        },
        w = W - margin.left - margin.right,
        h = H - margin.top - margin.bottom;
    var main = d3.select("#" + html).append('svg')
        .attr("width", W)
        .attr("height", H),
        svg = main.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleLinear()
        .domain(xdomain)
        .range([0, w]),
        xAxis = d3.axisBottom(xScale)
        .tickSize(4)
        .ticks(3);

    //    var ydomain = d3.extent(pdf, function(d) {
    //            return d.ycoordinate
    //        }),
    var ydomain = [0, .040],
        yScale = d3.scaleLinear()
        .domain(ydomain)
        .range([h, 0]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

    var line = d3.line()
        .x(function(d) {
            return xScale(d.xcoordinate);
        })
        .y(function(d) {
            return yScale(d.ycoordinate);
        });
    var area = d3.area()
        .x(function(d) {
            return xScale(d.xcoordinate);
        })
        .y0(h)
        .y1(function(d) {
            return yScale(d.ycoordinate);
        });
    svg.append("path")
        .data([pdf])
        .attr("class", "area")
        .attr("d", area);

    var clip = svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h + margin.bottom);

    svg.append("path")
        .datum(pdf)
        .attr("class", "line")
        .attr("d", line);

    var mean = d3.mean(data, function(d) {
        return d.ytd
    });
    var pointerline = svg.append('line')
        .attr('class', 'pointerline')
        .attr('x1', xScale(mean))
        .attr('x2', xScale(mean))
        .attr('y1', yScale(d3.max(pdf, function(d) {
            return d.ycoordinate;
        })))
        .attr('y2', yScale(0))
        .style('stroke', 'grey');

    main
        .on("mousemove", function() {
            d3.selectAll("." + config.data.name.replace(/\//g, '').replace(/\s/g, "").toLowerCase()).style("fill", d3.rgb(color(config.data.name)).darker(1));
            d3.selectAll("#" + config.data.name.replace(/\//g, '').replace(/\s/g, "").toLowerCase() + " .area").style("fill", d3.rgb(color(config.data.name)).darker(1));
        })
        .on("mouseout", function() {
            d3.selectAll("." + config.data.name.replace(/\//g, '').replace(/\s/g, "").toLowerCase()).style("fill", "lightgray");
            d3.selectAll("#" + config.data.name.replace(/\//g, '').replace(/\s/g, "").toLowerCase() + " .area").style("fill", "none");
        })
        .append("foreignObject")
        .attr("class", "label")
        .attr("width", w)
        .attr("height", h / 2)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("dy", "0.5em")
        .style("text-anchor", "beg")
        .style('fill', 'gray')
        .html(config.data.name + ": " + "<span style=color:" + (mean > 0 ? "green" : "red") + ">" + Math.round(mean * 100) / 100 + "%</span>" + "<br>$" + Math.round(config.data.value / 10000) / 100 + "T<br>&sigma;=" + Math.round(Math.sqrt(variance) * 100) / 100);

    //https://en.wikipedia.org/wiki/Normal_distribution//returns the an array of the 
    function gaussian(domain) { //generates the pdf array to for the plotting of the normal distribution curve, with the domain as the input
        var n = data.length,
            mu = d3.mean(data, function(d) {
                return d.ytd
            }),
            variance = d3.variance(data.map(function(d) {
                return d.ytd
            }));
        var gaussianConstant = 1 / Math.sqrt(2 * variance * Math.PI),
            xmin = domain[0],
            xmax = domain[1],
            pdf = [];
        while (xmin < xmax) {
            xmin = parseFloat((xmin + 1).toFixed(2));
            var gaussianVariant = Math.pow((xmin - mu), 2) / (2 * variance);
            pdf.push({
                xcoordinate: xmin,
                ycoordinate: gaussianConstant * Math.exp(-gaussianVariant)
            });
        };
        console.log(pdf);
        return pdf;
    };

}


