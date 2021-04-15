import React, { Component, useCallback, useContext } from "react";
import "./LoginPage.css";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { withRouter, Redirect } from "react-router";
import { AuthContext } from "../../Auth";
import * as firebase from "firebase";

const LoginPage = ({ history }) => {
  const handleLogin = useCallback(
    async event => {
      event.preventDefault();
      const { email, password } = event.target.elements;
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(email.value, password.value);
        history.push("/profile");
      } catch (error) {
        alert(error);
      }
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    return <Redirect to="/profile" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className="paper">
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className="form" onSubmit={handleLogin}>
          <TextField
            id="outlined-basic"
            label="Email address"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            name="email"
          />
          <TextField
            id="outlined-basic"
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            name="password"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginBottom: 16, marginTop: 16 }}
          >
            Log In
          </Button>
          <Link to="/register" style={{ color: "#0000EE" }}>
            Don't have an account? Register here
          </Link>
        </form>
      </div>
    </Container>
  );
};

export default withRouter(LoginPage);
