import React, {
  Component,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Container from "@material-ui/core/Container";
import Avatar from "@material-ui/core/Avatar";
import "./Profile.css";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Dialog from "@material-ui/core/Dialog";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EvStationIcon from "@material-ui/icons/EvStation";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CheckIcon from "@material-ui/icons/Check";
import WarningIcon from "@material-ui/icons/Warning";
import Snackbar from "@material-ui/core/Snackbar";
import { grey, green, red } from "@material-ui/core/colors";
import MuiAlert from "@material-ui/lab/Alert";

import * as firebase from "firebase";
import "firebase/firestore";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../Auth";
import { withRouter, Redirect } from "react-router";
import {
  GeoCollectionReference,
  GeoFirestore,
  GeoQuery,
  GeoQuerySnapshot,
} from "geofirestore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

const Profile = () => {
  const history = useHistory();

  const { currentUser } = useContext(AuthContext);

  const firestore = firebase.firestore();
  const stationsRef = firestore.collection("Stations");
  const commentsRef = firestore.collection("Reports");

  const getInitials = () => {
    var str = this.state.username;
    var nameInitials = str.match(/\b\w/g) || [];
    nameInitials = (
      (nameInitials.shift() || "") + (nameInitials.pop() || "")
    ).toUpperCase();
    return nameInitials;
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleLogout = useCallback(async (event) => {
    event.preventDefault();
    try {
      await firebase.auth().signOut();
      history.push("/login");
    } catch (error) {
      alert(error);
    }
  });

  const [username, setUsername] = useState();
  const [user, setUser] = useState(0);
  const [stations, setStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState();
  const [devices, setDevices] = useState([]);
  const [enabled, setEnabled] = useState(null);
  const [working, setWorking] = useState(true);
  const [index, setIndex] = useState();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseSnack = () => {
    setSuccess(false);
  };

  const handleWorking = () => {
    setWorking(!working);
  };

  const handleReportHome = () => {
    if (currentUser == null) {
      window.alert("You need to be logged in to submit a comment!");
      return;
    }
    const userId = currentUser.uid;

    firestore
      .collection("Reports")
      .add({
        username: username,
        uid: userId,
        content: comment,
        station: selected.id,
        device: index,
        working: working,
      })
      .then(function (docRef) {
        console.log("Document written with ID: ", docRef.id);
        setSuccess(true);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  };

  const getCommentsHome = (station) => {
    setComments([]);
    commentsRef
      .where("station", "==", station.id)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          const obj = doc.data();
          console.log(obj);
          setComments((comments) => [...comments, obj]);
        });
      })
      .catch(function (error) {
        console.log("error: ", error);
      });
    console.log(comments);
  };

  const handleDelete = () => {
    stationsRef
      .doc(selected.id)
      .delete()
      .then(function () {
        console.log("Delete successful");
        handleClose();
        getStations();
      })
      .catch(function (error) {
        console.error("Error deleting document: ", error);
      });
  };

  const getStations = () => {
    const userId = currentUser.uid;

    setStations([]);
    stationsRef
      .where("d.uid", "==", userId)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          const obj = doc.data().d;
          obj.id = doc.id;
          setStations((stations) => [...stations, obj]);
        });
      })
      .catch(function (error) {
        console.log("error: ", error);
      });
  };

  const handleCheck = (station, index) => {
    const statsCopy = [...stations];
    statsCopy[index].enabled = !statsCopy[index].enabled;
    setStations(statsCopy);

    const stationRef = stationsRef.doc(station.id);
    stationRef
      .get()
      .then(function (doc) {
        setEnabled(doc.data().d.enabled);
        console.log("Set");
      })
      .then(
        stationRef
          .update({
            "d.enabled": station.enabled,
          })
          .then(function () {
            console.log("Updated!");
          })
          .catch(function (error) {
            console.error("error updating: ", error);
          })
      );
  };

  const handleClickOpen = (e) => {
    setOpen(true);
    //console.log(e);
  };

  const handleDevice = (e) => {
    setIndex(e.target.value);
    console.log(e.target);
  };

  useEffect(() => {
    if (currentUser == null) {
      return <Redirect to="/login" />;
    }
    const userId = currentUser.uid;
    const userRef = firestore.collection("Users").doc(userId);
    userRef
      .get()
      .then(function (doc) {
        setUsername(doc.data().username);
      })
      .catch(function (error) {
        console.log("Error getting document: ", error);
      });

    getStations();

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <div className="profdiv">
        <Grid container spacing={3} style={{ marginBottom: 5 }}>
          <Grid item xs={3}>
            <Avatar style={{ width: 70, height: 70 }}></Avatar>
          </Grid>
          <Grid item xs={20}>
            <Typography variant="h4" component="h4" style={{ marginTop: 16 }}>
              {username}
            </Typography>
          </Grid>
        </Grid>
        <List style={{ marginLeft: -16 }}>
          {stations
            ? stations.map((station, index) => (
                <React.Fragment>
                  <ListItem>
                    <ListItemIcon
                      style={{ marginRight: -16 }}
                      button
                      onClick={(e) => {
                        e.preventDefault();
                        handleClickOpen();
                        setSelected(station);
                        setDevices(station.devices);
                        console.log("clicked");
                        getCommentsHome(station);

                        //console.log(stations);
                      }}
                    >
                      <EvStationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={"Station " + (index + 1)}
                      button
                      onClick={(e) => {
                        e.preventDefault();
                        handleClickOpen(station);
                        setSelected(station);
                        setDevices(station.devices);
                        getCommentsHome(station);
                        //console.log(stations);
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={station.enabled}
                          onChange={() => handleCheck(station, index)}
                          name="checkedB"
                          color="primary"
                        />
                      }
                      label="Enabled"
                    />
                  </ListItem>
                </React.Fragment>
              ))
            : null}
        </List>
        <Button
          style={{ marginTop: 16 }}
          variant="contained"
          color="primary"
          onClick={handleLogout}
        >
          Log Out
        </Button>
        {selected ? (
          <Dialog open={open} onClose={handleClose}>
            <Typography
              variant="h5"
              style={{ marginLeft: 16, marginTop: 10, marginRight: 40 }}
              gutterBottom
            >
              {selected.address}
            </Typography>
            <div style={{ position: "absolute", top: "0px", right: "0px" }}>
              <IconButton aria-label="close" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>
            <Typography
              variant="h6"
              style={{ marginLeft: 22, marginTop: -5 }}
              gutterBottom
            >
              {selected.postcode}
            </Typography>
            <Typography
              variant="h5"
              style={{ marginLeft: 16, marginRight: 16 }}
              gutterBottom
            >
              {selected.username}
            </Typography>
            {devices.map((device, index) => (
              <List>
                <Divider />
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body1"
                          color="textPrimary"
                        >
                          Connection {index + 1}
                        </Typography>
                      </React.Fragment>
                    }
                    secondary={
                      <div>
                        <div>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            {device.type.Title} {device.power} kW
                          </Typography>
                        </div>
                        <div>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            Quantity: {device.quantity}
                          </Typography>
                        </div>
                      </div>
                    }
                  ></ListItemText>
                </ListItem>
              </List>
            ))}
            <Divider />
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Add a Comment</Typography>
              </ExpansionPanelSummary>
              <List>
                <ListItem>
                  <TextField
                    label="Comment"
                    variant="outlined"
                    onChange={(value) => setComment(value.target.value)}
                    style={{ width: "90%", marginTop: -16 }}
                  />
                </ListItem>
                <ListItem>
                  <FormControl style={{ width: "60%", marginTop: -16 }}>
                    <InputLabel>Device</InputLabel>
                    <Select onChange={handleDevice}>
                      {devices.map((type, index) => (
                        <MenuItem value={index}>
                          Connection {index + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={working}
                        onChange={handleWorking}
                        color="primary"
                      />
                    }
                    label="Working"
                    style={{ marginLeft: 6 }}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReportHome}
                  >
                    ADD COMMENT
                  </Button>
                </ListItem>
              </List>
              <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnack}
              >
                <Alert onClose={handleCloseSnack} severity="success">
                  Comment Added!
                </Alert>
              </Snackbar>
            </ExpansionPanel>
            <Divider />
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>View Comments</Typography>
              </ExpansionPanelSummary>
              {comments.map((comment, index) => (
                <React.Fragment>
                  <ListItem style={{ marginBottom: -8, marginLeft: -4 }}>
                    <Typography variant="h6">{comment.username}</Typography>
                    {comment.working == true ? (
                      <CheckIcon
                        style={{
                          fontSize: 25,
                          color: green[500],
                          position: "absolute",
                          right: "10%",
                        }}
                      />
                    ) : (
                      <WarningIcon
                        style={{
                          fontSize: 25,
                          color: red[500],
                          position: "absolute",
                          right: "10%",
                        }}
                      />
                    )}
                  </ListItem>
                  <Typography style={{ marginLeft: 12 }}>
                    Used: Device {comment.device + 1}
                  </Typography>

                  <Typography style={{ marginLeft: 18 }}>
                    {comment.content}
                  </Typography>
                  <Divider />
                </React.Fragment>
              ))}
            </ExpansionPanel>
            <Button
              variant="contained"
              color="secondary"
              style={{ width: "80%", margin: 10 }}
              onClick={handleDelete}
            >
              DELETE STATION
            </Button>
          </Dialog>
        ) : null}
      </div>
    </Container>
  );
};

export default Profile;
