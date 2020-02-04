module.exports = function (io) {
    'use strict';
    var fs = require('fs');
    var connections = [];
    var Files = {};
    var fs = require('fs');
    var jwt = require('jsonwebtoken');
    moment = require('moment');
    config = require('../../server/config');

    var functions = require('../../server/functions');
    var USERS = {};
    io.use(function(socket, next){

                
        //console.log(moment().format("YYYY-MM-DD H:m:s"));
        //console.log(socket.handshake.query.token);
        let token = socket.handshake.headers['authtoken'];

        if (socket.handshake.query && socket.handshake.query.token){
          jwt.verify(socket.handshake.query.token, config.jwt_secret , function(err, decoded) {
            if(err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
            next();
          });
        } else if(token != undefined && token != ''){
            console.log(token);
            jwt.verify(token, config.jwt_secret , function(err, decoded) {
                if(err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }    
      })
      .on('connection', function(socket) {
            // Connection now authenticated to receive further events
            socket.join(socket.decoded.user_id, () => {});

            //console.log(socket.decoded.user_id);
            //USERS[socket.decoded.user_id] = socket;
            socket.on('message', function(message) {
                io.emit('message', message);
            });
            socket.on("send_message", function (data) {
                //console.log(data);
                let insArray = { 
                    sender_id: socket.decoded.user_id, 
                    receiver_id: data.user_id, 
                    message: data.message, 
                    created_at: moment().format("YYYY-MM-DD H:m:s"),
                    //ago : moment().format("MMMM D,Y h:m A"),
                    //ago : moment().format("M D,Y H:m:s"),
                };

                functions.insert("message_master", insArray ,  function (result) {
                })

                let insArray22 = { 
                    sender_id: socket.decoded.user_id, 
                    receiver_id: data.user_id, 
                    message: data.message, 
                    created_at: moment().format("YYYY-MM-DD H:m:s"),
                    ago : moment().format("MMMM D,Y h:m A"),
                    
                };
                
                io.sockets.in(data.user_id).emit("new_message", { messages: insArray22 });
                io.sockets.in(socket.decoded.user_id).emit("send_message", { messages: insArray22 });

                //USERS[data.user_id].emit("new_message", { messages: insArray });
                //USERS[socket.decoded.user_id].emit("new_message", { messages: data });
                //io.emit("new_message", { messages: data });
            })



      });

  
    //     socket.on("send_message", function (data) {
    //        // console.log(USERS);
    //         io.emit("new_message", { messages: data });
    //     })

    //     socket.on('loggedIn', function (data) {
    //         console.log(data);
    //         console.log("loggedIn");
    //         io.emit("loggedIn", data);
    //     })
    //     socket.on('test', function (data) {
    //         console.log(data);
    //     })


    //     socket.on('disconnect', function () {
    //         if (USERS[socket.username] == undefined) {
    //             delete USERS[socket.username];
    //         }
    //         socket.emit("disconnected");
    //         connections.splice(connections.indexOf(socket), 1);
    //         console.log("%d user(s) connected.", connections.length);
    //     })

    // });
};