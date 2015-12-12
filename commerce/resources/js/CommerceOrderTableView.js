/**
 * Class Craft.CommerceOrderTableView
 */
Craft.CommerceOrderTableView = Craft.TableElementIndexView.extend({

    startDate: null,
    endDate: null,

	$chartContainer: null,

	afterInit: function()
    {
		// Add the chart before the table
		this.$chartContainer = $('<svg class="chart"></svg>').prependTo(this.$container);

		// Error
		this.$error = $('<div class="error"/>').prependTo(this.$container);

        this.$chartControls = $('<div class="chart-controls"></div>');
        this.$chartControls.prependTo(this.$container);

        this.$dateRangeWrapper = $('<div class="datewrapper"></div>');
        this.$dateRangeWrapper.appendTo(this.$chartControls);

        this.$dateRange = $('<input type="text" class="text" size="20" autocomplete="off" value="2015-12-02" />');
        this.$dateRange.appendTo(this.$dateRangeWrapper);



        var cur = -1, prv = -1;

        this.$dateRange.datepicker($.extend({

            defaultDate: new Date(2015, 11, 2),

            beforeShowDay: function ( date )
            {
                console.log('beforeShowDay');

                return [true, ( (date.getTime() >= Math.min(prv, cur) && date.getTime() <= Math.max(prv, cur)) ? 'date-range-selected' : '')];
            },

            onSelect: $.proxy(function ( dateText, inst )
            {
                console.log('onSelect');

                inst.inline = true;

                prv = cur;
                cur = (new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).getTime();

                if ( prv == -1 || prv == cur )
                {
                    prv = cur;
                    this.$dateRange.val( dateText );
                }
                else
                {
                    console.log('b');
                    this.startDate = $.datepicker.formatDate( 'mm/dd/yy', new Date(Math.min(prv,cur)), {} );
                    this.endDate = $.datepicker.formatDate( 'mm/dd/yy', new Date(Math.max(prv,cur)), {} );
                    this.$dateRange.val( this.startDate+' - '+this.endDate );
                    this.$dateRange.datepicker('hide');
                }


            }, this),

            onClose: $.proxy(function ( dateText, inst )
            {
                inst.inline = false;
            }, this),

            onChangeMonthYear: function ( year, month, inst )
            {
                //prv = cur = -1;
            },

            onAfterUpdate: function ( inst )
            {
                // $('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">Done</button>')
                //     .appendTo($('#jrange div .ui-datepicker-buttonpane'))
                //     .on('click', function () { $('#jrange div').hide(); });
            }

        }, Craft.datepickerOptions));

        this.loadReport();

		this.base();
	},

    loadReport: function()
    {
        var requestData = {
            startDate: this.startDate,
            endDate: this.endDate,
        };

        // Request orders report
        Craft.postActionRequest('commerce/reports/getOrders', requestData, $.proxy(function(response, textStatus)
        {
            if(textStatus == 'success' && typeof(response.error) == 'undefined')
            {
                // Create chart
                if(!this.chart)
                {
                    this.chart = new Craft.charts.Area(this.$chartContainer.get(0), this.params, response);
                }
                else
                {
                    this.chart.loadData(response);
                }
            }
            else
            {
                // Error

                var msg = 'An unknown error occured.';

                if(typeof(response) != 'undefined' && response && typeof(response.error) != 'undefined')
                {
                    msg = response.error;
                }

                this.$error.html(msg);
                this.$error.removeClass('hidden');
            }

        }, this));
    }
});
