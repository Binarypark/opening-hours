    #OpeningHours.js#

An easy-to-use library for rendering your company's Opening Hours. All you need is JSON, [jQuery](http://jquery.com/) and [momentjs](http://momentjs.com/)

## Get Started

### Step 1 - Link files

 Link the [jQuery](http://jquery.com/ ), [momentjs](http://momentjs.com/) and OpeningHours libraries somewhere in the ```<head>``` of your document.

```html
<link rel="stylesheet" href="OpeningHours.css" type="text/css" />
<script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.min.js"></script>
<script type="text/javascript" src="moment-with-langs.js"></script>
<script type="text/javascript" src="OpeningHours.js"></script>
```

### Step 2 - the JSON file

Write the JSON file containing the information about the days of the week where there are opening hours. The JSON file should contain just the days when there are opening hours, following the format:
```
    "dayOfWeek" : Name of the day
    "opens" : The opening time - written in format HH:MM:SS
    "closes : The closing time - written in format HH:MM:SS
```
You can find more examples in the folder ```tests```:

```json
{
    "weekPeriod": [
        {
            "dayOfWeek": "Monday",
            "opens": "11:00:00",
            "closes": "18:00:00"
        },
        {
            "dayOfWeek": "Tuesday",
            "opens": "11:00:00",
            "closes": "18:00:00"
        },
        {
            "dayOfWeek": "Wednesday",
            "opens": "11:00:00",
            "closes": "18:00:00"
        },
        {
            "dayOfWeek": "Saturday",
            "opens": "14:00:00",
            "closes": "18:00:00"
        },
        {
            "dayOfWeek": "Friday",
            "opens": "11:00:00",
            "closes": "18:00:00"
        }
    ]
}
```

### Step 3 - Add the container

Add the div container where you want to render the opening hours.

```html
<div class="openingHours">
</div>
```

### Step 4 - Create the opening hours

Add the following JavaScript code into the ```<head>``` of your document, under the links from ```Step 1```

```javascript
$(function() {
    if (OpeningHours) {
         $.getJSON('tests/multipleWeeks_version.json', function(data) {
            if (data) {
              $('.openingHours').openingHours({
                   //options goes here
              });
           }
        });
     } 
});
```

## Options available
 
```... more to come soon .... ```