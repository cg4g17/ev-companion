import React, { Component, useContext } from "react";
import logo from "./logo.svg";
import "./App.css";
import NavBar from "./components/NavBar";
import MapBar from "./components/MapPage";
import Station from "./components/StationPage";
import Register from "./components/Register";
import Login from "./components/LoginPage";
import Profile from "./components/Profile";
import AddStation from "./components/AddStation";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { AuthProvider } from "./Auth";
import { AuthContext } from "./Auth";
import * as firebase from "firebase";
import { withRouter, Redirect } from "react-router";

class App extends Component {
  constructor() {
    super();
    this.state = {
      text: "Welcome",
      user: null,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  render() {
    return (
      <AuthProvider>
        <Router>
          <React.Fragment>
            <NavBar />
            <Switch>
              <Route path="/" exact component={MapBar} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              {this.state.user ? (
                <Route path="/add" component={AddStation} />
              ) : (
                <Redirect to="/login" />
              )}
              {this.state.user ? (
                <Route path="/profile" component={Profile} />
              ) : (
                <Redirect to="/login" />
              )}
            </Switch>
          </React.Fragment>
        </Router>
      </AuthProvider>
    );
  }
}

export default App;
