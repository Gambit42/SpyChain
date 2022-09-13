import React, { useEffect, useState } from "react";
import ButtonUnstyled from "@mui/base/ButtonUnstyled";
import Dialog from "@mui/material/Dialog";
import Toolbar from "@mui/material/Toolbar";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import { changeActive, showNotification } from "../../redux/actions";
import { IoMdAddCircle } from "react-icons/io";

export default function FullScreenDialog({ portfolios, setPortfolios }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [char, setChar] = useState(0);
  const currency = useSelector((state) => state.currency);

  useEffect(() => {
    setChar(input.length);
  }, [input]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInput = (e) => {
    setError("");
    setInput(e.target.value);
  };

  const handleAddNewPortfolio = () => {
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

    const portfolioData = {
      portfolioName: input,
    };

    axios
      .post(
        "https://spy-chain.herokuapp.com/portfolio/create",
        portfolioData,
        config
      )
      .then((res) => {
        axios
          .get("https://spy-chain.herokuapp.com/user", config)
          .then((res) => {
            const result_portfolios = res.data.user.portfolios;
            setInput("");
            dispatch(
              changeActive(result_portfolios[result_portfolios.length - 1])
            );
            dispatch(
              showNotification({
                active: true,
                message: "Portfolio created!",
              })
            );
            setPortfolios(result_portfolios);
            setOpen(false);
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
        className="mx-auto w-4/5 sm:w-3/5 bg-blue-600 flex flex-row items-center justify-center p-2 mt-5 rounded lg:hidden"
        onClick={handleClickOpen}
      >
        <h1 className="text-sm font-bold text-white cursor-pointer">
          Add New Portfolio
        </h1>
      </button>
      <button
        className="hidden lg:flex w-full hover:bg-gray-100 flex-row items-center justify-start p-2 rounded mt-5"
        onClick={handleClickOpen}
      >
        <IoMdAddCircle className="w-5 h-5 mr-2" />
        <h1 className="text-sm font-bold cursor-pointer text-neutral-900">
          Add portfolio
        </h1>
      </button>
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"xs"}
        open={open}
        onClose={handleClose}
        className="font-poppins"
      >
        <div>
          <Toolbar className="bg-white shadow-md">
            {/* <ButtonUnstyled
              className="flex flex-row lg:hidden"
              autoFocus
              color="inherit"
              onClick={handleClose}
            >
              <TiArrowBack className="w-5 h-5 mr-1" />
              <h1 className="text-base font-bold">Back</h1>
            </ButtonUnstyled> */}
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
                Add Portfolio
              </Typography>
              <ButtonUnstyled autoFocus color="inherit" onClick={handleClose}>
                <CloseIcon className="text-red-700" />
              </ButtonUnstyled>
            </div>
          </Toolbar>
        </div>
        <DialogContent className="flex flex-col py-10 h-50 relative mt-1 mb-1 ">
          <div>
            <h1 className="text-sm font-bold pb-1">Portfolio Name</h1>
            <input
              value={input}
              onChange={handleInput}
              maxLength={16}
              className="w-full border border-gray-400 rounded py-1 px-2 focus:outline-none"
            ></input>
            <p className="text-sm italic text-red-500">{error}</p>
            <p className="text-sm">{`${char}/16 characters`}</p>
          </div>
          <div className="pt-5 flex flex-col items-center">
            <button
              className="w-4/5 sm:w-3/5 bg-blue-600 flex flex-row items-center justify-center p-2 rounded"
              onClick={handleAddNewPortfolio}
            >
              <h1 className="text-sm font-bold text-white cursor-pointer">
                Create Portfolio
              </h1>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
