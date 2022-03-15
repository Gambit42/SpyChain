import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../redux/actions";
import { FiTrash } from "react-icons/fi";
import axios from "axios";

const TransactionsTable = ({
  transactionsAsset,
  currencyValue,
  setPortfolios,
}) => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.currency);
  const activePortfolio = useSelector((state) => state.activePortfolio);

  const handleDeleteTransaction = (transaction_id) => {
    // console.log
    // (`Transaction id: ${transaction_id}
    // Asset id: ${transaction_id}
    // Portfolio id: ${activePortfolio._id}`)
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    const transactionData = {
      _id: activePortfolio._id,
      asset_id: transactionsAsset._id,
      transaction_id: transaction_id,
    };
    axios
      .post(
        "https://spy-chain.herokuapp.com/asset/transaction/delete",
        transactionData,
        config
      )
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
              showNotification({
                active: true,
                message: "Transaction deleted!",
              })
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

  return (
    <table className="mt-5 w-full table-auto">
      <thead>
        <tr className="h-14 shadow-sm">
          <td className="text-xs font-bold text-gray-800 bg-gray-200 px-4">
            Quantity
          </td>
          <td className="text-xs font-bold text-gray-800 bg-gray-200 px-4 text-right">
            Buy Price
          </td>
          <td className=" text-xs font-bold text-gray-800 bg-gray-200 px-4 text-right">
            Action
          </td>
        </tr>
      </thead>
      <tbody>
        {transactionsAsset.transactions.map((transaction) => {
          return (
            <tr
              key={transaction._id}
              className="h-16 border-b border-gray-300 hover:bg-gray-50 "
            >
              <td className="text-sm p-2 font-semibold">{`${transaction.quantity} ${transactionsAsset.symbol}`}</td>
              <td className="p-2 text-sm text-right">
                {`${currency.sign}${(
                  transaction.buyPrice * currencyValue
                ).toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </td>
              <td className="text-sm text-right p-2">
                <div className="w-full flex justify-end">
                  <FiTrash
                    className="w-6 h-6 mr-2 text-red-600 cursor-pointer"
                    onClick={() => {
                      handleDeleteTransaction(transaction._id);
                    }}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TransactionsTable;
