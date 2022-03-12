import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useSelector, useDispatch } from "react-redux";
import { hideNotification } from "../../redux/actions";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbars() {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.notification);

  const handleClose = () => {
    dispatch(hideNotification());
  };

  return (
    <>
      <Snackbar
        open={notification.active}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
