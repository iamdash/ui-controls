var dataSet = [];


// var startAngle = -130;
// var endAngle = startAngle + 260; 
var DIAL = function(options) {

    var _this = this,
        valueArc;

    var defaults = {
        type: 'single-select', // single-select, range-select, drag-range
        width: 395,
        height: 395,
        donutWidth: 25,
        range: 25,
        startAngle: 0,
        endAngle: 360,
        selector: '#dial',
        numDegrees: 360,
        piePadding: 0.01
    };

    this.options = _.extend({}, defaults, options);

    this.options.endAngle = this.options.startAngle + this.options.numDegrees;

    var radius = Math.min(this.options.width, this.options.height) / 2;


    this.initDial = function() {


        var svg = d3.select(this.options.selector)
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .attr('class', 'circle-segments')
            .append('g')
            .attr('transform', 'translate(' + (this.options.width / 2) + ',' + (this.options.height / 2) + ')');

        var arc = d3.arc()
            .innerRadius(radius - this.options.donutWidth)
            .outerRadius(radius)

        var drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on('end', dragended)

        function dragstarted(d) {
            d3.select(this).raise().classed('dragging', true);
        }
        var position = [0, 0];
        var d;

        function dragged(d) {

            var halfDW = _this.options.donutWidth;
            d3.event.sourceEvent.stopPropagation();
            d_from_origin = Math.sqrt(Math.pow(d3.event.x, 2) + Math.pow(d3.event.y, 2));


            alpha = Math.acos(d3.event.x / d_from_origin);

            var _atanXY = Math.atan(d3.event.x / d3.event.y)

            _this.valueArc.transition()
                .duration(0)
                .attrTween("d", arcTween(-_atanXY));

            d3.select(this)
                .attr("cx", d.x = (radius - (halfDW / 2)) * Math.cos(alpha))
                .attr("cy", d.y = d3.event.y < 0 ? -(radius - (halfDW / 2)) * Math.sin(alpha) : (radius - (halfDW / 2)) * Math.sin(alpha));

        }

        function dragended(d, i) {
            d3.select(this).classed('dragging', false);
        }

        ////////////////////////////////////////////
        // ARC START
        ////////////////////////////////////////////
        this.arc = d3.arc()
            .innerRadius(radius - this.options.donutWidth + 2)
            .outerRadius(radius - 2)

        this.valueArc = svg.append('path').datum({
                startAngle: _this.options.startAngle * (Math.PI / 180),
                endAngle: _this.options.startAngle * (Math.PI / 180)
            })
            .style("fill", "orange")
            .attr('id', 'value-arc')
            .attr('stroke', 'orange')
            .attr('stroke-width', 4 - this.options.piePadding)
            .attr("d", this.arc)
            .each(function(d) { this._current = d; });

        _this.setArcEndAngle(this.valueArc, _this.options.endAngle - 100, _this.options.startAngle);

        ////////////////////////////////////////////
        // ARC END
        ////////////////////////////////////////////

        ////////////////////////////////////////////
        // HANDLE START
        ////////////////////////////////////////////

        this.handleArc = svg.append('circle')
            .attr('r', radius - this.options.donutWidth)
            .attr('stroke', 'black')
            .attr('strokeWidth', 20)
            .attr('fill', 'none')
            .attr('class', 'circumference');

        this.handleData = [{
            x: 0,
            y: -radius + (_this.options.donutWidth / 2)
        }];

        this.handle = svg.append("g")
            .attr("class", "dot")
            .selectAll('circle')
            .data(this.handleData)
            .enter().append("circle")
            .attr("r", this.options.donutWidth / 2)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .call(drag);

        ////////////////////////////////////////////
        // HANDLE END
        ////////////////////////////////////////////

    }

    function arcTween(newAngle) {

        return function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function(t) {
                d.endAngle = interpolate(t);
                return _this.arc(d);
            };
        };
    }
    this.setArcEndAngle = function(arc, endAngle) {

        endAngle = endAngle * (Math.PI / 180);

        console.log('endAngle is', endAngle)

        arc.transition()
            .duration(250)
            .attrTween("d", arcTween(endAngle));
    }


    this.initDial();

    return this;

}

$(document).ready(function() {
    var dial = new DIAL({
        type: 'drag-range',
        startAngle: -130,
        numDegrees: 260,
        range: 52,
        selector: '#dial1',
        height: 400,
        width: 400
    });


})