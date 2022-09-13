import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { AiFillPlusCircle } from "react-icons/ai";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ButtonUnstyled from "@mui/base/ButtonUnstyled";
import axios from "axios";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../../redux/actions";

const AddNewAssetModal = ({ activePortfolio, setPortfolios }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [inputCoin, setInputCoin] = useState("");
  const currency = useSelector((state) => state.currency);
  const [active_inputCoin, setActive_inputCoin] = useState(false);
  const [error, setError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState({
    id: "bitcoin",
    thumb: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    name: "Bitcoin",
    symbol: "BTC",
    quantity: "",
    buyPrice: 0,
    total: 0,
  });

  const [dropdowns, setDropdowns] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(false);
  };

  useEffect(() => {
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}
  `
      )
      .then((res) => {
        setSelectedCoin({
          ...selectedCoin,
          buyPrice:
            res.data.market_data.current_price[currency.symbol.toLowerCase()],
          total: selectedCoin.quantity * selectedCoin.buyPrice,
        });
      })
      .catch((err) => {});
  }, [currency, selectedCoin.id, open]);

  const handleInputCoin = (e) => {
    setInputCoin(e.target.value);
  };

  const handleTransaction = () => {
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

    axios
      .all([
        axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCoin.id}`),
        axios.get(`https://api.coingecko.com/api/v3/coins/tether`),
      ])
      .then(
        axios.spread((resCoin, resUSDT) => {
          const assetData = {
            _id: activePortfolio._id,
            id: selectedCoin.id,
            img: selectedCoin.thumb,
            name: selectedCoin.name,
            symbol: selectedCoin.symbol,
            buyPrice:
              selectedCoin.buyPrice /
              resUSDT.data.market_data.current_price[
                currency.symbol.toLocaleLowerCase()
              ],
            quantity: Number(selectedCoin.quantity),
          };

          if (selectedCoin.quantity > 0) {
            axios
              .post(
                "https://spy-chain.herokuapp.com/asset/add",
                assetData,
                config
              )
              .then((res) => {
                axios
                  .get("https://spy-chain.herokuapp.com/user", config)
                  .then((res) => {
                    const result_portfolios = res.data.user.portfolios;
                    setPortfolios(result_portfolios);
                    for (let individual_portfolio of result_portfolios) {
                      for (let asset of individual_portfolio.assets) {
                        axios
                          .get(
                            `https://api.coingecko.com/api/v3/coins/${asset.id}`
                          )
                          .then((res) => {
                            setPortfolios((prevState) =>
                              prevState.map((portfolio) => {
                                if (
                                  portfolio.name === individual_portfolio.name
                                ) {
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

                setSelectedCoin({
                  id: "bitcoin",
                  thumb:
                    "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
                  name: "Bitcoin",
                  symbol: "BTC",
                  quantity: "",
                  buyPrice: 0,
                  total: 0,
                });
                setOpen(false);
                dispatch(
                  showNotification({
                    active: true,
                    message: "Transaction added!",
                  })
                );
              })
              .catch((error) => {});
          } else {
            setError("Quantity should be greater than zero.");
            setTimeout(() => {
              setError("");
            }, 5000);
          }
        })
      )
      .catch((err) => {});
  };

  useEffect(() => {
    axios
      .get(
        `https://api.coingecko.com/api/v3/search?query=${inputCoin}
        `
      )
      .then((res) => {
        setDropdowns(res.data.coins.slice(0, 11));
      })
      .catch((err) => {});
  }, [inputCoin]);

  useEffect(() => {
    setSelectedCoin({
      ...selectedCoin,
      total: selectedCoin.quantity * selectedCoin.buyPrice,
    });
  }, [selectedCoin.quantity, selectedCoin.buyPrice]);

  return (
    <div>
      <Button
        className="bg-blue-400"
        variant="contained"
        onClick={handleClickOpen}
      >
        <AiFillPlusCircle />
        <p className="pl-2 text-sm font-poppins">Add New</p>
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        className="font-poppins"
      >
        <div>
          <Toolbar className="bg-white shadow-md">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            />
            <Typography
              className="text-black font-bold font"
              sx={{ flex: 1 }}
              variant="h7"
              component="div"
            >
              Add Transaction
            </Typography>
            <ButtonUnstyled autoFocus color="inherit" onClick={handleClose}>
              <CloseIcon className="text-red-700" />
            </ButtonUnstyled>
          </Toolbar>
          <div className="px-5 pt-10 relative">
            <Box className="px-2 flex flex-row items-center justify-between border-gray-400 border rounded w-full h-10">
              <InputBase
                autoFocus={true}
                sx={{ display: `${active_inputCoin ? "" : "none"}` }}
                autoComplete="off"
                onClick={handleDropdown}
                id="input-with-sx"
                value={inputCoin}
                placeholder="Search"
                onChange={handleInputCoin}
                variant="standard"
                className="hiidden h-8 py-1 pl-2 pr-10 w-full"
              />
              <div
                className={`${
                  active_inputCoin ? "hidden" : "flex"
                } flex-row w-full`}
              >
                <div
                  className="cursor-pointer flex flex-row items-center grow"
                  onClick={() => {
                    setActive_inputCoin(!active_inputCoin);
                    handleDropdownClose();
                  }}
                >
                  <img
                    alt="crypto"
                    className="w-5 h-5"
                    src={selectedCoin.thumb}
                  />
                  <div className="flex flex-row items-center px-2">
                    <h1 className="font-bold">{selectedCoin.name}</h1>
                    <h1 className="text-sm font-normal ml-1 text-gray-700">
                      {selectedCoin.symbol}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="mx-2 cursor-pointer">
                {active_inputCoin ? (
                  <IoIosArrowUp
                    onClick={() => {
                      setActive_inputCoin(!active_inputCoin);
                      handleDropdownClose();
                    }}
                    className="w-4 h-4 "
                  />
                ) : (
                  <IoIosArrowDown
                    onClick={() => {
                      setActive_inputCoin(!active_inputCoin);
                    }}
                    className="w-4 h-4"
                  />
                )}
              </div>
            </Box>
            <div className="flex flex-col items-center mt-1 rounded w-full z-40 relative">
              <div
                className={`overflow-y-auto bg-white h-60 border border-red-200 rounded absolute w-full z-20 ${
                  openDropdown ? "block" : "hidden"
                }`}
              >
                {dropdowns.map((dropdown, index) => (
                  <div
                    onClick={() => {
                      axios
                        .get(
                          `https://api.coingecko.com/api/v3/coins/${dropdown.id}
                    `
                        )
                        .then((res) => {
                          setSelectedCoin({
                            ...selectedCoin,
                            id: dropdown.id,
                            thumb: res.data.image.small,
                            name: res.data.name,
                            symbol: res.data.symbol.toUpperCase(),
                            buyPrice:
                              res.data.market_data.current_price[
                                currency.symbol.toLowerCase()
                              ],
                          });
                        })
                        .catch((err) => {});

                      handleDropdownClose();
                      setActive_inputCoin(false);
                      setInputCoin("");
                    }}
                    key={dropdown.id}
                    className="flex flex-row items-center py-2 px-2 my-1 rounded"
                  >
                    <img alt="crypto" className="w-6" src={dropdown.thumb} />
                    <div className="flex flex-row justify-center ml-1">
                      <h1 className="text-sm font-bold">{dropdown.name}</h1>
                      <h1 className="text-sm font-normal ml-1 text-gray-700">
                        {dropdown.symbol}
                      </h1>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogContent
          sx={{ padding: 0 }}
          className="flex flex-col items-center h-96"
          onClick={() => {
            setActive_inputCoin(false);
            handleDropdownClose();
          }}
        >
          <div className="w-full px-5 overflow-y-auto grow">
            <div className="pt-2">
              <h1 className="pb-1 font-bold">Quantity</h1>
              <div className="px-2 flex flex-row items-center justify-between border-gray-400 border rounded w-full h-10">
                <InputBase
                  id="input-with-sx"
                  autoComplete="off"
                  type="number"
                  variant="standard"
                  className="w-full mr-5"
                  value={selectedCoin.quantity}
                  onChange={(e) => {
                    setError("");
                    setSelectedCoin({
                      ...selectedCoin,
                      quantity: e.target.value,
                    });
                  }}
                />
                <h1 className="text-sm px-2 font-normal ml-1 text-gray-700">
                  {selectedCoin.symbol}
                </h1>
              </div>
              <p className="text-sm italic text-red-500">{error}</p>
            </div>
            <div className="pt-2">
              <h1 className="pb-1 font-bold">Buy Price Per Coin</h1>
              <Box className="flex flex-row items-center border-gray-400 border rounded pr-4 w-full h-10">
                <p className="pl-2 font-bold">{currency.sign}</p>
                <InputBase
                  id="input-with-sx"
                  type="number"
                  value={selectedCoin.buyPrice}
                  onChange={(e) => {
                    setSelectedCoin({
                      ...selectedCoin,
                      buyPrice: e.target.value,
                    });
                  }}
                  variant="standard"
                  className="w-full"
                  sx={{
                    mx: 1,
                  }}
                />
              </Box>
            </div>
            <div className="bg-gray-200 flex flex-col rounded mt-3 px-2 py-2">
              <h1 className="font-semibold text-gray-700">Total Spent</h1>
              <p className="pt-1 text-lg font-bold">{`${
                currency.sign
              } ${selectedCoin.total.toLocaleString("en")}`}</p>
            </div>
          </div>
          <div className="w-full py-10 flex flex-col items-center">
            <button
              className="w-4/5 sm:w-3/5 bg-blue-600 flex flex-row items-center justify-center p-2 rounded"
              onClick={handleTransaction}
            >
              <h1 className="text-sm font-bold text-white cursor-pointer">
                Add Transaction
              </h1>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewAssetModal;
