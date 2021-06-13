
import React, { useRef, useState } from 'react';
//import { useParams } from "react-router-dom";
import './App.css';

import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9Vxp8Vot-ltvH7kZpRGmqM4WWGcTNaug",
  authDomain: "three-message.firebaseapp.com",
  projectId: "three-message",
  storageBucket: "three-message.appspot.com",
  messagingSenderId: "792215781915",
  appId: "1:792215781915:web:a51bdd00b55d709cb3aebe"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
  const [user] = useAuthState(auth);
  let  id  = "abc";//useParams();
  return (
    <div className="App">
      <header>
        <h1>🔥💬{id}</h1>
        {user ? <SignOut /> : null}
      </header>


      {user ? (<section><ChatRoom /></section>) : (<section><ReadRoom /><SignIn /></section>)}

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )

}

function SignOut() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>
}

function ReadRoom() {

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  return (<main>
    Msg:
    {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    .
  </main>);
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}



function ChatMessage(props) {
  const { text, uid, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
      <p>{displayName}</p>
    </div>
  </>)
}

export default App;
