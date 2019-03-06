const connectController = require("./connect")
const disconnectController = require("./disconnect")
const testController = require("./test")
const UserAuth = require("../../services/UserAuth")
const models = require("../../models/models")
const gamePlayState = require("./../../game_engine/game_play");
const player = gamePlayState.player;

/**
 * Listens to the io object passed for a connection event,
 * and connects the socket controllers to the passed socket
 * object.
 *  */
const listen = (io) => {
    io.on("connection", socket => connectControllers(socket))
}

const connectControllers = (socket) => {
    //connectController and disconnectController should not expect
    //data payloads
    
    connectController(socket)
    socket.on("disconnect", () => disconnectController(socket))
    socket.on("test", data => testController(socket, data))

    // signup listener
    socket.on('onSignUp',(data) => {

        UserAuth.validateRegistration(data, (res) => {

            if(res) {
                socket.emit('signUpResponse',{success:false});
            }

            else {

                new_user = models.user(data.username, data.email, data.password)
                UserAuth.registerUser(new_user, (res) => {

                    if(res) {
                        socket.emit('signUpResponse',{success:false});
                    }
                    else {
                        socket.emit('signUpResponse',{success:true});
                    }
                    
                });
            }
        });
       
    });

    // login listener
    socket.on('onLogin', (data) => {

    	UserAuth.login(data, function(res) {

            if(res) {
                socket.emit('signInResponse',{success:false});
            }

            else {
                socket.emit('signInResponse',{success:true});
            }
        });

    });

    // input listeners
    socket.on('onKeyDown', (data) => {
        if (data.keyDown == 87) {
            player.CInput.up = true;
            console.log("W Pressed")
        }
        if (data.keyDown == 65) {
            player.CInput.left = true;
            console.log("A Pressed")
        }
        if (data.keyDown == 83) {
            player.CInput.down = true;
            console.log("S Pressed")
        }
        if (data.keyDown == 68) {
            player.CInput.right = true;
            console.log("D Pressed")
        }
        
    });

    socket.on('onKeyUp', (data) => {
        if (data.keyUp == 87) {
            player.CInput.up = false;
            console.log("W Released")
        }
        if (data.keyUp == 65) {
            player.CInput.left = false;
            console.log("A Released")
        }
        if (data.keyUp == 83) {
            player.CInput.down = false;
            console.log("S Released")
        }
        if (data.keyUp == 68) {
            player.CInput.right = false;
            console.log("D Released")
        }
    })
}

module.exports = {
    listen
};