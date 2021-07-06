import React, { useEffect, useContext, useState } from "react";
import { signInWithGoogle, signInWithMicrosoft } from "../../Helper/Firebase";
import { Redirect } from 'react-router-dom';
import { UserContext } from '../../Provider/User';
import { SiMicrosoft, SiGoogle } from 'react-icons/si';
import './Login.css';

export const Login = () => {
  const user = useContext(UserContext);
  const [redirect, setRedirect] = useState(null)

  //redirect to dashboard after user logged in
  useEffect(() => {
    if (user) {
      setRedirect('/dashboard')
    }
  }, [user])

  if (redirect) {
    return <Redirect to={redirect}/>
  };

  return (
    <div className="login-buttons">
      <button className="login-provider-button" id="login-google" onClick={signInWithGoogle}>
        <SiGoogle /> &nbsp; Continue with Google
      </button>
      <button className="login-provider-button" id="login-ms" onClick={signInWithMicrosoft}>
        <SiMicrosoft /> &nbsp; Continue with Microsoft
      </button>
    </div>
  );
}

export default Login;