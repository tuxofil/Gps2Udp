// ----------------------------------------------------------------------
// Global variables
// ----------------------------------------------------------------------

// configuration vars
var globalPointsFilename = "points.txt";
var globalMaxAccuracy = 30;
var globalUpdatePeriod = 60000;

// internal vars
var globalMap;
var globalPolyline;

// ----------------------------------------------------------------------
// Functions
// ----------------------------------------------------------------------

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
    while(i < lines.length){
        var tokens = lines[i].split(" ");
        var time = parseInt(tokens[0]);
        var lat = parseFloat(tokens[1]);
        var lng = parseFloat(tokens[2]);
        var acc = parseFloat(tokens[3]);
        if(acc <= globalMaxAccuracy)
            result.push(new google.maps.LatLng(lat, lng));
        i++;
    }
    return result;
}

function drawPath(points){
    if(globalPolyline != null)
        globalPolyline.setMap(null);
    globalPolyline =
        new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: '#000080',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
    globalPolyline.setMap(globalMap);
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
