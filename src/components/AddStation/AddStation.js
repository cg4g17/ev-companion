import React, {
  Component,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Divider from "@material-ui/core/Divider";
import { ListItemText } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import List from "@material-ui/core/List";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar } from "@material-ui/core";
import connectionData from "../../data/connections.json";
import Slide from "@material-ui/core/Slide";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ListItem from "@material-ui/core/ListItem";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import {
  GeoCollectionReference,
  GeoFirestore,
  GeoQuery,
  GeoQuerySnapshot,
} from "geofirestore";
import Geocoder from "react-mapbox-gl-geocoder";
import * as firebase from "firebase";
import { AuthContext } from "../../Auth";
import { withRouter, Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import "firebase/firestore";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const AddStation = () => {
  const history = useHistory();

  const firestore = firebase.firestore();
  const geofirestore: GeoFirestore = new GeoFirestore(firestore);
  const geocollection: GeoCollectionReference = geofirestore.collection(
    "Stations"
  );

  const { currentUser } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const [success, setSuccess] = useState(false);

  const [clicked, setClicked] = useState([]);

  const [devices, setDevices] = useState([]);

  const [power, setPower] = useState();

  const [type, setType] = useState();
  const [quantity, setQuantity] = useState();

  const [username, setUsername] = useState();
  const [user, setUser] = useState(0);

  const [station, setStation] = useState({
    address: null,
    postcode: null,
    latitude: clicked[1],
    longitude: clicked[0],
    devices: devices,
  });

  const [viewport, setViewport] = useState({
    latitude: 50.909698,
    longitude: -1.404351,
    width: "100vw",
    height: "100vh",
    zoom: 13,
  });

  const onSelected = (viewport, item) => {
    setViewport(viewport);
  };

  const handleClickMap = () => {
    setMapOpen(true);
  };

  const handleCloseMap = () => {
    setMapOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseSnack = () => {
    setSuccess(false);
  };

  const onClickMap = (e) => {
    console.log(e.lngLat);
    setClicked(e.lngLat);
  };

  const handleSave = () => {
    if (clicked.length != 0) {
      setMapOpen(false);
    }
  };

  const handleType = (e) => {
    setType(e.target.value);
    console.log(e.target);
  };

  const handleQuantity = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const handlePower = (e) => {
    setPower(parseInt(e.target.value));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setDevices((devices) => [
      ...devices,
      { type: type, quantity: quantity, power: power },
    ]);
    setOpen(false);
    console.log(devices);
  };

  const handleDelete = (dev) => {
    var array = [...devices];
    var index = array.indexOf(dev);
    if (index !== -1) {
      array.splice(index, 1);
      setDevices(array);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const userId = currentUser.uid;
    const { stationName, postcode } = e.target.elements;

    geocollection.add({
      username: username,
      uid: userId,
      address: stationName.value,
      postcode: postcode.value,
      devices: devices,
      coordinates: new firebase.firestore.GeoPoint(clicked[1], clicked[0]),
    });
    setSuccess(true);
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
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <div className="paper">
        <Typography component="h1" variant="h6">
          Register Station
        </Typography>
        <form className="form" onSubmit={handleRegister}>
          <TextField
            id="outlined-basic"
            label="Station Name"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            name="stationName"
          />
          <TextField
            id="outlined-basic"
            label="Postcode"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            name="postcode"
          />
          <List style={{ marginLeft: -16 }}>
            <ListItem>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleClickMap}
              >
                Select from Map
              </Button>
            </ListItem>
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
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="close"
                    onClick={() => handleDelete(device)}
                  >
                    <CloseIcon />
                  </IconButton>
                </ListItem>
              </List>
            ))}
            <Divider />
            <ListItem>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleClickOpen}
              >
                Add Device
              </Button>
            </ListItem>
          </List>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginBottom: 16, marginTop: 16 }}
          >
            Register
          </Button>
        </form>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Device</DialogTitle>
          <FormControl style={{ margin: "-15px 20px 10px" }}>
            <InputLabel>Connector Type</InputLabel>
            <Select onChange={handleType}>
              {connectionData.map((type, index) => (
                <MenuItem value={type}>{type.Title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <form onSubmit={handleAdd}>
            <TextField
              label="Power (kW)"
              variant="outlined"
              name="power"
              style={{ margin: "0px 20px 10px" }}
              onChange={handlePower}
            />
            <TextField
              label="Quantity"
              variant="outlined"
              name="quant"
              style={{ margin: "0px 20px 10px" }}
              onChange={handleQuantity}
            />
            <Button
              variant="contained"
              type="submit"
              color="primary"
              size="medium"
              style={{ margin: "0px 20px 10px" }}
            >
              Add
            </Button>
          </form>
        </Dialog>
        <Dialog
          fullScreen
          open={mapOpen}
          onClose={handleCloseMap}
          TransitionComponent={Transition}
        >
          <AppBar style={{ position: "relative" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleCloseMap}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" style={{ flex: 1 }}>
                Select on Map
              </Typography>
              <Button autoFocus color="inherit" onClick={handleSave}>
                save
              </Button>
            </Toolbar>
          </AppBar>
          <Geocoder
            viewport={viewport}
            hideOnSelect={true}
            onSelected={onSelected}
            mapboxApiAccessToken="pk.eyJ1IjoiY2VtZ29raGFuOTkiLCJhIjoiY2s3b3dpY29xMGJsZjNsbjF5NXZ0d3UzMSJ9.414EmnccVUMcQDAlJxvmJA"
          ></Geocoder>
          <ReactMapGL
            {...viewport}
            mapStyle="mapbox://styles/cemgokhan99/ck7ozemzz2xc91ip6uwzcrqm2"
            mapboxApiAccessToken="pk.eyJ1IjoiY2VtZ29raGFuOTkiLCJhIjoiY2s3b3dpY29xMGJsZjNsbjF5NXZ0d3UzMSJ9.414EmnccVUMcQDAlJxvmJA"
            onViewportChange={(viewport) => {
              setViewport(viewport);
            }}
            onClick={onClickMap}
          >
            {clicked[0] ? (
              <Marker
                latitude={clicked[1]}
                longitude={clicked[0]}
                offsetLeft={-12}
                offsetTop={-15}
              >
                <LocationOnIcon />
              </Marker>
            ) : null}
          </ReactMapGL>
        </Dialog>
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnack}
        >
          <Alert onClose={handleCloseSnack} severity="success">
            Added Station!
          </Alert>
        </Snackbar>
      </div>
    </Container>
  );
};

export default AddStation;
