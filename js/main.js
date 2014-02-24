
$(function() {
    if (OpeningHours) {
        $.getJSON('tests/1_version.json', function(data) {
            if (data) {
                OpeningHours.create({
                    json: data,
                    lang: "en",
                    daysForm: 'normal',
                    openingHoursContainer: '.openingHours'
                });
            } 
        });
    } 
});