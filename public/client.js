const socket = io();

const message = document.getElementById("message"),
      handle = document.getElementById("handle"),
      output = document.getElementById("output"),
      typing = document.getElementById("typing"),
      button = document.getElementById("button");

message.addEventListener('keypress', () => {
    socket.emit('userTyping', handle.value);
});

button.addEventListener('click', () => {
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    })
    document.getElementById('message').value = "";
});

socket.on("userMessage", (data) => {
    typing.innerHTML = "";
    output.innerHTML += `<p><strong>${data.handle} :</strong>${data.message}</p>`;
});
socket.on('userTyping', (data) => {
    typing.innerHTML = `<p><em>${data} is typing ... </em></p>`;
});

// get the local video and display it with PermissionStatus
const getLvideo = async () => {
    if(navigator.mediaDevices === undefined){
        navigator.mediaDevices = {}
    }

    if(navigator.mediaDevices.getUserMedia === undefined){
        navigator.mediaDevices.getUserMedia = function(constraints){
            let getUserMedia = navigator.getUserMedia || 
                                navigator.webkitGetUserMedia || 
                                navigator.mozGetUserMedia ||
                                navigator.msGetUserMedia;
            if(!getUserMedia){
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
            }
            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }
    // navigator.mediaDevices.getUserMedia = navigator.getUserMedia || 
    //                          navigator.webkitGetUserMedia || 
    //                          navigator.mozGetUserMedia ||
    //                          navigator.msGetUserMedia;
    let cfg = {
        audio:true,
        video:true
    }
    try {
       navigator.mediaDevices.getUserMedia(cfg)
       .then((stream) => {
            window.localStraeam = stream;
           recStream(stream, 'lVideo')
       })
       .catch((err) => {
           alert('error, message : '+err);
           console.log(err)
       });
    } catch(err) {
        alert('error: '+err);
        console.log(err);
    }
}
const recStream = (stream, elemid) => {
    let video = document.getElementById(elemid);
    
    video.srcObject = stream;
    
    window.peer_stream = stream;
}
getLvideo();
// getLvideo({
//     success: function(stream){
//         window.localStraeam = stream;
//         recStream(stream, 'lVideo');
//     },   
//     error: function(err){
//         alert("cannot acces your camera");
//         console.log(err)
//     }
// })


let conn;
let peer_id;

// create a peer connection with peer Object
var peer = new Peer();
// display then peer id on the DOM
peer.on('open', (id) => {
    console.log(id)
    document.getElementById("displayId").innerHTML = peer.id
});

peer.on('connection', (connection) => {
    conn = connection;
    peer_id = connection.peer

    document.getElementById('connId').value = peer_id;
});

peer.on('error', (err) => {
    alert("an error has happened:"+ err);
    console.log(err)
})
// onclick with the connection butt = expose ice info
document.getElementById("conn_button").addEventListener('click', () => {
    peer_id = document.getElementById("connId").value;

    if(peer_id){
        conn = peer.connect(peer_id);
    } else {
        alert("enter an id");
        return false;
    }
});
// call on click (offer and aswer is exchanged)
peer.on('call', (call) => {
    let acceptCall = confirm("Do you want to answer this call ?");

    if(acceptCall){
        call.answer(window.localStraeam);

        call.on('stream', (stream) => {
            window.peer_stream = stream;

            recStream(stream, 'rVideo');
        });

        call.on('close', () => {
            alert('The call has behind');
        });
    } else {
        console.log("call denied");
    }
});
// ask to call
document.getElementById("call_button").addEventListener('click', () => {
    console.log("calling a peer: "+ peer_id );
    console.log(peer);

    let call = peer.call(peer_id, window.localStraeam);

    call.on('stream', (stream) => {
        window.peer_stream = stream;
        recStream(stream, 'rVideo');
    })
})
// accept the call

// display then remote video and local video on the clients
