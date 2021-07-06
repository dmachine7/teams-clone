import firebase from "firebase";
import { toast } from "react-toastify";

//firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth();

//database references
export const db = firebase.firestore();
export const userRef = db.collection('Users');
export const meetingRef = db.collection('Meetings');
export const teamsRef = db.collection('Teams');

const googleProvider = new firebase.auth.GoogleAuthProvider();
const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');

//setting up google sign-in
export const signInWithGoogle = () => {
  auth.signInWithPopup(googleProvider)
    .then(async (res) => {
      if (res.user) updateUsers(res.user);
      toast.success(`Welcome ${res.user.displayName} !`);
    })
    .catch(() => {
      toast.error('Error Logging in! Please try again or different method.')
    })
};

//setting up microsoft sign-in
export const signInWithMicrosoft = () => {
  auth.signInWithPopup(microsoftProvider)
    .then(async (res) => {
      if (res.user) updateUsers(res.user);
      toast.success(`Welcome ${res.user.displayName} !`);
    })
    .catch((error) => {
      toast.error('Error Logging in! Please try again or different method.')
    })
};

export const logOut = () => {
  auth.signOut()
    .then(()=> {
      toast.warning('Logged Out !')
      localStorage.clear();
      window.location.reload();
    })
    .catch(() => {
      toast.error('Trouble Logging out!')
    })
}

//update or add user in database
export const updateUsers = (user) => {
  userRef.doc(user.uid).get()
  .then(doc => {
    if (!(doc.exists)) {
      userRef.doc(user.uid).set({
        displayName: user.displayName,
        email: user.email,
        status: "Available",
        teams: [],
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        uid: user.uid
      }, { merge: true });
    }
  })
}

//find user in database
export const findUser = async (id) => {
  let user;
  
  await userRef.doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        user = doc.data()
      }
    })
    .catch((err) => console.log(err));

  return user;
}

//add scheduled meeting in database
export const addMeeting = (meeting) => {
  meetingRef.add({
    agenda: meeting.agenda,
    name: meeting.name,
    time: {seconds: meeting.time},
    room: meeting.room
  })
    .then(() => toast.success('Meeting scheduled. Please share with others.'))
    .catch(() => toast.warn('Meeting not scheduled.'));
}