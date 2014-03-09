/**
 * 
 * Opening Hours framework 
 * 
 */


var OpeningHours = (function() {

    /*
     * we assume the json file is not ordered
     * therefore we add the elements from json in an ordered array
     */
    var propertyDays = [{"name": "Monday", "hours": []}, {"name": "Tuesday", "hours": []}, {"name": "Wednesday", "hours": []}, {"name": "Thursday", "hours": []}, {"name": "Friday", "hours": []}, {"name": "Saturday", "hours": []}, {"name": "Sunday", "hours": []}];
    /*
     * 
     * here we keep additional data like the string used for the days when the company is closed
     * or for the Header of the container
     */
    var additionalData = "";
    /*
     * Simple Ajax call 
     * 
     * @param {type} url
     * @param {type} contentType
     * @returns {unresolved}
     */
    getData = function(url, contentType) {
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
    };
    /*
     * Get the JSON file using Ajax
     * 
     * @param {type} url
     * @returns {undefined}
     */
    getJsonFile = function(url) {
        return JSON.parse(getData(url, 'text/html;charset=utf-8;'));
    };

    getAdditionalData = function(lang) {
        var addData = getJsonFile('additionalData.json');

        if (addData[lang]) {
            return addData[lang];
        } else {
            return 'language not found!';
        }
    };
    /**
     * Used to add the elements in the propertyDays array
     * @param {type} dayList
     * @param {type} dayPeriod
     * @returns {Boolean}
     */
    checkDayMatch = function(dayList, dayPeriod) {
        if (dayList.name === dayPeriod.dayOfWeek) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 
     * @param {type} dayList
     * @param {type} dayPeriod
     * @returns {undefined}
     */
    addOpeningHours = function(dayList, dayPeriod) {
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
    };

    /**
     * The lang and daysForm property are optional when calling OpeningHours.create({});
     * Therefore we use default values
     * @param {type} defaultObject
     * @param {type} mainOptions
     * @returns {undefined}
     */
    checkDefaultOptions = function(defaultObject, mainOptions) {
        if (!(mainOptions.hasOwnProperty("lang"))) {
            mainOptions.lang = defaultObject.lang;
        }
        if (!(mainOptions.hasOwnProperty("daysForm"))) {
            mainOptions.daysForm = defaultObject.daysForm;
        }
        if (!(mainOptions.hasOwnProperty("weekPeriods"))) {
            mainOptions.weekPeriods = defaultObject.weekPeriods;
        }
    };
    /**
     * 
     * @param {type} periods
     */
    getWeekPeriod = function(periods) {
        if ( periods instanceof Array ){       
           
            for (var i = 0; i < periods.length; i++) {
               
                if ((moment().month() >= moment(periods[i].validFrom, "YYYY-MM-DD").month()) & (moment().month() <= moment(periods[i].validThrough).month())){
                    if ((moment().date() >= moment(periods[i].validFrom, "YYYY-MM-DD").date()) & (moment().date() <= moment(periods[i].validThrough).date())){
                        return periods[i].weekPeriod;
                        break;
                    } else {
                        continue;
                    }
                }
            }
        }
    };
    /**
     * We add the opening hours to our ordered array
     * @param {type} data
     * @returns {undefined}
     */
    buildPropertyDays = function(data) {
        //take the weekPeriod array
        var weekPeriod;
        if (data.weekPeriods === 'true'){
            weekPeriod = getWeekPeriod(data.json);
        } else {
            weekPeriod = data.json["weekPeriod"];            
        }    
        try {
            $.each(propertyDays, function(days) {
                $.each(weekPeriod, function(day) {
                    //if we have an Object with the same name, 
                    if (checkDayMatch(propertyDays[days], weekPeriod[day])) {
                        //we add the openingHours
                        addOpeningHours(propertyDays[days], weekPeriod[day]);
                    }
                });
            });
        } catch (e) {
            console.log(e);
        }
        for (var i = 0; i < propertyDays.length; i++) {
            //taking care the opening hours are ordered
            orderOpeningHours(propertyDays[i]);
        }
    };

    /**
     * Use to order the Opening Hours from a specific day
     * @param {type} array
     * @returns {unresolved}
     */
    orderOpeningHours = function(array) {
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
    };

    /**
     * Used for the days list from Moment
     * @param {type} arrayList
     * @returns {unresolved}
     */
    shiftList = function(arrayList) {
        arrayList[arrayList.length] = arrayList[0];
        arrayList.shift();
        return arrayList;
    };

    createHeader = function(container, string) {
        var header = $('<div class="header"></div>');
        header.append('<strong>' + string + '</strong>');
        return $(container).append(header);
    };

    checkMatchingHours = function(firstList, secondList) {

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
    };

    /**
     * Function used to display the Days
     * 
     * @param {type} lang
     * @param {type} daysForm
     * @returns {unresolved}
     */
    createMomentDays = function(lang, daysForm) {
        moment.lang(lang);

        if (daysForm === "short") {
            return shiftList(moment.weekdaysShort());
        } else if (daysForm === "min") {
            return shiftList(moment.weekdaysMin());
        } else if (daysForm === "normal") {
            return shiftList(moment.weekdays());
        }
    };

    serie3 = function(array, pos, container, momentDays, additionalData) {
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
            hourElement.append(additionalData.closedString);
        }
        else if (array[pos].hours.length !== 0) {
            if ((checkMatchingHours(array[pos].hours, array[pos + 1].hours)) & (checkMatchingHours(array[pos + 1].hours, array[pos + 2].hours))) {
                var temp = pos + 2;
                dayElement.append(momentDays[pos] + "-");
                for (var j = temp; j < array.length; j++) {
                    if ((array[j].hours.length === 0) || (!(checkMatchingHours(array[pos].hours, array[j].hours)))) {
                        dayElement.append(momentDays[j - 1] + ": ");
                        pos = j - 1;
                        break;
                    } else if ((j === array.length - 1) & (checkMatchingHours(array[j].hours, array[pos].hours))) {
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
            else if ((checkMatchingHours(array[pos].hours, array[pos + 1].hours)) & (!(checkMatchingHours(array[pos + 1].hours, array[pos + 2].hours)))) {
                dayElement.append(momentDays[pos] + ", " + momentDays[pos + 1] + ": ");
                for (var x = 0; x < array[temp].hours.length; x++) {
                    if (x === array[temp].hours.length - 1) {
                        hourElement.append(moment(array[temp].hours[x].opens, "h:m:s").format('H:mm') + "-" + moment(array[temp].hours[x].closes, "h:m:s").format('H:mm'));
                    } else {

                        hourElement.append(moment(array[temp].hours[x].opens, "h:m:s").format('H:MM') + "-" + moment(array[temp].hours[x].closes, "h:m:s").format('H:mm') + ", ");
                    }
                }
                pos = pos + 1;
            } else if (!(checkMatchingHours(array[pos].hours, array[pos + 1].hours))) {
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
    };

    serie2 = function(array, pos, container, momentDays, additionalData) {
        var dayContainer = $('<div class="dayContainer"></div>');
        var dayElement = $('<div class="day"></div>');
        var hourElement = $('<div class="hour"></div>');


        if (array[pos].hours.length === 0) {
            dayElement.append(momentDays[pos] + ", " + momentDays[pos + 1] + ": ");
            hourElement.append(additionalData.closedString);
            pos = pos + 1;
        } else {
            if (checkMatchingHours(array[pos].hours, array[pos + 1].hours)) {
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
    };
    serie1 = function(array, pos, container, momentDays, additionalData) {
        var dayContainer = $('<div class="dayContainer"></div>');
        var dayElement = $('<div class="day"></div>');
        var hourElement = $('<div class="hour"></div>');
        dayElement.append(momentDays[pos] + ": ");
        if (array[pos].hours.length === 0) {
            hourElement.append(additionalData.closedString);
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

    };

    /**
     * 
     * @param {type} openingHoursContainer
     * @param {type} days
     * @param {type} lang
     * @param {type} daysType
     * @returns {undefined}
     */
    createOpeningHours = function(openingHoursContainer, days, lang, daysType) {
        var momentDays = createMomentDays(lang, daysType);
       
        var container = $(openingHoursContainer);

        additionalData = getAdditionalData(lang);
        createHeader(openingHoursContainer, additionalData.header);
        for (var i = 0; i < days.length; i++) {

            if (i < days.length - 2) {
                if ((days[i].hours.length === days[i + 1].hours.length) & (days[i + 1].hours.length === days[i + 2].hours.length)) {
                    i = serie3(days, i, container, momentDays, additionalData);
                }
                else if ((days[i].hours.length === days[i + 1].hours.length) & (days[i + 2].hours.length !== days[i].hours.length)) {
                    i = serie2(days, i, container, momentDays, additionalData);

                }
                else if (days[i].hours.length !== days[i + 1].hours.length) {

                    serie1(days, i, container, momentDays, additionalData);
                }
            }
            else if (i === days.length - 2) {
                if (days[i].hours.length === days[i + 1].hours.length) {
                    i = serie2(days, i, container, momentDays, additionalData);
                } else {
                    serie1(days, i, container, momentDays, additionalData);
                }
            }
            else if (i === days.length - 1) {
                serie1(days, i, container, momentDays, additionalData);
            }
        }
    };

    return {
        create: function(options) {
            buildPropertyDays(options);
            checkDefaultOptions(OpeningHours.default, options);
            createOpeningHours(options.openingHoursContainer, propertyDays, options.lang, options.daysForm);
        }
    };
})();

OpeningHours.default = ({
    lang: "en",
    weekPeriods: "no",
    daysForm: "normal"
});