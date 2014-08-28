
$(function() {

        $.getJSON('tests/singleWeek.json', function(data){
           
            //$('.openingHoursContainer').empty();
            if (data) {
                
                $('.openingHoursContainer').openingHours({
                    json: data,
                    lang: 'en',
                    daysForm: 'normal'
                });
                $('.openingHoursContainer1').openingHours({
                    json: data,
                    lang: 'de',
                    daysForm: 'short'
                });
            }
       
    });

});