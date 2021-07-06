import React, { useState, useEffect, createContext } from "react";
import { auth } from "../../src/Helper/Firebase";

export const UserContext = createContext({ user: null });

export default (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    //callback triggered upon changing state of auth [login]
    auth.onAuthStateChanged(async (userData) => {
      if (userData) {
        const { displayName, email, uid, emailVerified, photoURL } = userData;

        setUser({
          displayName, email, uid, emailVerified, photoURL, status: "Available",
        });

        //setting user session to avoid login-re-rendering
        localStorage.setItem("user", true);
      }
    });
  }, []);

  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  );
};
