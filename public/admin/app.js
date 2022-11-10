// initiating function : do something when client connected
let socket = io('/admin');

//listen for confirmation of connection
socket.on('connect', () => {
    console.log("Connected")
});

/*----- socket transmission -----*/
let myR;
let myG;
let myB;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);

    myR = random(255);
    myG = random(255);
    myB = random(255);

    // 4) ALL Clients Receive Message from Server 
    //* every "socket" recieves 'dataAll' object emitted by "io", and use function "drawPos" on client end
    socket.on('dataAll', (obj) => {
        console.log("Everyone recieved the data!")
        console.log(obj)
        drawPos(obj);
    })
}

function draw() {
}

//* The "mouseMoved"created the (data object) of mouse moving
//* Then 1) created the data object "mousePos" and emited to server
function mouseMoved() {

    // 自己画
    noFill();
    stroke(255, 0, 0);
    circle(mouseX, mouseY, 50);

    // 1) emit the draw event to server
    let mousePos = {
        x: mouseX,
        y: mouseY,
        r: myR,
        g: myG,
        b: myB
    };
    socket.emit('data', mousePos);
}

//* though the data object has changed name, the data structure remain "mousePos" = {x:mouseX, y:mouseY}
function drawPos(posObj) {

    // 别人的画
    noFill();
    stroke(posObj.r,posObj.g, posObj.b);
    ellipse(posObj.x, posObj.y, 30)
}