import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import SearchIcon from "@mui/icons-material/Search";
import ButtonUnstyled from "@mui/base/ButtonUnstyled";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import CloseIcon from "@mui/icons-material/Close";
import FiatList from "../utils/Fiat";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { changeCurrency } from "../../redux/actions";

const FiatModal = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [filteredFiat, setFilteredFiat] = useState(FiatList);
  const [inputFiat, setInputFiat] = useState("");
  const currency = useSelector((state) => state.currency);
  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInputFiat("");
  };

  const handleFilter = () => {
    setFilteredFiat(
      FiatList.filter(
        (fiat) =>
          fiat.symbol.toLowerCase().includes(inputFiat.toLowerCase()) ||
          fiat.name.toLowerCase().includes(inputFiat.toLowerCase())
      )
    );
  };

  const handleInputFiat = (e) => {
    setInputFiat(e.target.value);
  };

  useEffect(() => {
    handleFilter();
  }, [inputFiat]);

  return (
    <div className="">
      <button
        onClick={handleClickOpen}
        className="flex flex-row items-center bg-gray-100 rounded p-2"
      >
        <img
          src={`https://s2.coinmarketcap.com/static/cloud/img/fiat-flags/${currency.symbol.toUpperCase()}.svg`}
          className="mr-1 h-4 w-4"
        />
        <h1 className="text-xs text-black font-semibold">{currency.symbol}</h1>
      </button>
      <Dialog
        className="font-poppins"
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
      >
        <div>
          <Toolbar className="bg-white shadow-md">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            ></IconButton>
            <Typography
              className="text-black font-bold"
              sx={{ flex: 1 }}
              variant="h7"
              component="div"
            >
              Select Currency
            </Typography>
            <ButtonUnstyled autoFocus color="inherit" onClick={handleClose}>
              <CloseIcon className="text-red-700" />
            </ButtonUnstyled>
          </Toolbar>
          <div className="px-5 pt-5 pb-3">
            <Box className="bg-white flex flex-row items-center border-gray-400 border rounded w-full h-10">
              <SearchIcon
                sx={{
                  color: "action.active",
                  mx: 1,
                  my: 1,
                }}
              />
              <InputBase
                placeholder="Search"
                id="input-with-sx"
                value={inputFiat}
                onChange={handleInputFiat}
                variant="standard"
                className="w-full"
                sx={{
                  mx: 1,
                }}
              />
            </Box>
          </div>
        </div>
        <DialogContent className="flex flex-col h-96 relative mt-1 mb-5">
          <Box className="grid grid-cols-1 xs:grid-cols-2 midSm:grid-cols-3 gap-2">
            {filteredFiat.map((fiat) => (
              <div
                key={fiat.id}
                onClick={() => {
                  dispatch(
                    changeCurrency({ sign: fiat.sign, symbol: fiat.symbol })
                  );
                  setInputFiat("");
                  setOpen(false);
                }}
                className="cursor-pointer flex flex-row items-center hover:bg-gray-200 rounded text-xs px-2 h-16 py-1"
              >
                <img
                  className="w-6 h-6 mr-2"
                  src={`https://s2.coinmarketcap.com/static/cloud/img/fiat-flags/${fiat.symbol.toUpperCase()}.svg`}
                />
                <div>
                  <h1 className="text-black font-semibold">{fiat.name}</h1>
                  <h1 className="">
                    {fiat.sign} {fiat.symbol}
                  </h1>
                </div>
              </div>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FiatModal;
