## Telegram APP
# 11/06

1. SERVER: listen to new join sockets and push new user object into userArray

2. SERVER: emit the userArray to client

3. CLIENT: on, userArray

4. CLIENT: emit array.length as room number

5. SERVER: on, join the socket to 'roomnumber' AND emit message to client 

6. CLIENT: recieve message and signal on page USING button color change

# 11/08
7. emit the button color change to all sockets

8. notifier message on MESSAGE board for viewer sockets and broadcast

## roomnumber 是room1-4和main
- SERVER: emit prompt to "room1" when 4th player arrive

<!-- - CLIENT: recieved and append button and listent to button clicked to prompt words -->

- SERVER: 

# 11/09 draw function

1. CLIENT&SERVER: drawDate of room1-4 to next room

2. SERVER: receive drawdata AFTER GAME STARTs and emit to room(i+1) and main_room

3. CLIENT: show gamer its order once they arrive page, using message board

- CLIENT: set countDown (), when room1-3 emited drawing, canvas wipe out in 30s.

- 


<!-- - CLIENT: listen to prompt button "click", to enable draw  -->

- CLIENT: emit draw from room[i] to room[i+1]












// ignore the rest




## Socekt.io - Drawing App Starter Continued
### Adding Namespaces and Rooms
-----
### Local Setup
- `cd` via the commnad line to the project folder
- Run `npm install` to load dependencies listed in package.json
- Open two browser windows both pointing to `localhost:3000` to make sure the app is working
-----
### Namespaces
- STEP 1:	Setup a new Client page

  Create a new folder inside the 'public" folder. You can call it "private" and add a copy of your main html, css and js file. Go to `localhost:3000/private ` to make sure it is working

- STEP 2: Create a unique namespace for this new page on the Server

  On the server, add the following code to index.js:
  ``` 
  //Create another namespace named 'private'
  let private = io.of('/private');
  ```

- STEP 3: Create a unique namespace for this new page on the Client

  On the client, add the following code to the js file inside the private folder:
  ```
  //Open and connect socket
  let socket = io('/private');
  ```

- STEP 4: Update the logic for this "priavte" namespace

  On the server, you can copy the entire `io.on()` function and then change `io` to `private`. 

----
### Rooms

- STEP 5: Create a way for the user to input a room name

  On the client, you can use `window.prompt()` to collect the user's room

  ```
  //Get room name
  let roomName = window.prompt("Create or Join a room");
  console.log(roomName);

- STEP 6: Send the room name to the Server 

  Add the following code after the `window.prompt()` code
  ```
  //Check if a name was entered
  if (roomName){
      //Emit Msg to join the room
      socket.emit('room', {"room": roomName});
  }
  else {
      alert("Please refresh and enter a room name");
  }
  ```

- STEP 7: Receive the room name on the Server within the "private" namespace

  ```
  socket.on('room', (data) => {
    console.log(data.room);
    let roomName = data.room;

    //Code for Steps 7 & 8 go here

  });
  ```

- STEP 8: Add the room name as a property to the socket

  ```
  //Add a room property to the individual
  socket.room = roomName;
  ```

- STEP 9: Add the socket to the room using `.join()`

  ```
  //Add socket
  socket.join(roomName);
  ```

- STEP 10 (OPTIONAL): Send a message to the client confirming the newly joined socket

- STEP 11: Update the `.emit()` functions in the private namespace on the server to send data to the appropriate room

  ```
  let currentRoom = socket.room
  private.to(currentRoom).emit('[MESSAGE-NAME', data);
  ```