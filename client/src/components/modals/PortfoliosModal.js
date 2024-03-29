import React, { useEffect, useState } from "react";
import ButtonUnstyled from "@mui/base/ButtonUnstyled";
import { MdMoreHoriz } from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { FaWallet } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import styled from "styled-components";
import DialogContent from "@mui/material/DialogContent";
import { IoIosArrowDown } from "react-icons/io";
import { FiTrash } from "react-icons/fi";
import TotalPortfolio from "../TotalPortfolio";
import EditPortfoliomodal from "./EditPortfolioModal";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CreatePortfolioModal from "./CreatePortfolioModal";
import { useSelector, useDispatch } from "react-redux";
import { changeActive, showNotification } from "../../redux/actions";

import axios from "axios";

const Menu = styled.div`
  &::before {
    content: "";
    position: absolute;
    border: 11px solid transparent;
    border-bottom-color: #fff;
    top: -20px;
    right: 40px;
    z-index: 1;
  }
`;
export default function FullScreenDialog({ setPortfolios, portfolios }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [active_portfolioSettings, setActive_portfolioSettings] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const currency = useSelector((state) => state.currency);
  const activePortfolio = useSelector((state) => state.activePortfolio);

  useEffect(() => {
    setTotal(0);
    const calculateTotal = () => {
      for (let portfolio of portfolios) {
        for (let asset of portfolio.assets) {
          setTotal(
            (prevState) => prevState + calculateTotalHoldings_Portfolio(asset)
          );
        }
      }
    };
    calculateTotal();
  }, [portfolios]);

  const handleDeletePortfolio = (portfolio_id) => {
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

    const portfolioData = {
      _id: portfolio_id,
    };

    axios
      .post(
        "https://spy-chain.herokuapp.com/portfolio/delete",
        portfolioData,
        config
      )
      .then((res) => {
        axios
          .get("https://spy-chain.herokuapp.com/user", config)
          .then((res) => {
            const result_portfolios = res.data.user.portfolios;
            setPortfolios(result_portfolios);
            dispatch(changeActive(result_portfolios[0]));
            dispatch(
              showNotification({
                active: true,
                message: "Portfolio deleted!",
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handle_active_portfolioSettings = (name) => {
    if (name === active_portfolioSettings) {
      return setActive_portfolioSettings("");
    }
    setActive_portfolioSettings(name);
  };

  const calculateTotalHoldings_Portfolio = (asset) => {
    return (
      asset.price *
      asset.transactions.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0)
    );
  };

  return (
    <div className="h-full font-poppins">
      <ButtonUnstyled
        className="flex flex-row rounded-md p-2"
        onClick={handleClickOpen}
      >
        <IoIosArrowDown className="w-5 h-5" />
      </ButtonUnstyled>

      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"sm"}
        open={open}
        onClose={handleClose}
        className="font-poppins lg:hidden"
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
              Your Portfolios
            </Typography>
            <ButtonUnstyled autoFocus color="inherit" onClick={handleClose}>
              <CloseIcon className="text-red-700" />
            </ButtonUnstyled>
          </Toolbar>
        </div>
        <DialogContent className="flex flex-col py-10 h-96 relative mt-1 mb-1">
          <div className="flex flex-row items-center pb-3 border-b border-gray-100">
            <div className="mr-3 flex flex-col justify-center items-center bg-blue-600 p-2 rounded-full">
              <FaWallet className="text-white w-4 h-4" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-bold">All Portfolios</h1>
              <p className="text-sm text-gray-700">
                {`${currency.sign}${total.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </p>
            </div>
          </div>
          <div className="py-5 px-4 grow">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio._id}
                className={`border-b border-gray-200 rounded flex flex-row justify-between items-center mt-2 p-3 cursor-pointer ${
                  portfolio._id === activePortfolio._id ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex flex-row items-center">
                  <div className="text-left">
                    <h1 className="text-sm font-bold">{portfolio.name}</h1>
                    <TotalPortfolio currency={currency} portfolio={portfolio} />
                  </div>
                </div>
                <div className="hover:bg-gray-200  p-1 rounded-full">
                  <MdMoreHoriz
                    className="w-5 h-5"
                    onClick={() => {
                      handle_active_portfolioSettings(portfolio.name);
                    }}
                  />
                  <Menu
                    className={`p-2 right-0 flex-col z-40 mt-4 mr-4 absolute shadow-2xl bg-white  w-40 h-28 rounded text-sm cursor-default ${
                      portfolio.name === active_portfolioSettings
                        ? "flex"
                        : "hidden"
                    }`}
                  >
                    <button
                      className="cursor-pointer hover:bg-gray-100 rounded px-2 h-full w-full flex flex-row items-center justify-start"
                      onClick={() => {
                        dispatch(changeActive(portfolio));
                        setActive_portfolioSettings("");
                        handleClose();
                      }}
                    >
                      <FaEye className="w-4 h-4  mr-2" />
                      <h1 className="">View portfolio</h1>
                    </button>
                    <div
                      onClick={() => {
                        setActive_portfolioSettings("");
                      }}
                    >
                      <EditPortfoliomodal
                        setPortfolios={setPortfolios}
                        portfolio={portfolio}
                      />
                    </div>
                    <button
                      className="cursor-pointer hover:bg-gray-100 rounded px-2 h-full w-full flex flex-row items-center justify-start"
                      onClick={() => {
                        handleDeletePortfolio(portfolio._id);
                      }}
                    >
                      <FiTrash className="w-4 h-4 mr-2 text-red-500" />
                      <h1 className="font-medium text-red-500">
                        Delete portfolio
                      </h1>
                    </button>
                  </Menu>
                </div>
              </div>
            ))}
            <p className="text-left text-sm italic text-red-500 w-full pt-2 pl-6 h-10">
              {error}
            </p>
          </div>
          <div className="pt-5 flex flex-col items-center">
            <CreatePortfolioModal
              setPortfolios={setPortfolios}
              portfolios={portfolios}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
