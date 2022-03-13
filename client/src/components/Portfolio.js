import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changeActive } from "../redux/actions";
import PortfoliosModal from "./modals/PortfoliosModal";
import axios from "axios";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import AddNewAssetModal from "./modals/AddNewAssetModal";
import Table from "./Table";

const Portfolio = ({ portfolios, setPortfolios, loading }) => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.currency);
  const activePortfolio = useSelector((state) => state.activePortfolio);
  const [currencyValue, setCurrencyValue] = useState(0);
  const [portfolioLel, setPortfolioLel] = useState({
    total: 0,
    profitLoss: 0,
    totalSpent: 0,
    profitLoss_percentage: 0,
  });

  useEffect(() => {
    axios
      .get(`https://api.coingecko.com/api/v3/coins/tether`)
      .then((res) => {
        setCurrencyValue(
          res.data.market_data.current_price[currency.symbol.toLowerCase()]
        );
      })
      .catch((err) => {
        console.log(err);
      });
    console.log("Redux is being recognized");
  }, [currency]);

  useEffect(() => {
    //Reset Value for Re-render. Without this, prevState will keep on adding up.
    setPortfolioLel({
      total: 0,
      profitLoss: 0,
      totalSpent: 0,
      percentage: 0,
    });

    const calculateTotalHoldings_Portfolio = (asset) => {
      return (
        asset.price *
        asset.transactions.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.quantity;
        }, 0)
      );
    };

    const calculateTotalSpent_Portfolio = (asset) => {
      return asset.transactions.reduce((accumulator, currentValue) => {
        return (
          accumulator +
          currentValue.quantity * (currentValue.buyPrice * currencyValue)
        );
      }, 0);
    };

    const calculateProfitLoss_Portfolio = (asset) => {
      return (
        calculateTotalHoldings_Portfolio(asset) -
        calculateTotalSpent_Portfolio(asset)
      );
    };

    for (let portfolio of portfolios) {
      for (let asset of portfolio.assets) {
        if (portfolio._id === activePortfolio._id) {
          setPortfolioLel((prevState) => ({
            total: prevState.total + calculateTotalHoldings_Portfolio(asset),
            profitLoss:
              prevState.profitLoss + calculateProfitLoss_Portfolio(asset),
            totalSpent:
              prevState.totalSpent + calculateTotalSpent_Portfolio(asset),
            profitLoss_percentage:
              ((prevState.profitLoss + calculateProfitLoss_Portfolio(asset)) /
                (prevState.totalSpent + calculateTotalSpent_Portfolio(asset))) *
              100,
          }));
          dispatch(changeActive(portfolio));
        }
      }
    }
  }, [currency, portfolios, activePortfolio._id, currencyValue]);

  return (
    <div className="px-4 xl:px-20 py-10 w-full font-poppins lg:py-0 ">
      <div className="font-poppins w-full max-w-5xl mx-auto h-full ">
        <div className="">
          <div className="flex flex-row justify-between items-start lg:hidden">
            <div>
              <h1 className="text-sm text-gray-700">Active Portfolio</h1>
              <h1 className="text-xl font-bold">{activePortfolio.name}</h1>
            </div>
            <PortfoliosModal
              setPortfolios={setPortfolios}
              activePortfolio={activePortfolio}
              portfolios={portfolios}
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end lg:pb-5">
            <div className="pt-10">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center">
                  <h1 className="text-sm text-gray-700">Portfolio Balance</h1>
                </div>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-row items-center">
                  <div className="py-1">
                    <h1 className="w-full text-left text-2xl font-bold">{`${
                      currency.sign
                    }${portfolioLel.total.toLocaleString("en", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}</h1>
                  </div>
                  {portfolioLel.profitLoss_percentage === Infinity ||
                  portfolioLel.profitLoss_percentage === undefined ? (
                    portfolioLel.profitLoss_percentage >= 0 ? (
                      <div className="ml-4 h-8 rounded-md w-18 p-2 text-white bg-green-500 flex flex-row items-center">
                        <TiArrowSortedUp className="" />
                        <h1 className="font-bold text-white text-sm rounded text-center ">
                          {`${Math.abs(
                            portfolioLel.profitLoss_percentage
                          ).toFixed(2)}%`}
                        </h1>
                      </div>
                    ) : (
                      <div className="ml-4 h-8 rounded-md w-18 p-2 text-white bg-red-500 flex flex-row items-center ">
                        <TiArrowSortedDown className="" />) : (
                        <h1 className="font-bold text-white text-sm rounded text-center ">
                          {`${Math.abs(
                            portfolioLel.profitLoss_percentage
                          ).toFixed(2)}%`}
                        </h1>
                      </div>
                    )
                  ) : (
                    <div className="ml-4 h-8 rounded-md w-18 p-2 text-white bg-green-500 flex flex-row items-center">
                      <TiArrowSortedUp className="" />
                      <h1 className="font-bold text-white text-sm rounded text-center ">
                        0.00%
                      </h1>
                    </div>
                  )}
                </div>
                <div className="flex flex-row">
                  <div>
                    {portfolioLel.profitLoss === undefined ? (
                      <h1>{`${currency.sign} 0.00`}</h1>
                    ) : (
                      <h1
                        className={`${
                          portfolioLel.profitLoss >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        } font-bold`}
                      >{`${portfolioLel.profitLoss >= 0 ? "+" : "-"} ${
                        currency.sign
                      }${Math.abs(portfolioLel.profitLoss).toLocaleString(
                        "en",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`}</h1>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right mt-10">
              <AddNewAssetModal
                activePortfolio={activePortfolio}
                portfolios={portfolios}
                setPortfolios={setPortfolios}
              />
            </div>
          </div>
        </div>
        <Table
          setPortfolios={setPortfolios}
          loading={loading}
          currencyValue={currencyValue}
          portfolios={portfolios}
          activePortfolio={activePortfolio}
        />
      </div>
    </div>
  );
};

export default Portfolio;
