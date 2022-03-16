import React, { useEffect, useState } from "react";
import ButtonUnstyled from "@mui/base/ButtonUnstyled";
import Dialog from "@mui/material/Dialog";
import Toolbar from "@mui/material/Toolbar";
import DialogContent from "@mui/material/DialogContent";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../../redux/actions";
import { FaPen } from "react-icons/fa";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function FullScreenDialog({ portfolio, setPortfolios }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [char, setChar] = useState(0);
  const [error, setError] = useState("");
  const currency = useSelector((state) => state.currency);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("xs"));

  useEffect(() => {
    setChar(input.length);
  }, [input]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInput(portfolio.name);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleEditPortfolio = () => {
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

    const portfolioData = {
      _id: portfolio._id,
      portfolioName: input,
    };

    axios
      .post(
        "https://spy-chain.herokuapp.com/portfolio/edit",
        portfolioData,
        config
      )
      .then((res) => {
        setOpen(false);
        setInput(portfolio.name);
        axios
          .get("https://spy-chain.herokuapp.com/user", config)
          .then((res) => {
            const result_portfolios = res.data.user.portfolios;
            setPortfolios(result_portfolios);
            dispatch(
              showNotification({
                active: true,
                message: "Name edited!",
              })
            );
            for (let individual_portfolio of result_portfolios) {
              for (let asset of individual_portfolio.assets) {
                axios
                  .get(`https://api.coingecko.com/api/v3/coins/${asset.id}`)
                  .then((res) => {
                    setPortfolios((prevState) =>
                      prevState.map((portfolio) => {
                        if (portfolio._id === individual_portfolio._id) {
                          return {
                            ...portfolio,
                            assets: portfolio.assets.map((item) => {
                              if (item.id === asset.id) {
                                return {
                                  ...item,
                                  price:
                                    res.data.market_data.current_price[
                                      currency.symbol.toLocaleLowerCase()
                                    ],
                                  price_change_percentage_24hr:
                                    res.data.market_data
                                      .price_change_percentage_24h,
                                };
                              } else {
                                return item;
                              }
                            }),
                          };
                        } else {
                          return portfolio;
                        }
                      })
                    );
                  })
                  .catch((err) => {});
              }
            }
          })
          .catch((error) => {});
      })
      .catch((error) => {
        setError(error.response.data.error);
        setTimeout(() => {
          setError("");
        }, 5000);
      });
  };

  return (
    <div className="w-full font-poppins">
      <button
        className="cursor-pointer hover:bg-gray-100 h-8 rounded px-2 w-full flex flex-row items-center justify-start"
        onClick={handleClickOpen}
      >
        <FaPen className="w-4 h-4 mr-2" />
        <h1>Edit name</h1>
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        className="font-poppins"
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <div>
          <Toolbar className="bg-white shadow-md">
            <div className="flex flex-row items-center justify-between w-full">
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
                Edit Portfolio
              </Typography>
              <ButtonUnstyled autoFocus color="inherit" onClick={handleClose}>
                <CloseIcon className="text-red-700" />
              </ButtonUnstyled>
            </div>
          </Toolbar>
        </div>
        <DialogContent className="flex flex-col py-10 h-50 relative mt-1 mb-1 w-full ">
          <div>
            <h1 className="text-sm font-bold pb-1">Portfolio Name</h1>
            <input
              value={input}
              onChange={handleInput}
              maxLength={16}
              className="w-full border border-gray-400 rounded py-1 px-2 focus:outline-none"
            />
            <p className="text-sm italic text-red-500">{error}</p>
            <p className="pt-1 text-sm">{`${char}/16 characters`}</p>
          </div>
          <div className="pt-5 flex flex-col items-center">
            <button
              className="w-4/5 sm:w-3/5 bg-blue-600 flex flex-row items-center justify-center p-2 rounded"
              onClick={handleEditPortfolio}
            >
              <h1 className="text-sm font-bold text-white cursor-pointer">
                Edit name
              </h1>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
