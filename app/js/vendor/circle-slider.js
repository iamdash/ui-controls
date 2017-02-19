/**
 * @license Miriam Zusin | The MIT License (MIT) http://opensource.org/licenses/MIT
 */
;
(function($) {
    'use strict';

    /**
     * canvas supported?
     * @return {boolean}
     */
    var isCanvasSupported = function() {
        return !!document.createElement('canvas').getContext;
    };

    /**
     * init events
     * @param {Object} self
     */
    var initEvents = function(self) {

        /**
         * on mouse over
         */
        self.$root.on('mousedown', function(evt) {

            evt.preventDefault();

            if (self.handle1.isMouseInside(evt.pageX, evt.pageY, self.angle)) {
                self.mouseDown = true;
                self.activeHandle = 1;
            }

            if (self.settings.isRange && self.handle2.isMouseInside(evt.pageX, evt.pageY, self.angle2)) {
                self.mouseDown = true;
                self.activeHandle = 2;
            }
        });

        /**
         * on mouse over
         */
        $(document).on('mouseup', function(evt) {
            self.mouseDown = false;
        });

        /**
         * on mouse over
         */
        $(document).on('mousemove', function(evt) {

            var oldAngles, newAngle;

            evt.preventDefault();

            if (self.mouseDown) {

                oldAngles = {
                    oldAngle1: self.angle,
                    oldAngle2: self.angle2
                };

                newAngle = jQuery.fn.circleSlider.vectors.getAngleByMousePosition(self.canvasPos, self.shapeCenter, evt.pageX, evt.pageY);

                loop(self, oldAngles, newAngle);
            }
        });

        /**
         * on mouse mouse wheel
         */
        self.$root.on('mousewheel DOMMouseScroll', function(evt) {

            var deltaY, oldAngles, newAngle;

            evt.preventDefault();

            oldAngles = {
                oldAngle1: self.angle,
                oldAngle2: self.angle2
            };

            deltaY = evt['originalEvent']['wheelDelta'];

            if (deltaY === undefined) {
                deltaY = evt['originalEvent']['detail'] || 0;
            }

            newAngle = self.angle;

            if (!self.activeHandle) {
                self.activeHandle = 1;
            }

            if (self.activeHandle === 2) {
                newAngle = self.angle2;
            }

            if (deltaY >= 0) {
                newAngle += self.settings.mousewheelStep;
            } else {
                newAngle -= self.settings.mousewheelStep;
            }

            loop(self, oldAngles, jQuery.fn.circleSlider.vectors.toPositiveAngle(newAngle));
        });

        /**
         * on bg image loaded
         */
        self.$root.on('image-loaded', function(e, settings) {

            if (settings) {
                self.settings = settings;
            }

            loop(self, {
                oldAngle1: self.angle,
                oldAngle2: self.angle2
            }, undefined);
        });
    };

    /**
     * movement loop
     * @param {Object} self
     * @param {Object} oldAngles
     * @param {Number|undefined} newAngle: should be 0 - 359 degrees
     */
    var loop = function(self, oldAngles, newAngle) {

        var ifNewAngleInRange;

        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

        //get current old angle (for roatet effects)
        if (self.activeHandle === 1) {
            self.backgroundShape.draw(oldAngles.oldAngle1, newAngle);
        } else {
            self.backgroundShape.draw(oldAngles.oldAngle2, newAngle);
        }

        if (self.settings.angle2Defined) {
            self.pathShape.draw(oldAngles.oldAngle1, oldAngles.oldAngle2);
        }

        if (self.settings.hasArrow) {

            //draw arrow
            self.arrow.draw(self.angle, self.handle1.getCenter(self.angle));

            if (self.settings.isRange) {
                self.arrow.draw(self.angle2, self.handle2.getCenter(self.angle2));
            }
        }

        if (newAngle !== undefined && jQuery.fn.circleSlider.vectors.ifAngleInRange(newAngle, self.settings.start, self.settings.end)) {

            if (self.activeHandle === 1) {
                self.angle = newAngle;
            }

            if (self.settings.isRange && self.activeHandle === 2) {
                self.angle2 = newAngle;
            }
        }

        if (jQuery.fn.circleSlider.vectors.ifAngleInRange(self.angle, self.settings.start, self.settings.end)) {

            self.handle1.draw(self.angle, 1, oldAngles.oldAngle1);

            //update degrees element
            self.$degrees.text(Math.round(self.angle));

            if (self.settings.isRange && jQuery.fn.circleSlider.vectors.ifAngleInRange(self.angle2, self.settings.start, self.settings.end)) {

                self.handle2.draw(self.angle2, 2, oldAngles.oldAngle2);

                //update degrees element
                self.$degrees2.text(Math.round(self.angle2));
            }
        }

        //callback
        if ($.isFunction(self.settings.callback)) {
            self.settings.callback(self.angle, self.angle2);
        }
    };

    /**
     * init canvas
     * @param {Object} self
     */
    var initCanvas = function(self) {

        var width, height;

        width = (self.settings.radius + self.settings.padding) * 2;

        if (self.settings.isEllipse) {
            height = (self.settings.radius2 + self.settings.padding) * 2;
        } else {
            height = width;
        }

        self.canvas = $('<canvas width="' + width + '" height="' + height + '" />').get(0);
        self.$root.append(self.canvas).css({
            position: 'relative'
        });
    };

    /**
     * circle slider
     * @constructor
     * @param {Object} userOptions
     * @param {jQueryObject} $root
     */
    var CircleSlider = function(userOptions, $root) {

        this.$root = $root;
        this.$degrees = $root.find('[data-type="degrees"]');
        this.$degrees2 = $root.find('[data-type="degrees2"]');
        this.settings = jQuery.fn.circleSlider.settings.get(userOptions, $root);

        //events
        this.mouseDown = false;
        this.activeHandle = 0;

        //init properties
        initCanvas(this);

        this.canvasPos = this.$root.offset();
        this.context = this.canvas.getContext('2d');

        //iit shapes
        this.backgroundShape = new jQuery.fn.circleSlider.shapes.backgroundShape(this.settings, this.canvas);
        this.pathShape = new jQuery.fn.circleSlider.shapes.pathShape(this.settings, this.canvas);
        this.handle1 = new jQuery.fn.circleSlider.shapes.handleShape(this.settings, this.canvas, this.canvasPos);
        this.handle2 = new jQuery.fn.circleSlider.shapes.handleShape(this.settings, this.canvas, this.canvasPos);
        this.arrow = new jQuery.fn.circleSlider.shapes.arrowShape(this.settings, this.canvas);

        this.angle = this.settings.angle;
        this.angle2 = this.settings.angle2;

        this.startingAngle = this.angle;
        this.endingAngle = this.angle2;

        this.shapeCenter = {
            x: this.settings.radius + this.settings.padding,
            y: this.settings.radius2 + this.settings.padding
        };

        //draw handle first time - by angle		
        loop(this, {
            oldAngle1: this.angle,
            oldAngle2: this.angle2
        }, undefined);

        //init events
        initEvents(this);
    };

    /**
     * circle slider jquery plugin
     * @param {Object} userOptions
     */
    jQuery.fn.circleSlider = function(userOptions) {

        return this.each(function() {

            if (isCanvasSupported()) {

                var $root = jQuery(this),
                    context = new CircleSlider(userOptions, $root);

                $root.data('circleSlider', context);
            }
        });
    };

    /**
     * namesapces
     */
    jQuery.fn.circleSlider.vectors = jQuery.fn.circleSlider.vectors || {};
    jQuery.fn.circleSlider.settings = jQuery.fn.circleSlider.settings || {};
    jQuery.fn.circleSlider.shapes = jQuery.fn.circleSlider.shapes || {};
    jQuery.fn.circleSlider.effects = jQuery.fn.circleSlider.effects || {};

    /**
     * on dom ready
     */
    $(document).ready(function() {

        $('[data-type="circle-slider"]').each(function() {
            $(this).circleSlider();
        });
    });

})(jQuery);