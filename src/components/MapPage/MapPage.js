import AppBar from "@material-ui/core/AppBar";
import React, {
  Component,
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import ReactDOM from "react-dom";
import "./MapPage.css";
import Dialog from "@material-ui/core/Dialog";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import { ListItemText } from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import HomeIcon from "@material-ui/icons/Home";
import { Toolbar } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import { grey, green, red } from "@material-ui/core/colors";
import { IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import PinDropIcon from "@material-ui/icons/PinDrop";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import TuneIcon from "@material-ui/icons/Tune";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CheckIcon from "@material-ui/icons/Check";
import WarningIcon from "@material-ui/icons/Warning";

//import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import {
  GeoCollectionReference,
  GeoFirestore,
  GeoQuery,
  GeoQuerySnapshot,
} from "geofirestore";
import { AuthContext } from "../../Auth";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import axios from "axios";
import Slide from "@material-ui/core/Slide";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Collapse from "@material-ui/core/Collapse";
import ListSubheader from "@material-ui/core/ListSubheader";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import networkData from "../../data/networks.json";
import connectionData from "../../data/connections.json";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import * as firebase from "firebase";
import "firebase/firestore";

const MapPage = () => {
  const firestore = firebase.firestore();
  const geofirestore: GeoFirestore = new GeoFirestore(firestore);
  const geocollection: GeoCollectionReference = geofirestore.collection(
    "Stations"
  );

  const commentsRef = firestore.collection("Reports");

  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const [viewport, setViewport] = useState({
    latitude: 50.909698,
    longitude: -1.404351,
    width: "100vw",
    height: "95vh",
    zoom: 13,
  });

  const [current, setCurrent] = useState({
    latitude: null,
    longitude: null,
  });

  const [open, setOpen] = useState(false);

  const [homeOpen, setHomeOpen] = useState(false);

  const [success, setSuccess] = useState(false);

  const [openFilter, setOpenFilter] = useState(false);

  const [networkOpen, setNetworkOpen] = useState(false);

  const [connectionOpen, setConnectionOpen] = useState(false);

  const [username, setUsername] = useState();

  const [comments, setComments] = useState([]);

  const [buttonShow, setButtonShow] = useState(false);

  const [comment, setComment] = useState("");

  const mapRef = useRef();

  const searchRef = useRef();

  const handleFilterOpen = () => {
    setOpenFilter(true);
  };

  const handleFilterClose = () => {
    setOpenFilter(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleHomeOpen = () => {
    setHomeOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleHomeClose = () => {
    setHomeOpen(false);
  };

  const handleNetwork = () => {
    setNetworkOpen(!networkOpen);
  };

  const handleConnection = () => {
    setConnectionOpen(!connectionOpen);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const [stations, setStations] = useState([]);

  const [homeStations, setHomeStations] = useState([]);

  const [devices, setDevices] = useState([]);

  const [devicesHome, setDevicesHome] = useState([]);

  const [selected, setSelected] = useState(null);
  const [selectedHome, setSelectedHome] = useState(null);

  const [distance, setDistance] = useState(2);
  const [expanded, setExpanded] = useState(false);

  const [working, setWorking] = useState(true);

  const [operatorID, setOperatorID] = useState([]);

  const [connectionID, setConnectionID] = useState([]);

  const [index, setIndex] = useState();
  const [user, setUser] = useState(0);

  const [keyboardUp, setKeyboardUp] = useState(false);

  const onSelected = (viewport, item) => {
    setViewport(viewport);
  };

  const { currentUser } = useContext(AuthContext);

  const searchfield = document.querySelector('Geocoder[type="search"]');

  const handleCheck = (e) => {
    if (e.target.checked) {
      setOperatorID(operatorID.concat(e.target.name));
    }
    if (!e.target.checked) {
      const result = operatorID.filter((operator) => operator != e.target.name);
      setOperatorID(result);
    }
  };

  const handleTypeCheck = (e) => {
    if (e.target.checked) {
      setConnectionID(connectionID.concat(e.target.name));
    }
    if (!e.target.checked) {
      const result = connectionID.filter(
        (connection) => connection != e.target.name
      );
      setConnectionID(result);
    }
  };

  const handleReport = () => {
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
        station: selected.ID,
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
        station: selectedHome.id,
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

  const handleWorking = () => {
    setWorking(!working);
  };

  const handleDevice = (e) => {
    setIndex(e.target.value);
    console.log(e.target);
  };

  const handleApply = () => {
    console.log(operatorID);
    handleSearch();
    setOpenFilter(false);
  };

  const getComments = (station) => {
    setComments([]);
    commentsRef
      .where("station", "==", station.ID)
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

  const handleCloseSnack = () => {
    setSuccess(false);
  };

  function isMobile() {
    if (/Mobi/.test(navigator.userAgent)) {
      return true;
    }
    return false;
  }

  function findObject(array, type) {
    var found = false;
    for (var i = 0; i < array.length; i++) {
      if (array[i].type.ID == type) {
        found = true;
        return found;
      }
    }
  }

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const handlePosition = async () => {
    await navigator.geolocation.getCurrentPosition(
      (position) =>
        setViewport({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          width: "100vw",
          height: "100vh",
          zoom: 15,
          pressed: "true",
        }),
      (err) => console.log(err)
    );
    await navigator.geolocation.getCurrentPosition(
      (position) =>
        setCurrent({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (err) => console.log(err)
    );
    console.log(homeStations);
  };

  const handleSearch = async () => {
    const result = await axios(
      "https://api.openchargemap.io/v3/poi/?output=json&countrycode=GB&latitude=" +
        viewport.latitude +
        "&longitude=" +
        viewport.longitude +
        "&distance=" +
        distance +
        "&maxresults=200" +
        "&operatorid=" +
        operatorID +
        "&connectiontypeid=" +
        connectionID
    );
    const query: GeoQuery = geocollection.near({
      center: new firebase.firestore.GeoPoint(
        viewport.latitude,
        viewport.longitude
      ),
      radius: 5,
    });
    //console.log(viewport.latitude + ", " + viewport.longitude);
    // console.log(distance);
    console.log(query);
    setHomeStations([]);

    if (operatorID.includes((0).toString()) || operatorID.length < 1) {
      query.get().then((value: GeoQuerySnapshot) => {
        // All GeoDocument returned by GeoQuery, like the GeoDocument added above
        //setHomeStations(value.docs[0].data());
        value.docs.forEach(
          (item) => {
            const obj = item.data();
            obj.id = item.id;

            if (
              obj.devices.some((e) =>
                connectionID.includes(e.type.ID.toString())
              ) ||
              connectionID.length < 1
            ) {
              setHomeStations((homeStations) => [...homeStations, obj]);
            }
          }
          //console.log(item.data())
        );
      });
    }
    setStations(result.data);
    setButtonShow(false);
  };

  const addHomeStations = (items) => {
    if (items != null) {
      const itemsArray = Object.values(items);
      itemsArray.forEach((item) =>
        setHomeStations((homeStations) => [...homeStations, item])
      );
    }
  };

  useEffect(() => {
    if (currentUser) {
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
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchData() {
      const result = await axios(
        "https://api.openchargemap.io/v3/poi/?output=json&countrycode=GB&latitude=" +
          viewport.latitude +
          "&longitude=" +
          viewport.longitude +
          "&distance=5&maxresults=100"
      );
      setStations(result.data);

      console.log(viewport.latitude + ", " + viewport.longitude);
    }
    fetchData();
    const query: GeoQuery = geocollection.near({
      center: new firebase.firestore.GeoPoint(
        viewport.latitude,
        viewport.longitude
      ),
      radius: 10,
    });
    query.get().then((value: GeoQuerySnapshot) => {
      // All GeoDocument returned by GeoQuery, like the GeoDocument added above
      //setHomeStations(value.docs[0].data());
      value.docs.forEach(
        (item) => {
          const obj = item.data();
          obj.id = item.id;
          setHomeStations((homeStations) => [...homeStations, obj]);
        }
        //console.log(item.data())
      );
    });
    function handleResize() {
      setViewport({
        latitude: viewport.latitude,
        longitude: viewport.longitude,
        width: "100vw",
        height: "90vh",
        zoom: viewport.zoom,
      });
    }
    if (isMobile()) {
      window.addEventListener("orientationchange", handleResize, false);
    } else {
      window.addEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    setDistance(80 / viewport.zoom);
  }, [viewport.zoom]);

  useEffect(() => {
    setButtonShow(true);
  }, [viewport]);

  return (
    <div className="root">
      <AppBar position="static">
        <Toolbar>
          <TuneIcon
            fontSize="large"
            style={{ marginRight: 16 }}
            onClick={handleFilterOpen}
          />
          <MyLocationIcon
            style={{ color: grey[50], marginRight: 16 }}
            onClick={handlePosition}
          />
        </Toolbar>
      </AppBar>

      <ReactMapGL
        {...viewport}
        mapStyle="mapbox://styles/cemgokhan99/ck7ozemzz2xc91ip6uwzcrqm2"
        mapboxApiAccessToken="pk.eyJ1IjoiY2VtZ29raGFuOTkiLCJhIjoiY2s3b3dpY29xMGJsZjNsbjF5NXZ0d3UzMSJ9.414EmnccVUMcQDAlJxvmJA"
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
        ref={mapRef}
      >
        <div
          ref={searchRef}
          style={{
            height: 50,
            display: "flex",
            alignItems: "center",
            paddingLeft: 4,
            paddingRight: 4,
          }}
        />
        <Geocoder
          mapboxApiAccessToken="pk.eyJ1IjoiY2VtZ29raGFuOTkiLCJhIjoiY2s3b3dpY29xMGJsZjNsbjF5NXZ0d3UzMSJ9.414EmnccVUMcQDAlJxvmJA"
          mapRef={mapRef}
          position="top-left"
          onViewportChange={(viewport) => {
            setViewport(viewport);
          }}
          zoom={15}
          containerRef={searchRef}
          id="test"
        />

        {buttonShow ? (
          <Button
            style={{ marginLeft: 4, marginTop: 10 }}
            variant="contained"
            color="primary"
            onClick={handleSearch}
          >
            Search Area
          </Button>
        ) : null}
        {stations.map((item, index) => (
          <Marker
            key={index}
            latitude={item.AddressInfo.Latitude}
            longitude={item.AddressInfo.Longitude}
          >
            <input
              type="image"
              src="/stationIcon.png"
              alt=" "
              onClick={(e) => {
                e.preventDefault();
                handleClickOpen();
                setSelected(item);
                setDevices(item.Connections);
                getComments(item);
              }}
              style={{ height: "10%", width: "10%" }}
            />
          </Marker>
        ))}
        {homeStations.map((item, index) =>
          item.enabled == true ? (
            <Marker
              key={index}
              latitude={item.coordinates.latitude}
              longitude={item.coordinates.longitude}
            >
              <input
                type="image"
                src="/stationIconGreen.png"
                alt=" "
                onClick={(e) => {
                  e.preventDefault();
                  handleHomeOpen();
                  setSelectedHome(item);
                  setDevicesHome(item.devices);
                  getCommentsHome(item);
                  //console.log(homeStations);
                }}
                style={{ height: "10%", width: "10%" }}
              />
            </Marker>
          ) : null
        )}

        {current.latitude ? (
          <Marker
            key={"location"}
            latitude={current.latitude}
            longitude={current.longitude}
          >
            <LocationOnIcon />
          </Marker>
        ) : null}
      </ReactMapGL>

      {selected ? (
        <Dialog open={open} onClose={handleClose}>
          <Typography
            variant="h5"
            style={{ marginLeft: 16, marginTop: 10, marginRight: 40 }}
            gutterBottom
          >
            {selected.AddressInfo.Title}
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
            {selected.AddressInfo.Postcode}
          </Typography>
          <Typography variant="h5" style={{ marginLeft: 16 }} gutterBottom>
            {selected.OperatorInfo.Title}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginLeft: 16, marginRight: 16 }}
            gutterBottom
          >
            Usage: {selected.UsageType.Title}
          </Typography>
          {selected.StatusType.IsOperational == false ? (
            <Typography variant="body1" style={{ marginLeft: 16 }} gutterBottom>
              {selected.StatusType.Title}
            </Typography>
          ) : null}
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
                          {device.ConnectionType.Title}
                        </Typography>
                      </div>
                      <div>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          Quantity: {device.Quantity}
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
                      <MenuItem value={index}>Connection {index + 1}</MenuItem>
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
                  onClick={handleReport}
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
        </Dialog>
      ) : null}
      {selectedHome ? (
        <Dialog open={homeOpen} onClose={handleHomeClose}>
          <Typography
            variant="h5"
            style={{ marginLeft: 16, marginTop: 10, marginRight: 40 }}
            gutterBottom
          >
            {selectedHome.address}
          </Typography>
          <div style={{ position: "absolute", top: "0px", right: "0px" }}>
            <IconButton aria-label="close" onClick={handleHomeClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <Typography
            variant="h6"
            style={{ marginLeft: 22, marginTop: -5 }}
            gutterBottom
          >
            {selectedHome.postcode}
          </Typography>
          <Typography
            variant="h5"
            style={{ marginLeft: 16, marginRight: 16 }}
            gutterBottom
          >
            {selectedHome.username}
          </Typography>
          {devicesHome.map((device, index) => (
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
                          {device.type.Title}
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
                    {devicesHome.map((type, index) => (
                      <MenuItem value={index}>Connection {index + 1}</MenuItem>
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
        </Dialog>
      ) : null}
      <Dialog open={openFilter} onClose={handleFilterClose}>
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Filter by:
            </ListSubheader>
          }
        >
          <ListItem button onClick={handleNetwork}>
            <ListItemText primary="Network" />
            {networkOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={networkOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <FormGroup>
                  {networkData.map((network, index) =>
                    operatorID.includes(network.ID.toString()) ? (
                      <FormControlLabel
                        value={network.ID}
                        control={
                          <Checkbox
                            name={network.ID}
                            onChange={handleCheck}
                            checked={true}
                          />
                        }
                        label={network.Title}
                      />
                    ) : (
                      <FormControlLabel
                        value={network.ID}
                        control={
                          <Checkbox name={network.ID} onChange={handleCheck} />
                        }
                        label={network.Title}
                      />
                    )
                  )}
                </FormGroup>
              </ListItem>
            </List>
          </Collapse>
          <ListItem button onClick={handleConnection}>
            <ListItemText primary="Connection Type" />
            {connectionOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={connectionOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <FormGroup>
                  {connectionData.map((connection, index) =>
                    connectionID.includes(connection.ID.toString()) ? (
                      <FormControlLabel
                        value={connection.ID}
                        control={
                          <Checkbox
                            name={connection.ID}
                            onChange={handleTypeCheck}
                            checked={true}
                          />
                        }
                        label={connection.Title}
                      />
                    ) : (
                      <FormControlLabel
                        value={connection.ID}
                        control={
                          <Checkbox
                            name={connection.ID}
                            onChange={handleTypeCheck}
                          />
                        }
                        label={connection.Title}
                      />
                    )
                  )}
                </FormGroup>
              </ListItem>
            </List>
          </Collapse>
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: 16 }}
            onClick={handleApply}
          >
            APPLY
          </Button>
        </List>
      </Dialog>
    </div>
  );
};

export default MapPage;
