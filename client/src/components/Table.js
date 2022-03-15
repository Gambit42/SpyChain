import React, { useState } from "react";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import AddTransactionModal from "./modals/AddTransactionModal";
import { showNotification, getTransactions_asset } from "../redux/actions";
import { FiTrash } from "react-icons/fi";
import axios from "axios";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import styled from "styled-components";

const Menu = styled.div`
  &::before {
    content: "";
    position: absolute;
    border: 11px solid transparent;
    border-bottom-color: #fff;
    top: -21px;
    right: 7px;
    z-index: 1;
  }
`;

const Table = ({ currencyValue, portfolios, loading, setPortfolios }) => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.currency);
  const activePortfolio = useSelector((state) => state.activePortfolio);
  const [transactionsMenu, setTransactionsMenu] = useState("");
  const tableHeaders = [
    "Name",
    "Price",
    "Holdings",
    "Avg. Buy Price",
    "Profit/Loss",
    "Actions",
  ];

  const handleAssetDelete = (portfolio_id, asset_id) => {
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    const assetData = {
      _id: portfolio_id,
      asset_id: asset_id,
    };

    axios
      .post("https://spy-chain.herokuapp.com/asset/delete", assetData, config)
      .then((res) => {
        console.log(res.data);
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
                  .catch((err) => {
                    console.log(err);
                  });
              }
            }
            dispatch(
              showNotification({ active: true, message: "Asset deleted!" })
            );
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        console.log(error.response.data.error);
      });
  };

  const handleTransactionsMenu = (asset) => {
    if (asset.id === transactionsMenu) {
      return setTransactionsMenu("");
    }
    setTransactionsMenu(asset.id);
  };

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
    return Math.abs(
      (calculateProfitLoss(asset) / calculateAssetTotalSpent(asset)) * 100
    );
  };

  return (
    <table className="mt-5 w-full table-auto">
      <thead>
        <tr className="h-14 shadow-sm">
          {tableHeaders.map((tableHead, index) => (
            <td
              key={index}
              className={`${
                tableHead === "Name" || tableHead === "Holdings"
                  ? ""
                  : "hidden md:table-cell"
              }  ${tableHead === "Name" ? "rounded-tl-lg" : ""} ${
                tableHead === "Holdings"
                  ? "rounded-tr-lg midSm:rounded-none"
                  : ""
              } ${tableHead === "Name" ? "rounded-tl-lg" : ""} ${
                tableHead === "Actions" ? "rounded-tr-lg midSm:table-cell" : ""
              } ${tableHead === "Name" ? "" : "text-right"} ${
                tableHead === "Price" ? "xs:table-cell" : ""
              } text-xs font-bold text-gray-800 bg-gray-200 px-4`}
            >
              {tableHead}
            </td>
          ))}
        </tr>
      </thead>
      {loading ? (
        <tbody></tbody>
      ) : activePortfolio.assets.length === 0 ? (
        <tbody className="text-center">
          <tr>
            <td className="pt-5" colSpan={6}>
              Portfolio is empty
            </td>
          </tr>
        </tbody>
      ) : (
        <ClickAwayListener
          onClickAway={() => {
            setTransactionsMenu("");
          }}
        >
          <tbody>
            {portfolios.map((portfolio) =>
              portfolio.assets.map((asset) => {
                if (portfolio._id === activePortfolio._id) {
                  return (
                    <tr
                      className="h-24 xs:h-20 border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
                      key={asset.id}
                      onClick={(e) => {
                        console.log(asset);
                        dispatch(getTransactions_asset(asset));
                      }}
                    >
                      <td className="p-2">
                        <div className="flex flex-col">
                          <div className="flex flex-row items-start justify-start xl:items-center">
                            <img
                              alt={asset.img}
                              src={asset.img}
                              className="w-6 h-6 mr-3 mt-1 xl:mt-0 xl:mr-0"
                            />
                            <div className="flex flex-col h-full xl:flex-row xl:items-center">
                              <h1 className="text-sm font-bold xl:mx-2">
                                {asset.name}
                              </h1>
                              <div className="flex flex-row">
                                <h1 className="text-xs uppercase font-semibold text-gray-700">
                                  {asset.symbol}
                                </h1>
                                <div
                                  className={`pl-1 text-gray-700 font-medium xs:hidden text-xs `}
                                >
                                  {asset.price !== undefined ? (
                                    asset.price > 1 ? (
                                      <div className="flex flex-row items-center">
                                        {/* {asset.price_change_percentage_24hr >
                                        0 ? (
                                          <TiArrowSortedUp />
                                        ) : (
                                          <TiArrowSortedDown />
                                        )} */}
                                        <h1>{`(${
                                          currency.sign
                                        }${asset.price.toLocaleString("en", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })})`}</h1>
                                      </div>
                                    ) : (
                                      <div className="flex flex-row items-center">
                                        {/* {asset.price_change_percentage_24hr >
                                        0 ? (
                                          <TiArrowSortedUp />
                                        ) : (
                                          <TiArrowSortedDown />
                                        )} */}
                                        <h1 className="">{`(${
                                          currency.sign
                                        }${asset.price.toLocaleString("en", {
                                          minimumFractionDigits: 6,
                                          maximumFractionDigits: 6,
                                        })})`}</h1>
                                      </div>
                                    )
                                  ) : (
                                    <h1 className="">{`(${currency.sign}0.00)`}</h1>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 hidden xs:table-cell text-right">
                        <div className="flex flex-col items-end">
                          {asset.price !== undefined ? (
                            asset.price > 1 ? (
                              <h1 className="text-sm font-medium text-gray-900">{`${
                                currency.sign
                              }${asset.price.toLocaleString("en", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}</h1>
                            ) : (
                              <h1 className="text-sm font-medium text-gray-900">{`${
                                currency.sign
                              }${asset.price.toLocaleString("en", {
                                minimumFractionDigits: 6,
                                maximumFractionDigits: 6,
                              })}`}</h1>
                            )
                          ) : (
                            <h1>{`${currency.sign}0.00`}</h1>
                          )}
                          {/* Double conditional. First is to check if undefined before performing function. */}
                          {asset.price_change_percentage_24hr !== undefined ? (
                            asset.price_change_percentage_24hr < 0 ? (
                              <div className="font-semibold text-red-600 flex flex-row items-center">
                                <TiArrowSortedDown className="h-4 w-4" />
                                <h1 className="text-sm">
                                  {`${Math.abs(
                                    asset.price_change_percentage_24hr.toFixed(
                                      2
                                    )
                                  )}%`}
                                </h1>
                              </div>
                            ) : (
                              <div className="font-semibold text-green-600 flex flex-row items-center">
                                <TiArrowSortedUp className="h-4 w-4" />
                                <h1 className="text-sm">
                                  {`${asset.price_change_percentage_24hr.toFixed(
                                    2
                                  )}%`}
                                </h1>
                              </div>
                            )
                          ) : (
                            <div className="font-semibold text-green-600 flex flex-row items-center">
                              <TiArrowSortedUp className="h-4 w-4" />
                              <h1 className="">0.00%</h1>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="">
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-medium text-gray-900">
                              {/* Reduce function. It is too complicated to initialize value inside jsx. This is more elegant. */}
                              <span>{currency.sign}</span>
                              {calculateTotalHoldings(asset).toLocaleString(
                                "en"
                              )}
                            </p>
                            <p className="font-semibold text-xs text-gray-700">
                              {/* Reduce function. It is too complicated to initialize value inside jsx. This is more elegant. */}
                              {`${asset.transactions
                                .reduce((accumulator, currentValue) => {
                                  return accumulator + currentValue.quantity;
                                }, 0)
                                .toLocaleString("en")} ${asset.symbol}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="p-2 hidden md:table-cell"
                        onClick={() => {
                          console.log(asset.transactions);
                        }}
                      >
                        <div className="flex flex-col items-end">
                          <h1 className="text-sm font-medium text-gray-900">
                            <span>{currency.sign}</span>
                            {calculateAvgBuyPrice(asset) > 1
                              ? calculateAvgBuyPrice(asset).toLocaleString(
                                  "en",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : calculateAvgBuyPrice(asset).toLocaleString(
                                  "en",
                                  {
                                    minimumFractionDigits: 6,
                                    maximumFractionDigits: 6,
                                  }
                                )}
                          </h1>
                        </div>
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        <div
                          className="flex flex-col items-end"
                          onClick={() => {
                            console.log(calculateProfitLoss(asset));
                          }}
                        >
                          {calculateProfitLoss(asset) < 0 ? (
                            <h1 className="text-sm font-medium text-gray-900">
                              {`${calculateProfitLoss(asset) >= 0 ? "" : "-"} ${
                                currency.sign
                              }${(
                                calculateProfitLoss(asset) * -1
                              ).toLocaleString("en", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`}
                            </h1>
                          ) : (
                            <h1 className="text-sm font-medium text-gray-900">
                              {`${calculateProfitLoss(asset) >= 0 ? "" : "-"} ${
                                currency.sign
                              }${calculateProfitLoss(asset).toLocaleString(
                                "en",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}`}
                            </h1>
                          )}

                          <div className="text-sm">
                            {calculateProfitLoss(asset) < 0 ? (
                              <div className="font-semibold text-red-600 flex flex-row items-center">
                                <TiArrowSortedDown className="h-4 w-4" />
                                <h1 className="">
                                  {`${calculateProfitLossPercentage(
                                    asset
                                  ).toLocaleString("en", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}%`}
                                </h1>
                              </div>
                            ) : (
                              <div className="font-semibold text-green-600 flex flex-row items-center">
                                <TiArrowSortedUp className="h-4 w-4" />
                                <h1 className="">
                                  {`${calculateProfitLossPercentage(
                                    asset
                                  ).toLocaleString("en", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}%`}
                                </h1>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 hidden midSm:table-cell">
                        <div className="flex flex-row justify-end">
                          <div
                            className="hover:bg-gray-200 p-2 rounded-full cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <AddTransactionModal
                              asset={asset}
                              activePortfolio={activePortfolio}
                              portfolios={portfolios}
                              setPortfolios={setPortfolios}
                            />
                          </div>
                          <div
                            className="hover:bg-gray-200 p-4 rounded-full relative cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionsMenu(asset);
                            }}
                          >
                            <BsThreeDotsVertical />
                            <Menu
                              className={`p-2 right-0 flex-col z-40 mt-4 absolute shadow-2xl bg-white w-40 h-20 rounded text-sm cursor-default ${
                                asset.id === transactionsMenu
                                  ? "flex"
                                  : "hidden"
                              }`}
                            >
                              <button
                                className="cursor-pointer hover:bg-gray-100 rounded px-2 h-full w-full flex flex-row items-center justify-start"
                                onClick={() => {
                                  dispatch(getTransactions_asset(asset));
                                }}
                              >
                                <FaExchangeAlt className="w-4 h-4  mr-2" />
                                <h1>Transactions</h1>
                              </button>
                              <button
                                className="cursor-pointer hover:bg-gray-100 rounded px-2 h-full w-full flex flex-row items-center justify-start "
                                onClick={() => {
                                  handleAssetDelete(portfolio._id, asset._id);
                                }}
                              >
                                <FiTrash className="w-4 h-4 mr-2 text-red-600" />
                                <h1 className="font-medium text-red-600">
                                  Delete asset
                                </h1>
                              </button>
                            </Menu>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })
            )}
          </tbody>
        </ClickAwayListener>
      )}
    </table>
  );
};

export default Table;
