import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { ListItemText } from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";

class StationPage extends Component {
  constructor() {
    super();
    this.state = {
      open: false
    };
  }

  render() {
    function handleClickOpen() {
      this.state.open = true;
    }

    function handleClose() {
      this.state.open = false;
    }

    return (
      <div className="root">
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Open full-screen dialog
        </Button>
        <Dialog fullScreen open={this.state.open} onClose={handleClose}>
          <Typography
            variant="h4"
            style={{ marginLeft: 16, marginTop: 10 }}
            gutterBottom
          >
            Dirb
          </Typography>
          <Typography
            variant="h6"
            style={{ marginLeft: 22, marginTop: -5 }}
            gutterBottom
          >
            SO15 1DP
          </Typography>
          <Typography variant="h4" style={{ marginLeft: 16 }} gutterBottom>
            Network Name
          </Typography>
          <List>
            <Divider />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Device 1"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      Type 1
                    </Typography>
                  </React.Fragment>
                }
              ></ListItemText>
            </ListItem>
            <Divider />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Device 2"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      Type 2
                    </Typography>
                  </React.Fragment>
                }
              ></ListItemText>
            </ListItem>
            <Divider />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Device 3"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      Type 2
                    </Typography>
                  </React.Fragment>
                }
              ></ListItemText>
            </ListItem>
            <Divider />
          </List>
          <div className="innerDiv">
            <Button
              variant="contained"
              style={{ marginRight: 16, marginLeft: 10 }}
            >
              Report A Device
            </Button>
            <Button variant="contained">Write A Comment</Button>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default StationPage;
