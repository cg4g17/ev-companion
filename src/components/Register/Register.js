import React, { Component, useCallback, useContext } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { CssBaseline } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { withRouter, Redirect } from "react-router";
import { AuthContext } from "../../Auth";
import * as firebase from "firebase";

const Register = ({ history }) => {
  const firestore = firebase.firestore();
  const handleRegister = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, name, password } = event.target.elements;
      try {
        await firebase
          .auth()
          .createUserWithEmailAndPassword(email.value, password.value)
          .then((res) => {
            const uid = res.user.uid;
            firestore.collection("Users").doc(uid).set({
              username: name.value,
            });
          });
        history.push("/profile");
      } catch (error) {
        alert(error);
        console.log(name.value);
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
          Register
        </Typography>
        <form className="form" onSubmit={handleRegister}>
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
            label="Username"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            name="name"
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
            Register
          </Button>
          <Link to="/login" style={{ color: "#0000EE" }}>
            Already have an account? Log in here
          </Link>
        </form>
      </div>
    </Container>
  );
};

export default withRouter(Register);
