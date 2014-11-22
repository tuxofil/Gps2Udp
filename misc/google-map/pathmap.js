// ----------------------------------------------------------------------
// Global variables
// ----------------------------------------------------------------------

// configuration vars
var globalPointsFilename = "points.txt";
var globalDefaultMaxAccuracy = 3000;
var globalDefaultLastDays = 7;
var globalUpdatePeriod = 60000;

// internal vars
var globalMap;
var globalPolyline;
var globalMarkers;
var globalAccuracies;

// ----------------------------------------------------------------------
// Visible control event handlers
// ----------------------------------------------------------------------

function onLastDaysChange(domObj){
    var intVal = parsePositiveInt(domObj, globalDefaultLastDays);
    domObj.goodValue = intVal;
    domObj.value = intVal;
}

function onAccuracyChange(domObj){
    var intVal = parsePositiveInt(domObj, globalDefaultMaxAccuracy);
    domObj.goodValue = intVal;
    domObj.value = intVal;
}

function parsePositiveInt(domObj, defaultValue){
    var intVal = parseInt(domObj.value);
    if(isNaN(intVal))
        intVal =
        (domObj.goodValue)?
        domObj.goodValue:defaultValue;
    if(intVal < 1) intVal = 1;
    return intVal;
}

function onTimeFilterTypeChange(domObj){
    setHidden(
        document.getElementById('spanTimeFilterAbs'),
        domObj.value != 'absolute');
    setHidden(
        document.getElementById('spanTimeFilterRel'),
        domObj.value != 'relative');
}

// ----------------------------------------------------------------------
// Functions
// ----------------------------------------------------------------------

/**
 * Sets or unsets 'hidden' property for the DOM object.
 */
function setHidden(domObj, isHidden){
    if(isHidden){
        domObj.style.display = 'none';
    }else{
        domObj.style.display = '';
    }
}

function getXmlHttp(){
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

function requestPointsLoad(){
    var xmlhttp = getXmlHttp()
    xmlhttp.open('GET', globalPointsFilename, true);
    xmlhttp.onreadystatechange =
        function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    var points = parsePoints(xmlhttp.responseText);
                    drawPath(points);
                }
            }
        };
    xmlhttp.send(null);
}

function parsePoints(text){
    var lines = text.split("\n");
    var i = 0;
    var result = [];
    var accuracy =
        parsePositiveInt(
            document.getElementById('accuracyField'),
            globalDefaultMaxAccuracy);
    var minTime = getMinTime();
    var maxTime = getMaxTime();
    while(i < lines.length){
        var tokens = lines[i].split(" ");
        var time = parseInt(tokens[0]);
        var lat = parseFloat(tokens[1]);
        var lng = parseFloat(tokens[2]);
        var acc = parseFloat(tokens[3]);
        if(acc <= accuracy &&
           time >= minTime &&
           time <= maxTime){
            var ll = new google.maps.LatLng(lat, lng);
            ll.timestamp = time;
            ll.accuracy = acc;
            result.push(ll);
        }
        i++;
    }
    return result;
}

function getMinTime(){
    var domObj = document.getElementById('timeFilterType');
    if(domObj.value == 'absolute'){
        return resetTime(dtp_from.getDate()).getTime() / 1000;
    }else{
        var now = new Date();
        now = resetTime(now);
        domObj = document.getElementById('lastDaysField');
        var lastDays = parsePositiveInt(domObj, globalDefaultLastDays);
        return now.getTime() / 1000 - (lastDays - 1) * 86400;
    }
}

function getMaxTime(){
    var domObj = document.getElementById('timeFilterType');
    if(domObj.value == 'absolute'){
        return resetTime(dtp_to.getDate()).getTime() / 1000 + 86400;
    }else{
        var now = new Date();
        return now.getTime() / 1000;
    }
}

function resetTime(date){
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
}

function roundNumber(number, precision){
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function drawPath(points){
    // clear path, markers and accuracies
    if(globalPolyline != null)
        globalPolyline.setMap(null);
    if(globalMarkers != null)
        for(var i = 0; i < globalMarkers.length; i++)
            globalMarkers[i].setMap(null);
    if(globalAccuracies != null)
        for(var i = 0; i < globalAccuracies.length; i++)
            globalAccuracies[i].setMap(null);
    // draw path
    globalPolyline =
        new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: '#000080',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
    globalPolyline.setMap(globalMap);
    // draw markers
    globalMarkers = [];
    var start_time = 0;
    if(points.length > 0)
        start_time = points[0].timestamp;
    var total_distance = 0;
    for(var i = 0; i < points.length; i++){
        var date = new Date(points[i].timestamp * 1000);
        var hint = date.toUTCString() + '\n' +
            'Accuracy: ' + points[i].accuracy + ' meters';
        if(i > 0){
            var distance =
                google.maps.geometry.spherical.computeDistanceBetween(
                    points[i - 1], points[i]);
            if(distance > 0){
                hint += '\nDistance: ' + roundNumber((distance / 1000), 2) + ' km';
                total_distance += distance;
                var elapsed = points[i].timestamp - points[i - 1].timestamp;
                var speed = (distance / 1000) / (elapsed / 3600);
                hint += '\nAverage speed: ' + roundNumber(speed, 1) + ' km/h';
            }
            hint += '\nTotal distance: ' + Math.round(total_distance / 1000) + ' km';
            var elapsed = points[i].timestamp - start_time;
            var total_speed = (total_distance / 1000) / (elapsed / 3600);
            hint += '\nTotal average speed: ' + roundNumber(total_speed, 1) + ' km/h';
        }
        var marker = new google.maps.Marker({
            position: points[i],
            map: globalMap,
            title: hint
        });
        globalMarkers.push(marker);
    }
    // draw accuracy circles
    globalAccuracies = [];
    for(var i = 0; i < points.length; i++){
        var circle = new google.maps.Circle({
            center: points[i],
            radius: points[i].accuracy,
            clickable: false,
            fillColor: '#0000FF',
            fillOpacity: 0.07,
            strokeWeight: 0,
            map: globalMap
        });
        globalAccuracies.push(circle);
    }
}

function initialize() {
    // load and parse checkpoints
    var xmlhttp = getXmlHttp()
    xmlhttp.open('GET', globalPointsFilename, false);
    xmlhttp.send(null);
    var center = new google.maps.LatLng(0, 0);
    var zoom = 0;
    var points = [];
    if(xmlhttp.status == 200)
        points = parsePoints(xmlhttp.responseText);
    if(points.length > 0){
        // center the map into a last checkpoint
        center = points[points.length - 1];
        zoom = 14;
    }
    var mapOptions =
        {
            center: center,
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    globalMap =
        new google.maps.Map(
            document.getElementById("map_canvas"),
            mapOptions);
    drawPath(points);
}

google.maps.event.addDomListener(window, 'load', initialize);
window.setInterval("requestPointsLoad()", globalUpdatePeriod);
