        var AUDEN = AUDEN || {};

        AUDEN.calculator = function() {

            var _this = this;

            this.calculatorData = {
                testText: 'UI Controls',
                numVal: 33,
                calculatedValue: 0
            };

            this.parentEl = 'calculator';
            this.dials = $('.calculator-dial')

            rivets.bind(
                document.querySelector('#calculator'), // bind to the element with id "candy-shop"
                _this.calculatorData
            );

            this.init = function() {
                this.dials.roundSlider({
                    width: 80,
                    radius: 200,
                    //sliderType: "range",
                    circleShape: "custom-quater",
                    value: 1,
                    min: 1,
                    max: 12,
                    step: 1,
                    startAngle: '-40',
                    endAngle: '+260',
                    showTooltip: true,
                    handleShape: "square",
                    // handleSize: "-10",
                    change: function(dialData) {
                        // console.log(dialData)
                    }

                });
                // $('.calculator-dial').roundSlider({
                //     width: 50,
                //     value: "1",
                //     radius: "200",
                //     min: 1,
                //     max: 14,
                //     sliderType: "range",
                //     showTooltip: false,
                //     handleShape: 'square',
                //     step: 1,
                //     startAngle: '-40',
                //     endAngle: '+260',
                // })
            }

        }
        $(document).ready(function() {
            var c = new AUDEN.calculator();
            c.init();
        })