import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { RiSpyFill } from "react-icons/ri";
import { logout } from "../redux/actions";
import FiatModal from "./modals/FiatModal";
import ColoredAvatar from "./ColoredAvatar";

const pages = [<FiatModal />, "Logout"];
const settings = ["Profile", "Logout"];

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleLogout = (e) => {
    const config = {
      method: ["GET"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };
    axios
      .get("https://spy-chain.herokuapp.com/session/terminate", config)
      .then((res) => {
        dispatch(logout());
        window.location.reload();
      });
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <div className="bg-white shadow-md font-poppins py-1">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              flexDirection: "row",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {/* <div className="rounded-full bg-blue-500 p-2">
              <GiSpyglass className="text-white" />
            </div> */}
            <RiSpyFill className="w-6 h-6 text-blue-500 mr-2" />
            <h1 className="text-blue-500 text-font-montserrat font-bold text-xl font-montserrat">
              SpyChain
            </h1>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              flexDirection: "row",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <RiSpyFill className="w-7 h-7 text-blue-500 mr-2" />
            <h1 className="text-blue-500 text-font-montserrat font-bold text-2xl font-montserrat">
              SpyChain
            </h1>
          </Box>
          <Box className="lg:hidden">
            <MenuIcon onClick={handleOpenNavMenu} className="cursor-pointer" />
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => {
                    if (page === "Logout") {
                      handleLogout();
                    } else {
                      handleCloseNavMenu();
                    }
                  }}
                >
                  <div>{page}</div>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box className="hidden lg:flex flex-row items-center">
            <FiatModal />
            <Tooltip title="Open settings">
              <button onClick={handleOpenUserMenu} className="ml-2">
                <ColoredAvatar user={user} />
              </button>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    if (setting === "Logout") {
                      handleLogout();
                    } else {
                      handleCloseUserMenu();
                    }
                  }}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </div>
  );
};
export default Navbar;
