import React, { useState, useEffect } from "react";
import { FaWallet } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import TotalPortfolio from "./TotalPortfolio";
import CreatePortfolioModal from "./modals/CreatePortfolioModal";
import { HiCheckCircle } from "react-icons/hi";
import { MdMoreHoriz } from "react-icons/md";
import { IoIosSettings, IoMdCloseCircle } from "react-icons/io";
import EditPortfoliomodal from "./modals/EditPortfolioModal";
import { FiTrash } from "react-icons/fi";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import styled from "styled-components";
import axios from "axios";
import { changeActive, showNotification } from "../redux/actions";

const Menu = styled.div`
  &::before {
    content: "";
    position: absolute;
    border: 11px solid transparent;
    border-bottom-color: #fff;
    top: -20px;
    right: 16px;
    z-index: 1;
  }
`;
const Sidebar = ({
  portfolios,
  setPortfolios,
  // setActivePortfolio,
  // activePortfolio,
}) => {
  const activePortfolio = useSelector((state) => state.activePortfolio);
  const dispatch = useDispatch();
  const [total, setTotal] = useState(0);
  const [active_portfolioSettings, setActive_portfolioSettings] = useState("");
  const currency = useSelector((state) => state.currency);
  const [settings, setSettings] = useState(false);

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

  const calculateTotalHoldings_Portfolio = (asset) => {
    return (
      asset.price *
      asset.transactions.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0)
    );
  };

  const handleSettings = () => {
    setSettings(!settings);
  };

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
      .post("http://localhost:4000/portfolio/delete", portfolioData, config)
      .then((res) => {
        console.log(res.data);
        axios
          .get("http://localhost:4000/user", config)
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
                  .catch((err) => {
                    console.log(err);
                  });
              }
            }
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        console.log(error.response.data.error);
      });
  };

  const handle_active_portfolioSettings = (name) => {
    if (name === active_portfolioSettings) {
      return setActive_portfolioSettings("");
    }
    setActive_portfolioSettings(name);
  };

  return (
    <div className="w-96 hidden lg:flex font-pop py-10 pr-5 font-poppins">
      <div className="w-full px-4">
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
        <div>
          <ClickAwayListener
            onClickAway={() => {
              setActive_portfolioSettings("");
            }}
          >
            <div className="grow py-5 relative">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.name}
                  className={`border-b border-gray-200 rounded flex flex-row justify-between items-center mt-2 p-3 cursor-pointer  ${
                    portfolio._id === activePortfolio._id ? "bg-gray-50" : ""
                  }`}
                  onClick={() => {
                    if (!settings) {
                      dispatch(
                        changeActive({
                          ...portfolio,
                          name: portfolio.name,
                        })
                      );
                    }
                  }}
                >
                  <div className="flex flex-row justify-between items-center w-full">
                    <div className="text-left">
                      <h1
                        className="text-sm font-bold"
                        onClick={() => {
                          console.log(portfolio);
                        }}
                      >
                        {portfolio.name}
                      </h1>
                      <TotalPortfolio
                        currency={currency}
                        portfolio={portfolio}
                      />
                    </div>
                    {portfolio._id === activePortfolio._id &&
                    settings === false ? (
                      <HiCheckCircle className="text-green-500 w-5 h-5" />
                    ) : (
                      ""
                    )}
                  </div>
                  <div
                    className={`hover:bg-gray-200  p-1 rounded-full ${
                      !settings ? "hidden" : "flex"
                    }`}
                  >
                    <MdMoreHoriz
                      className="w-5 h-5"
                      onClick={() => {
                        handle_active_portfolioSettings(portfolio.name);
                      }}
                    />
                    <Menu
                      className={`p-2 right-0 flex-col z-40 mt-7 absolute shadow-2xl bg-white w-30 h-20 rounded text-sm cursor-default ${
                        portfolio.name === active_portfolioSettings
                          ? "flex"
                          : "hidden"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setActive_portfolioSettings("");
                        }}
                      >
                        <EditPortfoliomodal
                          setPortfolios={setPortfolios}
                          portfolio={portfolio}
                          // setActivePortfolio={setActivePortfolio}
                        />
                      </div>
                      <button
                        className="cursor-pointer hover:bg-gray-100 rounded px-2 w-full flex flex-row items-center justify-start h-8"
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
            </div>
          </ClickAwayListener>
          <div>
            <CreatePortfolioModal setPortfolios={setPortfolios} />
            <button
              className="hidden lg:flex w-full hover:bg-gray-100 flex-row items-center justify-start p-2 rounded mt-5"
              onClick={handleSettings}
            >
              {!settings ? (
                <>
                  <IoIosSettings className="w-5 h-5 mr-2" />
                  <h1 className="text-sm font-bold cursor-pointer text-neutral-900">
                    Manage portfolios
                  </h1>
                </>
              ) : (
                <>
                  <IoMdCloseCircle className="w-5 h-5 mr-2" />
                  <h1 className="text-sm font-bold cursor-pointer text-neutral-900">
                    Edit exit
                  </h1>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
