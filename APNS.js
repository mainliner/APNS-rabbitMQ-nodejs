var apns = require("apn");
var Subscriber = require("./models/Subscriber.js");
var fs = require('fs');
var pushLogfile = fs.createWriteStream('push.log',{flags:'a'});

var _log = function(msg) {
    console.log(msg);
};

var amqp = require('amqp');

var connection = amqp.createConnection({ host: "localhost", port: 5672 });

connection.on('ready',function(){
    console.log('connect to the APNS Queue');
    connection.exchange('router', {type: 'direct',autoDelete: false,confirm: true}, function(exchange){
        connection.queue('APNS',{exclusive: false} ,function(queue){
            queue.bind('router','A');
            queue.subscribe(function(msg){
                var encoded_payload = unescape(msg.data);
                var payload = JSON.parse(encoded_payload); //JSON dict
                var starId = payload.starId;
                var message = payload.message;
                var badge = parseInt(payload.badge,10) || 0;
                doPushMessage(starId, message, badge, function(err) {
                    if (err) {  
                        _log(err);
                    } else {
                        _log('pushed!');
                    }
                });
            });
        });
    });
});

var doPushMessage = function(starId, message, badge, callback){
    _log("pushing starid's Subscriber: " + starId);
    getSubscribersbystarId(starId, function(err,devices){
        if(err){
            return callback(err);
        }
        if(devices){
            var connectionOptions = {
            cert: "certs/apns_cert.pem",
            key: "certs/apns_key.unencrypted.pem",
            /* legacy: true */
            };
            var apnsConnection = new apns.Connection(connectionOptions);
            apnsConnection.on("connected", function(openSockets) {
                          _log("connected to apns!");
                        });

            apnsConnection.on("disconnected", function(openSockets) {
                          _log("disconnected from apns!");
                        });

            apnsConnection.on("transmitted", function(note, device) {
                          _log("sent note to device: " + device);
                        });

            apnsConnection.on("error", function(err) {
                          _log("apns connection error: " + err);
                        });

            apnsConnection.on("socketError", function(err) {
                          _log("socket error: " + error);
                        });
            for (var i in devices) {
                var device = devices[i];
                var deviceToken = device.deviceToken;

                if (!validateDeviceToken(deviceToken)) {
                    continue;
                }

                var apnsDevice = new apns.Device(deviceToken);

                var note = new apns.Notification();
                note.badge = badge;
                note.alert = message;
                note.sound = "default";

                apnsConnection.pushNotification(note, apnsDevice);

                _log("sending note to deviceToken: " + deviceToken);
            }

            apnsConnection.shutdown();
            callback(null);
        }else{
            callback(null);
        }
    });
};

var validateDeviceToken = function(token) {
    if (token.length < 64) {
        return false;
    }
    return true;
};

var getSubscribersbystarId = function(starId, callback) {

    Subscriber.getSubscriberbyStarId(starId,function(err,devices){
        if(err){
            return callback(err);
        }else if(devices){
            return callback(null,devices);
        }else{
            return callback(null,null);
        }
    });
};