import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "peerjs";
import io from "socket.io-client";

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhoneIcon from '@mui/icons-material/Phone';

import "./App.css";

// Replace 'http://localhost:5000' with your socket server URL if different
const socket = io.connect('http://localhost:5000');

function App() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    });

    const peer = new Peer(undefined, {
      host: 'localhost',  // Update with your PeerJS server host
      port: 5000,         // Update with your PeerJS server port
      path: '/'
    });

    peer.on('open', (id) => {
      setMe(id);
      socket.emit("join", id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    connectionRef.current = peer;
  }, []);

  const callUser = (id) => {
    const call = connectionRef.current.call(id, stream);
    call.on("stream", (userStream) => {
      userVideo.current.srcObject = userStream;
    });

    call.on("close", () => {
      setCallEnded(true);
    });

    socket.emit("callUser", {
      userToCall: id,
      from: me,
      name: name
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    const call = connectionRef.current.answer(stream);

    call.on("stream", (userStream) => {
      userVideo.current.srcObject = userStream;
    });

    call.on("close", () => {
      setCallEnded(true);
    });
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.disconnect();
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
            ) : null}
          </div>
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default App;

