
import React, { useRef, useState } from 'react';
//import { useParams } from "react-router-dom";
import './App.css';

import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import * as privateFirebase from "./privateFirebase";
firebase.initializeApp(privateFirebase.config);

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
  const [user] = useAuthState(auth);
  let id = "ThreeChat";
  return (
    <div className="App">
      <header>
        <h3>👥💬{id} on 🔥base</h3>
        {user ? <SignOut /> : null}
      </header>


      {user ? (<section><ChatRoom /></section>) : (<section><SignIn /></section>)}

    </div>
  );
}

function SignIn() {

  const [emailPopup, setEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  const signInWithEmail = () => {
    setEmailPopup(true);
  }


  const signInWithEmailAndPasswordHandler = (email, password) => {
    auth.signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      });

    setEmailPopup(false);
  }

  const createWithEmailAndPasswordHandler = (email, password) => {
    auth.createUserWithEmailAndPassword(email, password)
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      });

    setEmailPopup(false);
  }

  const closeWithEmailAndPasswordHandler = () => {
    setEmailPopup(false);
  }

  if (emailPopup) {
    return (
      <div className="modal">
        <div className="modal-content">
          <form>
            <button onClick={(_event) => { closeWithEmailAndPasswordHandler() }}>
              Close 
            </button>
            <br />
            <label htmlFor="userEmail">
              Email:
            </label><input
              type="email"
              name="userEmail"
              value={email}
              placeholder="E.g: abc@gmail.com"
              id="userEmail"
              onChange={ev => setEmail(ev.target.value)}
            />
            <br />
            <label htmlFor="userPassword">
              Password:
            </label><input
              type="password"
              name="userPassword"
              value={password}
              placeholder="--"
              id="userPassword"
              onChange={ev => setPassword(ev.target.value)}
            />
            <br />
            <button onClick={(_event) => { signInWithEmailAndPasswordHandler(email, password) }}>
              Sign in
            </button>
            <br />
            <button onClick={(_event) => { createWithEmailAndPasswordHandler(email, password) }}>
              Create Account
            </button>
          </form>
        </div>
      </div>
    )
  }
  else {
    return (
      <div>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
        <button onClick={signInWithEmail}>Sign in with Email</button>
      </div>
    )
  }

}

function SignOut() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('minusTime').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  

  const [formValue, setFormValue] = useState('');

  let renderedMessages = messages && messages.map(msg => <ChatMessage key={msg.id} payload={msg} />);
  // let reversed = []
  // if(renderedMessages)
  // {
  //   for(let i=renderedMessages.length-1; i>=0; --i)
  //   {
  //     //reversed.push(renderedMessages[i]);
  //   }
  // }

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, displayName, email } = auth.currentUser;
    const name = displayName ?? email.split('@')[0];
    const caps = name.charAt(0).toUpperCase() + name.slice(1);
    console.log(caps);
    const millis = new Date().valueOf();
    await messagesRef.add({
      text: formValue,
      minusTime: -millis,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName: caps,
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      <span ref={dummy}></span>
      {renderedMessages}
    </main>

    <form className="message" onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="hello to you" />

      <button type="submit" disabled={!formValue}>SEND💥</button>

    </form>
  </>)
}



function ChatMessage(props) {
  const { text, uid, displayName, createdAt } = props.payload;
  let dateString = "?";
  
  if(createdAt != null ) 
  {
    const dateObj = new Date(createdAt.seconds * 1000);
    dateString = dateObj.toLocaleString('en-CA'); 
  }

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
      <p className={`from ${messageClass}`}>{displayName}</p>
      <p className={`time ${messageClass}`}>{dateString}</p>
    </div>
  </>)
}

export default App;
