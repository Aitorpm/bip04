/**
 * Created by aitor on 10/7/16.
 */
$(document).ready(function() {
    var url = 'https://bip04.upc.es:5000';
    var route = [];
    var markers = [];
    var img = document.getElementById("frame");
    var logger = document.getElementById('logger');
    var map;

    //Mi estado conectado o desconectado
    function log(message) {
        if (logger != null) logger.innerHTML = logger.innerHTML + message + "<br/>";
    }

    //Iniciar el mapa
    function initialize() {
        map = new google.maps.Map(document.getElementById("map"),
            {
                zoom: 17,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
    }
    google.maps.event.addDomListener(window, 'load', initialize);


    //Enviar un mensage
    $('#send').click(function refresh() {
        var msg = $('#text').val();
        $('#chat').append("<div class='bubble you'>" + msg + "</div>"
            + "<div style='clear:both;'></div>");

        var scroller = document.getElementById('chatscroll');
        scroller.scrollTop = scroller.scrollHeight;

        $.ajax({
            type: "POST",
            url: url + "/chat/postdirection",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
            data: {
                "message": msg
            }
        }).done(function(){
            $('#text').val('');
        });
    });

    //Enviar una orden
    $(document).keydown(function (e) {
        var keyCode = e.keyCode;
        var msg;

        if (keyCode == 37) msg = "Ir a la izquierda";
        if (keyCode == 38) msg = "Seguir recto";
        if (keyCode == 39) msg = "Ir a la derecha";
        if (keyCode == 40) msg = "Dar media vuelta ";
        if (keyCode == 32) msg = "Parar!";

        if (typeof msg != 'undefined') {
            $('#chat').append("<div class='bubble you'>" + msg + "</div><div style='clear:both;'></div>");

            $.ajax({
                type: "POST",
                url: url + "/chat/postdirection",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8", // this is the default value, so it's optional
                data: {
                    "message": msg
                }
            });
        }

        var scroller = document.getElementById('chatscroll');
        scroller.scrollTop = scroller.scrollHeight;


    });


    /* SOCKET.IO */
    var socket = io.connect(url);

    //Conectarse al servidor de SOCKETS
    socket.on('connect', function () {
        log('connected');
    });

    //Desconectarse del servidor de SOCKETS
    socket.on('disconnect', function () {
        log('disconnected');
    });

    //Recibir el streaming de video
    socket.on('data', function (data) {
        $('#frame').height(200);
        $('#frame').width(200);
        img.src = data;
    });

    //Recibir las coordenadas GPS
    socket.on('coords', function (data) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers.length = 0;
        route.push(new google.maps.LatLng(data.latitude, data.longitude));

        map.setCenter(new google.maps.LatLng(data.latitude, data.longitude));

        var path = new google.maps.Polyline(
            {
                path: route,
                strokeColor: "#FF0000",
                strokeOpacity: 0.7,
                strokeWeight: 3
            });
        path.setMap(map);
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.latitude, data.longitude),
        });
        markers.push(marker);
        marker.setMap(map);
    });

    //Recibir mensages
    socket.on('chat', function (data) {
        if (data !== "undefined") $('#chat').append("<div class='bubble me'>" + data + "</div><div style='clear:both;'></div>");
    });

    /* END SOCKET.IO */
});
