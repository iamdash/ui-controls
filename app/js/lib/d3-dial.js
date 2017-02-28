var dataSet = [];

var currentState = {
    currValue: 2,
    prevValue: 0
}
rivets.bind(
    document.querySelector('#calculator'), // bind to the element with id "candy-shop"
    currentState
);

// var startAngle = -130;
// var endAngle = startAngle + 260; 
var DIAL = function (options) {

    var _this = this,
        valueArc,
        twoPi = Math.PI * 2;



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

    this.setData = function () {

        var datum = []
        var size = this.options.numDegrees / this.options.range;

        for (var i = 0; i <= this.options.range; i++) {
            datum.push({
                fill: 'grey',
                count: size,
                value: i + 1,
                class: 'value-segment',
                isSelected: false,
                isValue: true
            });
        }

        return datum;
    }

    this.initDial = function () {

        this.dataSet = this.setData();

        ////////////////////////////////////////////
        // BASE SVG START
        ////////////////////////////////////////////
        this.svg = d3.select(this.options.selector)
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .attr('class', 'circle-segments')
            .append('g')
            .attr('transform', 'translate(' + (this.options.width / 2) + ',' + (this.options.height / 2) + ')');
        // END//////////////////////////////////
        this.baseArc = d3.arc()
            .innerRadius(radius - this.options.donutWidth) // UPDATED
            .outerRadius(radius)


        var pie = d3.pie()
            // .padAngle(this.options.piePadding)
            .value(function (d) {
                return d.count;
            })
            .startAngle(this.options.startAngle * (Math.PI / 180))
            .endAngle(this.options.endAngle * (Math.PI / 180))
            .sort(null);

        var path = this.svg.selectAll('path')
            .data(pie(this.dataSet))
            .enter()
            .append('path')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr("data-item-number", function (d) {
                return d.data.itemNumber;
            })
            .attr('d', this.baseArc)
            .attr('class', function (d, i) {
                return 'pie-segment ' + d.data.class
            })
            .attr('fill', function (d, i) {
                return d.data.fill;
            }).on('click', function (d, i) {
                _this.setValue(this, d, i)
                if (_this.options.type == 'drag-range') {
                    _this.setArcEndAngle(_this.valueArc, (d.endAngle - _this.options.piePadding) / (Math.PI / 180), _this.options.startAngle);
                }

            }).on("mouseover", function (d) {

            }).each(function (d, i) {
                if (i === currentState.currValue) {
                    if (_this.options.type !== 'drag-range') {
                        _this.fillSegments(this, i)
                    } else {

                    }
                }
            });

        if (this.options.type === 'drag-range') {

            ////////////////////////////////////////////
            // ARC START
            ////////////////////////////////////////////
            this.arc = d3.arc()
                .innerRadius(radius - this.options.donutWidth + 2)
                .outerRadius(radius - 2)

            this.valueArc = this.svg.append('path').datum({
                startAngle: _this.options.startAngle * (Math.PI / 180),
                endAngle: _this.options.startAngle * (Math.PI / 180)
            }).style("fill", "orange")
                .attr('id', 'value-arc')
                .attr('stroke', 'orange')
                .attr('stroke-width', 4 - this.options.piePadding)
                .attr("d", this.arc)
                .each(function (d) { this._current = d; });

            _this.setArcEndAngle(this.valueArc, _this.options.endAngle - 100, _this.options.startAngle);
            // END//////////////////////////////////

            ////////////////////////////////////////////
            // HANDLE START
            ////////////////////////////////////////////
            this.handleArc = this.svg.append('circle')
                .attr('r', radius - this.options.donutWidth)
                .attr('stroke', 'orange')
                .attr('strokeWidth', 20)
                .attr('fill', 'none')
                .attr('class', 'circumference');

            this.handleData = [{
                x: 0,
                y: -radius + (_this.options.donutWidth / 2)
            }];

            this.handle = this.svg.append("g")
                .attr("class", "dot")
                .selectAll('circle')
                .data(this.handleData)
                .enter().append("circle")
                .attr('fill', 'black')
                .attr("r", this.options.donutWidth / 2)
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .call(drag);
            // END//////////////////////////////////
        }

    }

    ////////////////////////////////////////////
    // DRAG EVENTS START
    ////////////////////////////////////////////
    var drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on('end', dragended)

    /**  Drag start event
     ------------------------------------------------------*/
    function dragstarted(d) {
        d3.select(this).raise().classed('dragging', true);
    }

    /** Dragging event
     ------------------------------------------------------*/
    function dragged(d) {

        var halfDW = _this.options.donutWidth;
        d3.event.sourceEvent.stopPropagation();
        var d_from_origin = Math.sqrt(Math.pow(d3.event.x, 2) + Math.pow(d3.event.y, 2));

        // XY Thanks to http://jsfiddle.net/eremita/PSLMR/
        var xy = d3.mouse(_this.handleArc.node());
        var radians = Math.atan2(xy[0], -xy[1]);
        var alpha = Math.acos(d3.event.x / d_from_origin);

        var currentAngle = radians * (180 / Math.PI);

        if (currentAngle < _this.options.startAngle || currentAngle > _this.options.endAngle || d_from_origin < 45) {
            return
        }

        _this.valueArc.transition()
            .duration(0)
            .attrTween("d", _this.arcTween(radians));

        d3.select(this)
            .attr("cx", d.x = (radius - (halfDW / 2)) * Math.cos(alpha))
            .attr("cy", d.y = d3.event.y < 0 ? -(radius - (halfDW / 2)) * Math.sin(alpha) : (radius - (halfDW / 2)) * Math.sin(alpha));

    }
    /** Drag end event
     ------------------------------------------------------*/
    function dragended(d, i) {
        d3.select(this).classed('dragging', false);
    }
    // END//////////////////////////////////


    this.setValue = function (element, data, value) {
        this.setSelected(element, data, value)
    }


    this.setSelected = function (element, data, value) {
        this.fillSegments(element, value)
        currentState.currValue = value;
    }
    // Fills segments based on selected value
    this.fillSegments = function (element, value, data) {

        switch (this.options.type) {
            case 'range-select':
                this.fillRange(element, value)
                break;
            case 'single-select':
                this.selectSingleSegment(element, value);
                break;
        }
    }

    this.arcTween = function(newAngle) {
        return function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);

            return function (t) {

                d.endAngle = interpolate(t);
                return _this.arc(d);
            };
        };
    }

    this.setArcEndAngle = function (arc, endAngle) {
        endAngle = endAngle * (Math.PI / 180);
        arc.transition()
            .duration(250)
            .attrTween("d", _this.arcTween(endAngle));
    }

    this.selectSingleSegment = function (element, value) {
        var allSegments = element.parentNode.childNodes;
        allSegments.forEach(function (el) {
            d3.select(el).classed('selected', false);
        });
        d3.select(element).classed('selected', true);
    }

    this.fillRange = function (element, value) {

        var allSegments = element.parentNode.childNodes;
        var numSegments = allSegments.length;
        var dir = 'increase';
        if (value < currentState.currValue) {
            dir = 'decrease';
        }

        if (dir === 'increase') {
            var index = 0;
            for (var i = 0; i < numSegments; i++) {
                setTimeout(function () {
                    if (index <= value) {
                        d3.select(allSegments[index]).classed('selected', true);
                    } else {
                        d3.select(allSegments[index]).classed('selected', false);
                    }
                    ++index;
                }, i * (numSegments / 25));
            }
        } else {
            var index = currentState.currValue;
            for (var i = currentState.currValue; i > value; i--) {
                setTimeout(function () {
                    d3.select(allSegments[index]).classed('selected', false);
                    --index;
                }, i * (numSegments / 25));
            }
        }
    }

    this.initDial();

    return this;

}

$(document).ready(function () {
    var dial = new DIAL({
        type: 'drag-range',
        startAngle: -130,
        numDegrees: 260,
        range: 200,
        selector: '#dial1',
        height: 400,
        width: 400
    });

    var dial2 = new DIAL({
        type: 'range-select',
        startAngle: -130,
        numDegrees: 260,
        range: 10,
        selector: '#dial2',
        height: 400,
        width: 400
    });

    var dial3 = new DIAL({
        type: 'single-select',
        startAngle: -130,
        numDegrees: 260,
        range: 12,
        selector: '#dial3',
        height: 400,
        width: 400
    });

})