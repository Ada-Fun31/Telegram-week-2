/*--------------- SETUP ---------------*/
let express = require("express");
let app = express();

app.use("/", express.static("public"));

// Initialize the actual HTTP server //* http baked in node
let http = require("http");
let server = http.createServer(app);

/*--------------- PORT ---------------*/
let port = process.env.PORT || 3000; // annouce to make sure 
server.listen(port, () => {
  console.log("Server listening at port: " + port);
});

/*--------------- Socket.io Code ---------------*/

// create an server instance
let io = require("socket.io");
io = new io.Server(server);


/*----- "client-PRIVATE" connection -----*/
// NameSpace 1) /private

let userNum = 0;
let userArray = [];
let private = io.of("/private")

private.on("connection", (socket) => {

  /*----- user connection -----*/
  const user = { user_room_number: userNum };
  userArray.push(user);
  socket.emit('userArray', userArray);
  socket.emit('gameOn', userArray);

  /*----- sockets(<=4) join SINGLE room -----*/
  socket.on('playerRoom', (joinRoom) => {
    let currentUserNum = joinRoom.number;

    // "room4" msg to "room1"
    if (currentUserNum >= 4) {
      console.log("4th joined room: ", joinRoom.room);
      socket.join(joinRoom.room);
      //*----- room button color change
      socket.emit('msg', { msg: currentUserNum })

      //*----- prompt button for room1 -----*//
      socket.to('room1').emit('prompt', { msg_one: "START", msg_two: "THE GAME", msg_three: "BY", msg_four: "CLICK=>" })

      //*----- gamer message
      socket.to('room1').to('room2').to('room3').to('room4').emit('gamer_msg', { msg: "4th gamer on board. Loading game..." })

      // "room1-3"
    } else {
      console.log("new user joined room: ", joinRoom.room);
      socket.join(joinRoom.room);
      //*----- room button color change
      socket.emit('msg', { msg: currentUserNum })
    }
  })

  /*----- sockets(>4) join MAIN room -----*/
  socket.on('to main room', (main_room) => {
    console.log(main_room);
    socket.join(main_room.viewer_room)

    socket.emit('to main room', main_room.viewer_msg);
    socket.broadcast.emit('main room msg', main_room.broadcast_msg);
  });


  /*----- Button color change show occupancy -----*/
  socket.on('other user', (msg) => {
    // console.log(msg);
    // ----------注意这个broadcast 可能到main room
    socket.broadcast.emit('signal_all', msg)
  });

  userNum = userNum + 1;

  socket.on("disconnect", () => {
    userNum = userNum - 1;
    userArray.pop();
    //
    console.log("a user left room");
  })

  console.log("currently", socket.conn.server.clientsCount, "users in the room");
  // console.log(userArray);


  /*--------------- DRAWING DATA ---------------*/

  //*----- room1 click on PROMPT button
  //canvas clear & title change for all rooms
  socket.on('clear canvas', (msg) => {
    socket.broadcast.emit('clear canvas', msg)
  })

  //*----- enable "room1-3" drawing show only on the room[i+1] & main_room 
  socket.on('enable draw room', (playerClient) => {

    // this is the user array
    let playerArray = playerClient.playerArray;
    let totalUser = playerArray.length
    console.log(totalUser);
    // let roomArray = [];

    let player;
    let roomNum;
    let drawToName;
    let drawObj;

    if (totalUser <= 3) {
      for (let i = 0; i <= (totalUser - 1); i++) {
        player = playerArray[i].user_room_number;
        roomNum = player + 2;
        drawToName = "room" + roomNum;
        roomObj = { room: drawToName, msg: player + 1 }

        console.log("player: ", player);
        console.log("drawToName: ", drawToName);
      };
      socket.emit('drawToRoom', roomObj)
    } else {
      console.log("4th player, dont do anything")
    }

  });

  //*----- room1-3 sockets, emit the drawData to specified room
  socket.on('ToRoom', (roomObj) => {
    // console.log(roomObj);
    let roomName = roomObj.room

    // --------------this is the drawing listener
    socket.on('data', (mousePos) => {
      console.log(mousePos);
      socket.to(roomName).to("main_room").emit('mousePos', mousePos);
    })
  })

  /*--------------- COUNTDOWN CODE ---------------*/
  //*----- prompt to room1
  socket.on('room1 count down', (msg) => {
    socket.emit('room1 count down', msg)
  })

  //*----- room2 count down
  socket.on('room2 count down', (msg) => {
    socket.to("room2").emit('room2 count down', msg)
  })

  //*----- room3 count down
  socket.on('room3 count down', (msg) => {
    socket.to("room3").emit('room3 count down', msg)
  })

  //*----- room4 count down
  socket.on('room4 count down', (msg) => {
    socket.to("room4").emit('room4 count down', msg)
  })
  //room4 guess to room1
  socket.on('final',(compare)=>{
    console.log(compare);
    socket.to("room1").emit('compare',compare)
  })

  // final
  socket.on('win message',(msg)=>{
    console.log(msg);
    socket.broadcast.emit('win message',msg)
    socket.emit('win message_',msg)
  });

  socket.on('fail message',(msg)=>{
    console.log(msg);
    socket.broadcast.emit('fail message',msg)
    socket.emit('fail message_',msg)
  });

});// end of PRIVATE namespace




// socket.id = userArray()
// console.
// socket.broadcast.emit('dataAll', drawData);

// }); // end of PRIVATE namespace






// xxxxxxxxxxxxxxxxxxxxxxxxxxx ignore the rest


// // 2) listen for a Private-Client event
// // 2) recieve data  
// socket.on('data', (drawData) => {

//   // 3) Send a response to all, exclude the sender
//   socket.broadcast.emit('dataAll', drawData);

// })


/*--------------- Window Prompt ---------------*/
//User room recieved
// socket.on('user', (data) => {
//   console.log("The user is: ", data.user);
//   let userRoom = data.user;

//   //Add a room property to socket
//   socket.room = userRoom;

//   //Add socket
//   socket.join(userRoom);

//   // Send a message to the client confirming the new socket
//   private.emit('newUser', { 'msg': 'success', 'userName': userRoom });

// })


// Listen for "client-ADMIN" connection
// NameSpace 2) /admin
let admin = io.of('/admin')
admin.on("connection", (socket) => {
  socket.join("mainRoom");

  console.log("- we have A Admin-Connection now -", socket.id);

  // 2) listen for a client event (in this case drawing "emit")
  socket.on('data', (drawData) => {

    // console.log("Drawing from Main");
    // console.log(socket.id, drawData);

    // 3) Send msg to ALL clients (incuding sender itself)
    socket.to("mainRoom").emit('dataAll', drawData);
    // io.emit('dataAll', drawData);
  })
})
