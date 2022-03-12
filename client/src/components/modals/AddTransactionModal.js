import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { BsPlusLg } from "react-icons/bs";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ButtonUnstyled from "@mui/base/ButtonUnstyled";
import axios from "axios";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../../redux/actions";

const AddTransactionModal = ({ setPortfolios, asset }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [inputCoin, setInputCoin] = useState("");
  const currency = useSelector((state) => state.currency);
  const activePortfolio = useSelector((state) => state.activePortfolio);
  const [selectedCoin, setSelectedCoin] = useState({
    id: asset.id,
    thumb: asset.img,
    name: asset.name,
    symbol: asset.symbol,
    quantity: "",
    buyPrice: 0,
    total: 0,
  });

  const [openDropdown, setOpenDropdown] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    console.log("hehe boi");
  };

  const handleDropdown = () => {
    setOpenDropdown(!openDropdown);
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
      .catch((err) => {
        console.log(err);
      });
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
            quantity: selectedCoin.quantity,
          };

          if (selectedCoin.quantity > 0) {
            axios
              .post("http://localhost:4000/asset/add", assetData, config)
              .then((res) => {
                console.log(res.data);
                axios
                  .get("http://localhost:4000/user", config)
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
                          .catch((err) => {
                            console.log(err);
                          });
                      }
                    }
                  })
                  .catch((error) => {
                    console.log(error.message);
                  });

                setSelectedCoin({
                  id: asset.id,
                  thumb: asset.img,
                  name: asset.name,
                  symbol: asset.symbol,
                  quantity: "",
                  buyPrice: 0,
                  total: 0,
                });
                dispatch(
                  showNotification({
                    active: true,
                    message: "Transaction added!",
                  })
                );
                setOpen(false);
              })
              .catch((error) => {
                console.log(error.response.data.error);
                // setError(error.response.data.error);
              });
          } else {
            setError("Quantity should be greater than zero.");
            setTimeout(() => {
              setError("");
            }, 5000);
          }
        })
      )
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    setSelectedCoin({
      ...selectedCoin,
      total: selectedCoin.quantity * selectedCoin.buyPrice,
    });
  }, [selectedCoin.quantity, selectedCoin.buyPrice]);

  return (
    <div>
      <button
        className="hover:bg-gray-200 p-2 rounded-full"
        onClick={handleClickOpen}
      >
        <BsPlusLg />
      </button>
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
                sx={{ display: "none" }}
                autoComplete="off"
                onClick={handleDropdown}
                id="input-with-sx"
                value={inputCoin}
                placeholder="Search"
                onChange={handleInputCoin}
                variant="standard"
                className="hiidden h-8 py-1 pl-2 pr-10 w-full"
              />
              <div className="flex flex-row w-full">
                <div className="flex flex-row items-center grow">
                  <img alt="crypto" className="w-5" src={selectedCoin.thumb} />
                  <div className="flex flex-row items-center px-2">
                    <h1 className="font-bold">{selectedCoin.name}</h1>
                    <h1 className="text-sm font-normal ml-1 text-gray-700">
                      {selectedCoin.symbol}
                    </h1>
                  </div>
                </div>
              </div>
            </Box>
          </div>
        </div>
        <DialogContent
          sx={{ padding: 0 }}
          className="flex flex-col items-center h-96"
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
              <h1 className="pb-1 font-bold">Price Per Coin</h1>
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
              <p
                className="pt-1 text-lg font-bold"
                onClick={() => console.log(selectedCoin.total)}
              >{`${currency.sign} ${selectedCoin.total.toLocaleString(
                "en"
              )}`}</p>
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

export default AddTransactionModal;
