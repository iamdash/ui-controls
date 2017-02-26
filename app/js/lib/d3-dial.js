var dataSet = [];

var currentState = {
        currValue: 2,
        prevValue: 0
    }
    // rivets.bind(
    //     document.querySelector('#calculator'), // bind to the element with id "candy-shop"
    //     currentState
    // );

// var startAngle = -130;
// var endAngle = startAngle + 260; 
var DIAL = function(options) {

    var _this = this;
    var defaults = {
        type: 'single-select', // single-select, range-select, drag-range
        width: 395,
        height: 395,
        donutWidth: 25,
        range: 25,
        startAngle: 0,
        endAngle: 360,
        domElement: '#dial',
        numDegrees: 360
    };

    this.options = _.extend({}, defaults, options);

    this.options.endAngle = this.options.startAngle + this.options.numDegrees;

    var radius = Math.min(this.options.width, this.options.height) / 2;

    this.setData = function() {

        var datum = []
        var size = this.options.numDegrees / this.options.range;

        for (var i = 0; i < this.options.range; i++) {
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

    this.initDial = function() {

        this.dataSet = this.setData();

        var svg = d3.select(this.options.domElement)
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .attr('class', 'circle-segments')
            .append('g')
            .attr('transform', 'translate(' + (this.options.width / 2) + ',' + (this.options.height / 2) + ')');

        var arc = d3.arc()
            .innerRadius(radius - this.options.donutWidth) // UPDATED
            .outerRadius(radius)

        var pie = d3.pie()
            // .padAngle(0.03)
            .value(function(d) {
                return d.count;
            })
            .startAngle(this.options.startAngle * (Math.PI / 180))
            .endAngle(this.options.endAngle * (Math.PI / 180))
            .sort(null);

        var path = svg.selectAll('path')
            .data(pie(this.dataSet))
            .enter()
            .append('path')
            .attr("data-item-number", function(d) {
                return d.data.itemNumber;
            })
            .attr('d', arc)
            .attr('class', function(d, i) {
                return 'pie-segment ' + d.data.class
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', function(d, i) {
                return 6
            })
            .attr('fill', function(d, i) {
                return d.data.fill;
            }).on('click', function(d, i) {
                _this.setValue(this, d, i)
            }).each(function(d, i) {
                console.log(i)
                if (i === currentState.currValue) {
                    _this.fillSegments(this, i)
                }
            });

        if (this.options.type === 'drag-range') {
            var total = 0;
            var angularScale = d3.scaleLinear().range([0, 360]).domain([0, total]);
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
                d = d3.event;
                console.log(this);
                var coordinates = d3.mouse(svg.node());
                var x = coordinates[0] - radius;
                var y = coordinates[1] - radius;
                var newAngle = Math.atan2(y, x) * 57.2957795;

                if (newAngle < 0) {
                    newAngle = 360 + newAngle;
                }
                d.absoluteValue = angularScale.invert(newAngle);
                console.log(d.absoluteValue)

            }

            function dragended(d, i) {
                console.log(this)
                d3.select(this).classed('dragging', false);
            }

            var dragSegment = d3.arc()
                .innerRadius(radius - this.options.donutWidth + 2)
                .outerRadius(radius - 2)
                .startAngle(this.options.startAngle * (Math.PI / 180))
                .endAngle((this.options.endAngle - 40) * (Math.PI / 180)).call(drag)

            var draw = function(newAngle) {
                svg.append("path")
                    .attr('id', 'drag-arc')
                    .attr('class', 'drag-arc')
                    .attr("d", dragSegment)
                    .attr({
                        transform: function(d) {
                            return 'rotate(' + angularScale(newAngle) + ') translate(' + radius + ',0)'
                        }
                    })

            }

            draw();





        }

    }

    this.setValue = function(element, data, value) {
        // var data = d.data;
        this.toggleSelected(element, data, value)
    }

    // Fills segments based on selected value
    this.fillSegments = function(element, value) {

        if (this.options.type === 'range-select') {
            this.fillRange(element, value)
        } else {
            this.selectSingleSegment(element, value);
        }
    }

    this.selectSingleSegment = function(element, value) {
        var allSegments = element.parentNode.childNodes;
        allSegments.forEach(function(el) {
            d3.select(el).classed('selected', false);
        });
        d3.select(element).classed('selected', true);
    }

    this.fillRange = function(element, value) {
        // console.log(value)
        var allSegments = element.parentNode.childNodes;
        var numSegments = allSegments.length;
        var dir = 'increase';
        if (value < currentState.currValue) {
            dir = 'decrease';
        }

        if (dir === 'increase') {
            var index = 0;
            for (var i = 0; i < numSegments; i++) {
                setTimeout(function() {
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
                setTimeout(function() {
                    d3.select(allSegments[index]).classed('selected', false);
                    --index;
                }, i * (numSegments / 25));
            }
        }
    }

    this.toggleSelected = function(element, data, value) {
        this.fillSegments(element, value)
        currentState.currValue = value;
        data.isSelected = !data.isSelected;
    }

    this.initDial();

    return this;

}

$(document).ready(function() {
    var dial = new DIAL({
        type: 'drag-range',
        startAngle: -130,
        numDegrees: 260,
        range: 52
    });
})