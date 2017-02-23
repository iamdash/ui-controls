// https://jsfiddle.net/soundar24/1usqdvc9/1/
// https://jsfiddle.net/soundar24/1usqdvc9/2/

var fn1 = $.fn.roundSlider.prototype._setProperties;
$.fn.roundSlider.prototype._setProperties = function() {
    fn1.apply(this);

    var o = this.options,
        r = o.radius,
        d = r * 2,
        r1 = r - o.width / 2,
        svgNS = "http://www.w3.org/2000/svg";
    this._circum = Math.PI * (r1 * 2);
    this.$circle = this._$circle = $(document.createElementNS(svgNS, "circle"));
    this.$circle
        .attr({
            fill: "transparent",
            class: "rs-transition",
            cx: r,
            cy: r,
            r: r1,
            "stroke-width": o.width - this._border(false),
            "stroke-dasharray": this._circum
        })
        .css({
            "transform-origin": "50% 50%",
            transform: "rotate(" + (o.startAngle + 180) + "deg)"
        });
    var $svg = $(document.createElementNS(svgNS, "svg"));
    $svg.attr({ height: d, width: d }).append(this.$circle);
    // this.innerContainer.append($svg);
    // this.innerContainer.append('<div class="rs-overlay rs-transition rs-bg-color" style="transform: rotate(590deg);"></div>')
};

// $.fn.roundSlider.prototype._addSeperator = function(pos, cls) {
//     var line = this.$createElement("span.rs-seperator rs-border"),
//         width = this.options.width,
//         _border = this._border();
//     var lineWrap = this.$createElement("span.rs-bar rs-transition " + cls).append(line).rsRotate(pos);
//     this.container.append(lineWrap);
//     return lineWrap;
// }

var $createElement = function(tag) {
    var t = tag.split(".");
    return $(document.createElement(t[0])).addClass(t[1] || "");
};



$.fn.roundSlider.prototype._addSegment = function(pos, cls) {

    var segmentWrap = $createElement(".segment-wrap"),
        height = this.options.width,
        width = this.options.width,
        _border = this._border();

    // segment.text(pos);

    // var rotate = rotatePoint({ x: 220, y: 220 }, { x: width, y: height }, pos);

    // console.log(rotate);

    // var lineWrap = $createElement("span.rs-segment-wrap rs-transition " + cls)
    //     .append(segment);
    // lineWrap.css({
    //     height: width,
    //     width: width,
    //     top: rotate.y,
    //     left: rotate.x
    // });
    // this.container.append(segmentWrap);
    return segmentWrap;
};

var fn2 = $.fn.roundSlider.prototype._changeSliderValue;
$.fn.roundSlider.prototype._changeSliderValue = function(val, deg) {
    fn2.apply(this, arguments);
    deg = deg - this.options.startAngle;

    if (this._rangeSlider) {
        this.$svg_box.rsRotate(this._handle1.angle + 180);
        deg = this._handle2.angle - this._handle1.angle;
    }
    var pct = (1 - deg / 360) * this._circum;
    this.$circle.css({ strokeDashoffset: pct });
};

$.fn.roundSlider.prototype.defaults.create = function() {
    var o = this.options;

    var counter = -1;
    var allValues = Array.apply(null, { length: o.max }).map(Number.call, Number);
    // var numItemsArr = o.max;
    // console.log(Array.apply(null, { length: numItemsArr }).map(Number.call, Number))

    // console.log(foo)

    var startAngle = o.startAngle;
    var endAngle = parseInt(o.endAngle);
    var startAnglePos = 360 - startAngle;
    // var shapeContainer = document.createElement('ul');
    // shapeContainer.setAttribute('class', 'circle-container')
    // this.innerContainer.append(shapeContainer)
    // var item = document.createElement('li');

    // var innerCircle = document.createElement('div');
    // innerCircle.setAttribute('class', 'inner-circle-clip')
    // this.innerContainer.append(innerCircle)

    // $(this).append($shapeContainer)

    for (var i = 0; i <= o.max; i += 1) {
        // console.log(startAngle, endAngle)
        var angle = Math.floor(i / o.max * 360) - startAnglePos;

        var numberTag = this._addSegment(angle, "rs-custom-segment");
        var number = numberTag.children();
        if (!Number.isInteger(i)) {
            number
                .clone()
                .css({
                    width: (o.width + this._border()) / o.width,
                    "margin-top": this._border(true) / (-2),
                    "margin-left": "0px",
                    color: "white"
                })
                .appendTo(numberTag);
        }

        // item = document.createElement('li');
        // item.setAttribute('class', 'item');
        // shapeContainer.append(item);
        // console.log(angle, angle + startAnglePos, startAnglePos)
        if (Number.isInteger(i) && angle + startAnglePos < endAngle) {
            // number.clone().css({ "width": (o.width), "margin-top": this._border(true) / -2, "margin-left": "0px" }).appendTo(numberTag);
        }
    }
    // // Appending numbers
    // for (var i = 0; i <= o.max; i += 1) {
    //     var angle = i / o.max * 360;
    //     var numberTag = this._addSeperator(angle, "rs-custom");
    //     var number = numberTag.children();
    //     // if (i % 5 === 0) {
    //     counter++;
    //     val = allValues[counter];
    //     number.removeClass().addClass("rs-number").html('<div class="item"></div>').rsRotate(-angle);
    //     // }
    //     number.append('hi')
    //     if (i == o.min) number.css("margin-left", "-5px");
    // }
};