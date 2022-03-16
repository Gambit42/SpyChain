import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { getTransactions_asset, showNotification } from "../redux/actions";
import { IoIosArrowBack } from "react-icons/io";
import AddTransactionModal from "./modals/AddTransactionModal";
import { MdMoreHoriz } from "react-icons/md";
import styled from "styled-components";
import { FiTrash } from "react-icons/fi";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import TransactionsTable from "./TransactionsTable";

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

const Transactions = ({
  currencyValue,
  activePortfolio,
  portfolios,
  setPortfolios,
}) => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.currency);
  const transactionsAsset = useSelector((state) => state.transactionsAsset);
  const [openMore, setOpenMore] = useState(false);
  const [openMore2, setOpenMore2] = useState(false);

  const handleAssetDelete = () => {
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    const assetData = {
      _id: activePortfolio._id,
      asset_id: transactionsAsset._id,
    };

    axios
      .post("https://spy-chain.herokuapp.com/asset/delete", assetData, config)
      .then((res) => {
        axios
          .get("https://spy-chain.herokuapp.com/user", config)
          .then((res) => {
            const result_portfolios = res.data.user.portfolios;
            setPortfolios(result_portfolios);
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
            dispatch(getTransactions_asset(""));
            dispatch(
              showNotification({ active: true, message: "Asset deleted!" })
            );
          })
          .catch((error) => {});
      })
      .catch((error) => {});
  };

  const handleExitTransactions = () => {
    dispatch(getTransactions_asset(""));
  };

  useEffect(() => {
    for (let portfolio of portfolios) {
      if (portfolio._id === activePortfolio._id) {
        for (let asset of portfolio.assets) {
          if (asset.id === transactionsAsset.id) {
            axios
              .get(
                `https://api.coingecko.com/api/v3/coins/${transactionsAsset.id}`
              )
              .then((res) => {
                dispatch(
                  getTransactions_asset({
                    ...asset,
                    price:
                      res.data.market_data.current_price[
                        currency.symbol.toLocaleLowerCase()
                      ],
                  })
                );
              })
              .catch((err) => {});
          }
        }
      }
    }
  }, [currency, portfolios]);

  const calculateAvgBuyPrice = (asset) => {
    return (
      asset.transactions.reduce((accumulator, currentValue) => {
        return (
          accumulator +
          currentValue.buyPrice * currencyValue * currentValue.quantity
        );
      }, 0) /
      asset.transactions.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0)
    );
  };

  const calculateTotalHoldings = (asset) => {
    return (
      asset.price *
      asset.transactions.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0)
    );
  };

  const calculateTotalQuantity = (asset) => {
    return asset.transactions.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.quantity;
    }, 0);
  };

  const calculateAssetTotalSpent = (asset) => {
    return asset.transactions.reduce((accumulator, currentValue) => {
      return (
        accumulator +
        currentValue.quantity * (currentValue.buyPrice * currencyValue)
      );
    }, 0);
  };

  const calculateProfitLoss = (asset) => {
    return calculateTotalHoldings(asset) - calculateAssetTotalSpent(asset);
  };

  const calculateProfitLossPercentage = (asset) => {
    return (calculateProfitLoss(asset) / calculateAssetTotalSpent(asset)) * 100;
  };

  return (
    <div className="px-4 xl:px-20 py-10 w-full font-poppins ">
      <div className="font-poppins w-full max-w-5xl mx-auto h-full ">
        <div className="relative">
          <div className="flex flex-row justify-between items-center ">
            <button
              onClick={handleExitTransactions}
              className="flex flex-row items-center rounded py-1 px-2 bg-gray-200"
            >
              <IoIosArrowBack className="w-4 h-4" />
              <h1 className="font-medium text-sm">Back</h1>
            </button>
            <ClickAwayListener
              onClickAway={() => {
                setOpenMore(false);
              }}
            >
              <div className="sm:hidden">
                <div
                  className="flex flex-row items-center rounded py-1 px-2 bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setOpenMore(!openMore);
                  }}
                >
                  <MdMoreHoriz className="mr-1" />
                  <h1 className="font-medium text-sm">More</h1>
                </div>
                <Menu
                  className={`p-1 right-0 flex-col justify-center items-center z-40 mt-2 absolute shadow-2xl bg-white  w-32 h-10 rounded text-sm cursor-default ${
                    openMore ? "flex" : "hidden"
                  }`}
                >
                  <button
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded   flex flex-row items-center justify-start"
                    onClick={handleAssetDelete}
                  >
                    <FiTrash className="w-4 h-4 mr-2 text-red-500" />
                    <h1 className="font-medium text-red-500">Delete Asset</h1>
                  </button>
                </Menu>
              </div>
            </ClickAwayListener>
          </div>
          <div className="py-10">
            <div>
              <h1 className="text-sm text-gray-700">{`${transactionsAsset.name} (${transactionsAsset.symbol}) Balance`}</h1>
            </div>
            <div className="flex flex-row items-center py-1">
              <img className="w-8 h-8 mr-2" src={transactionsAsset.img} />
              {calculateTotalHoldings(transactionsAsset) >= 1 ? (
                <h1 className="font-bold text-2xl">{`${
                  currency.sign
                }${calculateTotalHoldings(transactionsAsset).toLocaleString(
                  "en",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`}</h1>
              ) : (
                <h1 className="font-bold text-2xl">{`${
                  currency.sign
                }${calculateTotalHoldings(transactionsAsset).toLocaleString(
                  "en",
                  {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6,
                  }
                )}`}</h1>
              )}
            </div>
            <div className="flex flex-col mt-5 md:flex-row md:mt-2">
              <div className="flex w-full flex-row justify-between py-4 md:flex-col md:w-24 md:py-2">
                <h1 className="text-sm text-gray-700">Quantity</h1>
                <h1 className="text-sm font-bold">{`${calculateTotalQuantity(
                  transactionsAsset
                )} ${transactionsAsset.symbol}`}</h1>
              </div>
              <div className="flex w-full flex-row justify-between py-4 md:flex-col md:w-28 md:py-2">
                <h1 className="text-sm text-gray-700">Avg buy price</h1>
                {calculateAvgBuyPrice(transactionsAsset) >= 1 ? (
                  <h1 className="font-bold text-sm">{`${
                    currency.sign
                  }${calculateAvgBuyPrice(transactionsAsset).toLocaleString(
                    "en",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}</h1>
                ) : (
                  <h1 className="font-bold text-sm">{`${
                    currency.sign
                  }${calculateAvgBuyPrice(transactionsAsset).toLocaleString(
                    "en",
                    {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    }
                  )}`}</h1>
                )}
              </div>
              <div className="flex w-full flex-row justify-between py-4   md:flex-col md:w-28 md:py-2">
                <h1 className="text-sm text-gray-700">Total profit/loss</h1>
                <div
                  className={`flex flex-row items-center ${
                    calculateProfitLossPercentage(transactionsAsset) < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  <div className="flex flex-row items-center mr-1">
                    {calculateProfitLossPercentage(transactionsAsset) < 0 ? (
                      <TiArrowSortedDown />
                    ) : (
                      <TiArrowSortedUp />
                    )}
                    <h1 className="text-sm font-bold">{`${Math.abs(
                      calculateProfitLossPercentage(transactionsAsset)
                    ).toLocaleString("en", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}%`}</h1>
                  </div>
                  <h1 className="text-sm font-bold">{`(${
                    currency.sign
                  }${Math.abs(
                    calculateProfitLoss(transactionsAsset)
                  ).toLocaleString("en", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })})`}</h1>
                </div>
              </div>
            </div>
          </div>
          <ClickAwayListener
            onClickAway={() => {
              setOpenMore2(false);
            }}
          >
            <div className="flex flex-row justify-end items-center">
              <div className="hidden sm:flex mr-5 relative">
                <div
                  className="flex flex-row items-center rounded py-2 px-2 bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setOpenMore2(!openMore2);
                  }}
                >
                  <MdMoreHoriz className="mr-1" />
                  <h1 className="font-medium text-sm">More</h1>
                </div>
                <Menu
                  className={`mt-10 p-1 right-0 flex-col justify-center items-center z-40 absolute shadow-2xl bg-white  w-32 h-10 rounded text-sm cursor-default ease-in duration-300 ${
                    openMore2 ? "flex" : "hidden"
                  }`}
                >
                  <button
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded   flex flex-row items-center justify-start"
                    onClick={handleAssetDelete}
                  >
                    <FiTrash className="w-4 h-4 mr-2 text-red-500" />
                    <h1 className="font-medium text-red-500">Delete Asset</h1>
                  </button>
                </Menu>
              </div>
              <AddTransactionModal
                asset={transactionsAsset}
                activePortfolio={activePortfolio}
                portfolios={portfolios}
                setPortfolios={setPortfolios}
              />
            </div>
          </ClickAwayListener>
          <TransactionsTable
            transactionsAsset={transactionsAsset}
            currencyValue={currencyValue}
            setPortfolios={setPortfolios}
          />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
