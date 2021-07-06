import React from "react";
import { BrowserRouter, Switch, Route } from 'react-router-dom';

//route components
import Room from "./Components/Room/Room";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Navigation/Navbar";
import Landing from "./Components/Home/Landing";

//context provider
import User from "./Provider/User";

//global toasts [alerts]
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, Flip } from "react-toastify";

//global styling
import "./App.css";

const App = () => {
	return (
		<div>
      <User>
        <BrowserRouter>
          <ToastContainer autoClose={1500} transition={Flip} />
          <Navbar />
          <Switch>
            <Route exact path='/' component={Landing} />
            <Route exact path='/room/:room' component={props => <Room {...props} />} />
            <Route exact path='/dashboard' component={Dashboard} />
          </Switch>
        </BrowserRouter>
      </User>
    </div>
	)
}

export default App;