// set the dimensions and margins of the graph
var fontSize = 16;

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

d3.json(url)
.then((data) => callback (data))
.catch((err) => console.log(err))

// create a tooltip
var tooltip = d3.select("#dataviz")
.append("div")
.style("opacity", 0)
.attr("id", "tooltip")
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")

function callback(data){

    var margin = {top: 80, right: 25, bottom: 30, left: 100};
    var width = 5 * Math.ceil(data.monthlyVariance.length / 12);
    width = width - margin.left - margin.right;
    var height = 33 * 12;
    height = height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    data.monthlyVariance.forEach(function (val) {
        val.month -= 1;
      });

    var yDom = Array.from(new Set(data.monthlyVariance.map((x) => x.month))).sort((a, b) => a - b);
    var xDom = Array.from(new Set(data.monthlyVariance.map((x) => x.year))).sort((a, b) => a - b);

    // Build X scales and axis:
    var xScale = d3.scaleBand()
        .range([ 0, width ])
        .domain(xDom)
        .padding(0.05);

      // Build Y scales and axis:
    var yScale = d3.scaleBand()
        .range([height, 0])
        .domain(yDom)
        .padding(0.05);


    var xAxis = d3.axisBottom().scale(xScale)
    .tickValues(
        xScale.domain().filter(function (year) {
          // set ticks to years divisible by 10
          return year % 10 === 0;
        })
      )
    .tickFormat(function (year) {
        var date = new Date(0);
        date.setUTCFullYear(year);
        var format = d3.timeFormat('%Y');
        return format(date);
      })
    .tickSize(10, 1);


    var yAxis = d3.axisLeft().scale(yScale)
    .tickValues(yScale.domain())
    .tickFormat(function (month) {
      var date = new Date(0);
      date.setUTCMonth(month);
      var format = d3.timeFormat('%B');
      return format(date);
    })
    .tickSize(10, 1);

    svg.append("g")
        .style("font-size", 15)
        .call(yAxis)
        .attr("id", 'y-axis')
    
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .attr("id", 'x-axis')

    
      // Build color scale
    var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([d3.max(data.monthlyVariance, (d) => d.variance), d3.min(data.monthlyVariance, (d) => d.variance) ])

    var mouseover = function (event, d){
        
        d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("opacity", 1)
    
        tooltip.style("opacity", 1)
        .style("left", (event.pageX +70) + "px")
        .style("top", (event.pageY ) + "px")
        
        var date = new Date(d.year, d.month);
        var str =
            "<span class='date'>" +
            d3.timeFormat('%Y - %B')(date) +
            '</span>' +
            '<br />' +
            "<span class='temperature'>" +
            d3.format('.1f')(data.baseTemperature + d.variance) +
            '&#8451;' +
            '</span>' +
            '<br />' +
            "<span class='variance'>" +
            d3.format('+.1f')(d.variance) +
            '&#8451;' +
            '</span>';
        tooltip.attr('data-year', d.year);
        tooltip.html(str);
    }
    
    var mouseleave = function(d) {
        tooltip
          .style("opacity", 0)
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8)
      }

      // add the squares
    svg.selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", 'cell')
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("data-month", (d) => d.month)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => data.baseTemperature + d.variance)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .style("fill", "blue")
    .style("fill", function(d) { return myColor(d.variance)} )
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)


    // Add title to graph
    svg.append("text")
    .attr("id", 'title')
    .attr("x", 0)
    .attr("y", -50)
    .attr("text-anchor", "left")
    .style("font-size", "22px")
    .text('Monthly Global Land-Surface Temperature');

    var str = data.monthlyVariance[0].year +' - ' + data.monthlyVariance[data.monthlyVariance.length - 1].year + ': base temperature ' + data.baseTemperature +'&#8451;'
    // Add subtitle to graph
    svg.append("text")
    .attr("id", 'description')
    .attr("x", 0)
    .attr("y", -20)
    .attr("text-anchor", "left")
    .style("font-size", "14px")
    .style("fill", "grey")
    .style("max-width", 400)
    .html(str);

 
      // legend

    var colors = []
    for (let i = myColor.domain()[1]; i < myColor.domain()[0]; i += (myColor.domain()[0] - myColor.domain()[1])/12){
        colors.push(i);
    }
    colors.push(myColor.domain()[0])

    var legendHeight = 200;
    var legendBarWidth = 35;
    // add the squares
    var legend = d3.select("#legend")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", legendHeight)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + ", 0)")


    
    legend.selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("class", "legend-rect")
    .attr("x", (d, i) => 300 + i*(legendBarWidth))
    .attr("y", (d) => 10)
    .attr("width", legendBarWidth)
    .attr("height", legendBarWidth)
    .style("fill", "blue")
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .style("fill", (d) => myColor(d))

    legend.selectAll("text")
    .data(colors)
    .enter()
    .append("text")
    .attr("x", (d, i) => 300 + i*(legendBarWidth) + legendBarWidth/2)
    .attr("y", legendBarWidth + 25)
    .style("color",  (d) => myColor(d))
    .style('text-anchor', 'middle')
    .style("font-size", "12px")
    .text( (d) => Math.round((data.baseTemperature + d) * 100) / 100);
    }
