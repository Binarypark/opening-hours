;
(function($, window, document) {
    var pluginName = 'openingHours',
            defaults = {
                lang: "en",
                weekPeriods: false,
                daysForm: "normal"
            },
    additionalData = "",
            propertyDays = [{"name": "Monday", "hours": []}, {"name": "Tuesday", "hours": []}, {"name": "Wednesday", "hours": []}, {"name": "Thursday", "hours": []}, {"name": "Friday", "hours": []}, {"name": "Saturday", "hours": []}, {"name": "Sunday", "hours": []}];
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._propertyDays = propertyDays;
        this._additionalData = additionalData;
        this.init();
    }

    Plugin.prototype = {
        init: function() {
            this.buildPropertyDays(this.settings.json);
            this.createOpeningHours(this.element, this._propertyDays, this.settings.lang, this.settings.daysForm);
        },
        /*
         * Simple Ajax call 
         * 
         * @param {type} url
         * @param {type} contentType
         * @returns {unresolved}
         */
        getData: function(url, contentType) {
            var data = null;
            var req = new XMLHttpRequest();
            req.open("GET", url, false);
            req.setRequestHeader("Content-Type", contentType);
            req.onreadystatechange = function() {
                if (req.readyState === 4 && req.status === 200) {
                    data = req.responseText;
                }
            };
            req.send(null);
            return data;
        },
        
        getAdditionalData: function(lang) {
            var addData;
            $.ajax({
                type: "GET",
                url: "additionalData.json",
                async: false,
                dataType: "json",
                success: function(data) {
                    addData = data;
                }
            });
            if (addData[lang]) {
                return addData[lang];
            } else {
                return 'language not found!';
            }
        },
        /**
         * Used to add the elements in the propertyDays array
         * @param {type} dayList
         * @param {type} dayPeriod
         * @returns {Boolean}
         */
        checkDayMatch: function(dayList, dayPeriod) {
            if (dayList.name === dayPeriod.dayOfWeek) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 
         * @param {type} dayList
         * @param {type} dayPeriod
         * @returns {undefined}
         */
        addOpeningHours: function(dayList, dayPeriod) {
            if (dayList.hours.length === 0) {
                /*
                 * if there is no opening time in the specific day, we just add an object to the hours list
                 */
                dayList.hours.push({
                    opens: dayPeriod.opens,
                    closes: dayPeriod.closes
                });
            } else {
                var listLength = dayList.hours.length;
                var hours = dayList.hours;
                var boolean;
                for (var i = 0; i < listLength; i++) {
                    if ((moment(hours[i].opens, "h:m:s").hour() === moment(dayPeriod.opens, "h:m:s").hour()) & (moment(hours[i].closes, "h:m:s").hour() === moment(dayPeriod.closes, "h:m:s").hour())) {
                        if ((moment(hours[i].opens, "h:m:s").minute() === moment(dayPeriod.opens, "h:m:s").minute()) & (moment(hours[i].closes, "h:m:s").minute() === moment(dayPeriod.closes, "h:m:s").minute())) {
                            boolean = true;
                            break;
                        } else {
                            boolean = false;
                            break;
                        }
                        //we have to avoid adding 2 objects with the same opening and closing time                  
                    } else {
                        boolean = false;
                    }
                }
                if (!(boolean)) {
                    hours.push({
                        opens: dayPeriod.opens,
                        closes: dayPeriod.closes
                    });
                }
            }
        },
        /**
         * 
         * @param {type} periods
         */
        getWeekPeriod: function(periods) {
            console.log(periods)
            if (periods instanceof Array) {
                for (var i = 0; i < periods.length; i++) {
                    if ((moment().month() > moment(periods[i].validFrom, "YYYY-MM-DD").month()) & (moment().month() < moment(periods[i].validThrough, "YYYY-MM-DD").month())) {
                        return periods[i].weekPeriod;
                    } else if ((moment().month() === moment(periods[i].validFrom, "YYYY-MM-DD").month()) & (moment().month() === moment(periods[i].validThrough, "YYYY-MM-DD").month())) {
                        if ((moment().date() >= moment(periods[i].validFrom, "YYYY-MM-DD").date()) & (moment().date() <= moment(periods[i].validThrough, "YYYY-MM-DD").date())) {

                            return periods[i].weekPeriod;
                            break;
                        } else {
                            continue;
                        }
                    }
                }
            }
        },
        /**
         * We add the opening hours to our ordered array
         * @param {type} data
         * @returns {undefined}
         */
        buildPropertyDays: function(data) {
            //take the weekPeriod array

            var weekPeriod, _this = this;
            if (this.settings.weekPeriods) {

                weekPeriod = this.getWeekPeriod(data);
            } else {
                weekPeriod = data["weekPeriod"];
            }
            try {
                var propertyDays = this._propertyDays;
                $.each(propertyDays, function(days) {

                    $.each(weekPeriod, function(day) {
                        //if we have an Object with the same name, 
                        if (_this.checkDayMatch(propertyDays[days], weekPeriod[day])) {
                            //we add the openingHours
                            _this.addOpeningHours(propertyDays[days], weekPeriod[day]);
                        }
                    });
                });
            } catch (e) {
                console.log(e);
            }
            for (var i = 0; i < this._propertyDays.length; i++) {
                //taking care the opening hours are ordered
                this.arrangeOpeningHours(this._propertyDays[i]);
            }
        },
        /**
         * Use to arrange the Opening Hours from a specific day
         * @param {type} array
         * @returns {unresolved}
         */
        arrangeOpeningHours: function(array) {
            if (array.hours.length > 1) {
                var hours = array.hours;
                for (var i = 0; i <= hours.length - 2; i++) {

                    for (var j = i + 1; j <= hours.length - 1; j++) {

                        if ((moment(hours[i].opens, "h:m:s").hour()) === (moment(hours[j].opens, "h:m:s").hour())) {
                            if ((moment(hours[i].opens, "h:m:s").minute()) > (moment(hours[j].opens, "h:m:s").minute())) {
                                var aux = hours[i];
                                hours[i] = hours[j];
                                hours[j] = aux;
                            } else {
                                continue;
                            }
                        } else if ((moment(hours[i].opens, "h:m:s").hour()) > (moment(hours[j].opens, "h:m:s").hour())) {
                            var aux = hours[i];
                            hours[i] = hours[j];
                            hours[j] = aux;
                        }
                    }
                }
            }
            return array;
        },
        /**
         * Used for the days list from Moment
         * @param {type} arrayList
         * @returns {unresolved}
         */
        shiftList: function(arrayList) {
            arrayList[arrayList.length] = arrayList[0];
            arrayList.shift();
            return arrayList;
        },
        createHeader: function(container, string) {
            var header = $('<div class="header"></div>');
            header.append('<strong>' + string + '</strong>');
            return $(container).append(header);
        },
        checkMatchingHours: function(firstList, secondList) {

            for (var i = 0; i < firstList.length; i++) {
                for (var j = 0; j < secondList.length; j++) {
                    if ((moment(firstList[i].opens, "h:m:s").hour() === moment(secondList[i].opens, "h:m:s").hour()) &
                            (moment(firstList[i].closes, "h:m:s").hour() === moment(secondList[i].closes, "h:m:s").hour())) {
                        if ((moment(firstList[i].opens, "h:m:s").minute() === moment(secondList[i].opens, "h:m:s").minute()) &
                                (moment(firstList[i].closes, "h:m:s").minute() === moment(secondList[i].closes, "h:m:s").minute())) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
        },
        /**
         * Function used to display the Days
         * 
         * @param {type} lang
         * @param {type} daysForm
         * @returns {unresolved}
         */
        createMomentDays: function(lang, daysForm) {
            moment.lang(lang);

            if (daysForm === "short") {
                return this.shiftList(moment.weekdaysShort());
            } else if (daysForm === "min") {
                return this.shiftList(moment.weekdaysMin());
            } else if (daysForm === "normal") {
                return this.shiftList(moment.weekdays());
            }
        },
        serie3: function(array, pos, container, momentDays) {
            var dayContainer = $('<div class="dayContainer"></div>');
            var dayElement = $('<div class="day"></div>');
            var hourElement = $('<div class="hour"></div>');

            if (array[pos].hours.length === 0) {
                dayElement.append(momentDays[pos] + "-");
                var temp = pos + 2;
                for (var j = pos + 2; j < array.length; j++) {
                    if (array[j].hours.length !== 0) {
                        dayElement.append(momentDays[j - 1] + ": ");
                        pos = j - 1;
                        break;
                    } else if ((j === array.length - 1) & (array[j].hours.length === 0)) {
                        dayElement.append(momentDays[j] + ": ");
                        pos = j;
                        break;
                    }
                }
                hourElement.append(this._additionalData.closedString);
            }
            else if (array[pos].hours.length !== 0) {
                if ((this.checkMatchingHours(array[pos].hours, array[pos + 1].hours)) & (this.checkMatchingHours(array[pos + 1].hours, array[pos + 2].hours))) {
                    var temp = pos + 2;
                    dayElement.append(momentDays[pos] + "-");
                    for (var j = temp; j < array.length; j++) {
                        if ((array[j].hours.length === 0) || (!(this.checkMatchingHours(array[pos].hours, array[j].hours)))) {
                            dayElement.append(momentDays[j - 1] + ": ");
                            pos = j - 1;
                            break;
                        } else if ((j === array.length - 1) & (this.checkMatchingHours(array[j].hours, array[pos].hours))) {
                            dayElement.append(momentDays[j] + ": ");
                            pos = j;
                            break;
                        }
                    }

                    for (var x = 0; x < array[temp].hours.length; x++) {
                        if (x === array[temp].hours.length - 1) {
                            hourElement.append(moment(array[temp].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[temp].hours[x].closes, "h:m:s").format('H:mm'));
                        } else {
                            hourElement.append(moment(array[temp].hours[x].opens, "h:m:s").format('H:MM') + "-" + moment(array[temp].hours[x].closes, "h:m:s").format('H:mm') + ", ");
                        }
                    }
                }
                else if ((this.checkMatchingHours(array[pos].hours, array[pos + 1].hours)) & (!(this.checkMatchingHours(array[pos + 1].hours, array[pos + 2].hours)))) {
                    dayElement.append(momentDays[pos] + ", " + momentDays[pos + 1] + ": ");
                    for (var x = 0; x < array[temp].hours.length; x++) {
                        if (x === array[temp].hours.length - 1) {
                            hourElement.append(moment(array[temp].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[temp].hours[x].closes, "h:m:s").format('H:mm'));
                        } else {

                            hourElement.append(moment(array[temp].hours[x].opens, "h:m:s").format('H:MM') + "-" + moment(array[temp].hours[x].closes, "h:m:s").format('H:mm') + ", ");
                        }
                    }
                    pos = pos + 1;
                } else if (!(this.checkMatchingHours(array[pos].hours, array[pos + 1].hours))) {
                    dayElement.append(momentDays[pos] + ": ");
                    for (var x = 0; x < array[pos].hours.length; x++) {
                        if (x === array[pos].hours.length - 1) {
                            hourElement.append(moment(array[pos].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[pos].hours[x].closes, "h:m:s").format('H:mm'));
                        } else {

                            hourElement.append(moment(array[pos].hours[x].opens, "h:m:s").format('H:MM') + "-" + moment(array[pos].hours[x].closes, "h:m:s").format('H:mm') + ", ");
                        }
                    }
                }
            }

            dayContainer.append(dayElement);
            dayContainer.append(hourElement);
            container.append(dayContainer);
            return pos;
        },
        serie2: function(array, pos, container, momentDays) {
            var dayContainer = $('<div class="dayContainer"></div>');
            var dayElement = $('<div class="day"></div>');
            var hourElement = $('<div class="hour"></div>');


            if (array[pos].hours.length === 0) {
                dayElement.append(momentDays[pos] + ", " + momentDays[pos + 1] + ": ");
                hourElement.append(this._additionalData.closedString);
                pos = pos + 1;
            } else {
                if (this.checkMatchingHours(array[pos].hours, array[pos + 1].hours)) {
                    dayElement.append(momentDays[pos] + ", " + momentDays[pos + 1] + ": ");
                    pos = pos + 1;
                } else {
                    dayElement.append(momentDays[pos] + ": ");
                }
                for (var x = 0; x < array[pos].hours.length; x++) {
                    if (x === array[pos].hours.length - 1) {
                        hourElement.append(moment(array[pos].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[pos].hours[x].closes, "h:m:s").format('H:mm'));
                    } else {

                        hourElement.append(moment(array[pos].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[pos].hours[x].closes, "h:m:s").format('H:mm') + ", ");
                    }

                }
            }

            dayContainer.append(dayElement);
            dayContainer.append(hourElement);
            container.append(dayContainer);
            return pos;
        },
        serie1: function(array, pos, container, momentDays) {
            var dayContainer = $('<div class="dayContainer"></div>');
            var dayElement = $('<div class="day"></div>');
            var hourElement = $('<div class="hour"></div>');
            dayElement.append(momentDays[pos] + ": ");
            if (array[pos].hours.length === 0) {
                hourElement.append(this._additionalData.closedString);
            } else {
                for (var x = 0; x < array[pos].hours.length; x++) {
                    if (x === array[pos].hours.length - 1) {
                        hourElement.append(moment(array[pos].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[pos].hours[x].closes, "h:m:s").format('H:mm'));
                    } else {

                        hourElement.append(moment(array[pos].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[pos].hours[x].closes, "h:m:s").format('H:mm') + ", ");
                    }
                }
            }
            dayContainer.append(dayElement);
            dayContainer.append(hourElement);
            container.append(dayContainer);

        },
        /**
         * 
         * @param {type} cont
         * @param {type} days
         * @param {type} lang
         * @param {type} daysType
         * @returns {undefined}
         */
        createOpeningHours: function(cont, days, lang, daysType) {
            var momentDays = this.createMomentDays(lang, daysType);

            var container = $(cont);

            this._additionalData = this.getAdditionalData(lang);

            this.createHeader(container, this._additionalData.header);
            for (var i = 0; i < days.length; i++) {

                if (i < days.length - 2) {
                    if ((days[i].hours.length === days[i + 1].hours.length) & (days[i + 1].hours.length === days[i + 2].hours.length)) {
                        i = this.serie3(days, i, container, momentDays);
                    }
                    else if ((days[i].hours.length === days[i + 1].hours.length) & (days[i + 2].hours.length !== days[i].hours.length)) {
                        i = this.serie2(days, i, container, momentDays);

                    }
                    else if (days[i].hours.length !== days[i + 1].hours.length) {

                        this.serie1(days, i, container, momentDays);
                    }
                }
                else if (i === days.length - 2) {
                    if (days[i].hours.length === days[i + 1].hours.length) {
                        i = this.serie2(days, i, container, momentDays);
                    } else {
                        this.serie1(days, i, container, momentDays);
                    }
                }
                else if (i === days.length - 1) {
                    this.serie1(days, i, container, momentDays);
                }
            }
        }
    };
    $.fn[ pluginName ] = function(options) {
        this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
        // chain jQuery functions
        return this;
    };
})(jQuery, window, document);