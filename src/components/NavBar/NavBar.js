import React, { useContext, useEffect, useState } from "react";
import "./NavBar.css";
import AppBar from "@material-ui/core/AppBar";
import HomeIcon from "@material-ui/icons/Home";
import IconButton from "@material-ui/core/IconButton";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import ListIcon from "@material-ui/icons/List";
import Drawer from "@material-ui/core/Drawer";
import { grey } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import AddIcon from "@material-ui/icons/Add";
import { Toolbar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Auth";
import * as firebase from "firebase";

const NavBar = () => {
  const [drawer, setDrawer] = useState(false);
  const [user, setUser] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
  });

  return (
    <div className="root">
      <AppBar position="static">
        <Toolbar className="toolbar">
          <ListIcon
            fontSize="large"
            onClick={toggleDrawer}
            style={{ marginRight: 10, marginLeft: -10 }}
          />
          <Button
            style={{ marginRight: 16, color: grey[50] }}
            variant="outlined"
            className="map"
            component={Link}
            to={"/"}
          >
            Map
          </Button>
          {currentUser ? (
            <Link to="/profile" style={{ position: "absolute", right: 12 }}>
              <AccountBoxIcon fontSize="large" />
            </Link>
          ) : (
            <React.Fragment>
              <Button
                style={{ color: grey[50], position: "absolute", right: 12 }}
                variant="outlined"
                component={Link}
                to={"/register"}
              >
                Register
              </Button>
              <Button
                style={{ color: grey[50], position: "absolute", right: 130 }}
                variant="outlined"
                component={Link}
                to={"/login"}
              >
                Login
              </Button>
            </React.Fragment>
          )}
          <Drawer anchor="left" open={drawer} onClose={toggleDrawer}>
            <div role="presentation" onClick={toggleDrawer}>
              <List>
                <Link to="/add" style={{ color: "#000000" }}>
                  <ListItem button>
                    <ListItemIcon style={{ marginRight: -16 }}>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Add a Station" />
                  </ListItem>
                </Link>
              </List>
            </div>
          </Drawer>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default NavBar;
