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
var DIAL = function(options) {

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
        domElement: '#dial',
        numDegrees: 360
    };

    this.options = _.extend({}, defaults, options);

    this.options.endAngle = this.options.startAngle + this.options.numDegrees;

    var radius = Math.min(this.options.width, this.options.height) / 2;

    this.setData = function() {

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
            .padAngle(0.01)
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
            .attr('fill', function(d, i) {
                return d.data.fill;
            }).on('click', function(d, i) {
                console.log(d)
                _this.setValue(this, d, i)

                _this.setArcEndAngle(_this.valueArc, (d.endAngle - 0.03) / (Math.PI / 180), _this.options.startAngle);

            }).each(function(d, i) {
                if (i === currentState.currValue) {
                    if (_this.options.type !== 'drag-range') {
                        _this.fillSegments(this, i)
                    } else {

                    }
                }

            });

        if (this.options.type === 'drag-range') {

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
                var xy = d3.mouse(svg.node());
                var radians = Math.atan2(xy[0], -xy[1]);
                console.log(valueArc)
                valueArc
                    .startAngle(radians)
                    .endAngle(radians);
            }

            function dragended(d, i) {
                console.log(this)
                d3.select(this).classed('dragging', false);
            }


            this.arc = d3.arc()
                .innerRadius(radius - this.options.donutWidth + 2)
                .outerRadius(radius - 2)

            this.valueArc = svg.append('path').datum({
                    startAngle: _this.options.startAngle * (Math.PI / 180),
                    endAngle: _this.options.startAngle * (Math.PI / 180)
                })
                .style("fill", "orange")
                .attr('id', 'value-arc')
                .attr("d", this.arc)
                .each(function(d) { this._current = d; });

            _this.setArcEndAngle(this.valueArc, _this.options.endAngle - 100, _this.options.startAngle);

            // _this.fillSegments(null, currentState.currValue, { startAngle: this.options.startAngle + 1 })

        }

    }

    this.setValue = function(element, data, value) {
        // var data = d.data;
        this.toggleSelected(element, data, value)
    }

    // Fills segments based on selected value
    this.fillSegments = function(element, value, data) {

        switch (this.options.type) {
            case 'range-select':
                this.fillRange(element, value)
                break;
            case 'single-select':
                this.selectSingleSegment(element, value);
                break;
            case 'drag-range':
                // this.setArcEndAngle(this.valueArc, value, data.startAngle);
                break;
        }
    }

    // Returns a tween for a transition’s "d" attribute, transitioning any selected
    // arcs from their current angle to the specified new angle.
    function arcTween(newAngle) {

        // The function passed to attrTween is invoked for each selected element when
        // the transition starts, and for each element returns the interpolator to use
        // over the course of transition. This function is thus responsible for
        // determining the starting angle of the transition (which is pulled from the
        // element’s bound datum, d.endAngle), and the ending angle (simply the
        // newAngle argument to the enclosing function).
        return function(d) {

            // To interpolate between the two angles, we use the default d3.interpolate.
            // (Internally, this maps to d3.interpolateNumber, since both of the
            // arguments to d3.interpolate are numbers.) The returned function takes a
            // single argument t and returns a number between the starting angle and the
            // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
            // newAngle; and for 0 < t < 1 it returns an angle in-between.
            var interpolate = d3.interpolate(d.endAngle, newAngle);

            // The return value of the attrTween is also a function: the function that
            // we want to run for each tick of the transition. Because we used
            // attrTween("d"), the return value of this last function will be set to the
            // "d" attribute at every tick. (It’s also possible to use transition.tween
            // to run arbitrary code for every tick, say if you want to set multiple
            // attributes from a single function.) The argument t ranges from 0, at the
            // start of the transition, to 1, at the end.
            return function(t) {

                // Calculate the current arc angle based on the transition time, t. Since
                // the t for the transition and the t for the interpolate both range from
                // 0 to 1, we can pass t directly to the interpolator.
                //
                // Note that the interpolated angle is written into the element’s bound
                // data object! This is important: it means that if the transition were
                // interrupted, the data bound to the element would still be consistent
                // with its appearance. Whenever we start a new arc transition, the
                // correct starting angle can be inferred from the data.
                d.endAngle = interpolate(t);

                // Lastly, compute the arc path given the updated data! In effect, this
                // transition uses data-space interpolation: the data is interpolated
                // (that is, the end angle) rather than the path string itself.
                // Interpolating the angles in polar coordinates, rather than the raw path
                // string, produces valid intermediate arcs during the transition.
                return _this.arc(d);
            };
        };
    }
    this.setArcEndAngle = function(arc, endAngle) {

        endAngle = endAngle * (Math.PI / 180);

        arc.transition()
            .duration(1000)
            .attrTween("d", arcTween(endAngle));
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
        range: 200
    });
})