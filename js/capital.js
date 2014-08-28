var liquidmon = {};

(function() {

// Taken from http://bost.ocks.org/mike/chart/time-series-chart.js
// with modifications

  liquidmon.timeSeriesChart = function timeSeriesChart() {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 760,
    height = 120,
    xValue = function(d) { return d[0]; },
    // TODO(ptc) need a way to support multiple lines
    yValue = function(d) { return d[1]; },
    xScale = d3.time.scale(),
    yScale = d3.scale.linear(),
    // TODO(ptc)  yTicks/yFormat/yAxis should be exposed
    yTicks = 8,
    yFormat = function(d) { return yScale.tickFormat(yTicks, ".1p")(d/100.0); },
    tooltipFormat = function(d) { return yScale.tickFormat(yTicks, ".3p")(d/100.0); },
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
    yAxis = d3.svg.axis().scale(yScale).orient("left")
      .tickSize(3, 0).ticks(yTicks).tickFormat(yFormat),
    area = d3.svg.area().x(X).y1(Y),
    line = d3.svg.line().x(X).y(Y);

    function chart(selection) {
      selection.each(function(data) {

        // Convert data to standard representation greedily;
        // this is needed for nondeterministic accessors.
        data = data.map(function(d, i) {
          return [xValue.call(data, d, i), yValue.call(data, d, i)];
        });

        // Update the x-scale.
        xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

        // Update the y-scale.
        var yMax = d3.max(data, function(d) { return d[1]; });
        yScale
          .domain([0, yMax * 1.1])
          .range([height - margin.top - margin.bottom, 0]);

        // Select the svg element, if it exists.
        var svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        var gEnter = svg.enter().append("svg").append("g");
        gEnter.append("path").attr("class", "area");
        gEnter.append("path").attr("class", "line");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");

        var focus = gEnter.append("g")
          .attr("class", "focus")
          .style("display", "none");

        var marker = focus.append("circle")
          .attr("r", 6)
          .attr("class", "marker");

        var tooltipOffsetXLeft = -100;
        var tooltipOffsetXRight = 10;
        var tooltipOffsetY = -18;
        var tooltip = focus.append("text")
          .attr("dx", tooltipOffsetXRight)
          .attr("dy", tooltipOffsetY)
          .style("pointer-events", "none")
          .style("class", "tooltip");

        // Update the outer dimensions.
        svg .attr("width", width)
          .attr("height", height);

        // Update the inner dimensions.
        var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Update the area path.
        g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

        // Update the line path.
        g.select(".line")
          .attr("d", line);

        // Update the x-axis.
        g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

        // Update the y-axis.
        g.select(".y.axis")
          .call(yAxis);


        // Create custom bisector
        var bisect = d3.bisector(function(d) {
          return d[0];
        }).right;

        // Add mouse event handlers for marker
        svg.on("mouseover", function() {
          focus.style("display", "inherit");
        }).on("mouseout", function() {
          focus.style("display", "none")
        }).on("mousemove", function() {
          var mouse = d3.mouse(this);
          mouse[0] = mouse[0] - margin.left;
          var timestamp = xScale.invert(mouse[0]),
          index = bisect(data, timestamp),
          startDatum = data[index - 1],
          endDatum = data[index];

          var datum;
          if (!startDatum) {
            datum = endDatum;
          } else if (!endDatum) {
            datum = startDatum;
          } else {
            datum = (timestamp - startDatum[0]) > (endDatum[0] - timestamp)
              ? endDatum
              : startDatum;
          }
          if (datum) {
            var cx = xScale(datum[0]);
            var cy = yScale(datum[1]);

            focus.attr("transform", "translate(" + cx + "," + cy + ")");

            var magicFuckingNumber = 180;
            if (cx + magicFuckingNumber > width) {
              tooltip.attr("dx", tooltipOffsetXLeft);
            } else {
              tooltip.attr("dx", tooltipOffsetXRight);
            }

            var year = datum[0].getFullYear();
            var value = tooltipFormat(datum[1]);
            tooltip.text(year + ", " + value);
          }
        });
      });
    }

    // The x-accessor for the path generator; xScale ∘ xValue.
    function X(d) {
      return xScale(d[0]);
    }

    // The y-accessor for the path generator; yScale ∘ yValue.
    function Y(d) {
      return yScale(d[1]);
    }

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.yFormat = function(_) {
      if (!arguments.length) return yFormat;
      yFormat = _;
      yAxis.tickFormat(yFormat);
      return chart;
    };

    chart.tooltipFormat = function(_) {
      if (!arguments.length) return tooltipFormat;
      tooltipFormat = _;
      return chart;
    };

    return chart;
  };

})();
