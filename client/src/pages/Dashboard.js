import React, { useState, useEffect, lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import Portfolio from "../components/Portfolio";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import Notifaction from "../components/utils/Notification";
import Loading from "../pages/Loading";
const Transactions = lazy(() => import("../components/Transactions"));

const Dashboard = () => {
  const activePortfolio = useSelector((state) => state.activePortfolio);
  const [loading, setLoading] = useState(true);
  const [currencyValue, setCurrencyValue] = useState();
  const currency = useSelector((state) => state.currency);
  const [portfolios, setPortfolios] = useState([]);
  const transactionsAsset = useSelector((state) => state.transactionsAsset);

  useEffect(() => {
    const config = {
      method: ["GET"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

    axios
      .get(`https://api.coingecko.com/api/v3/coins/tether`)
      .then((res) => {
        setCurrencyValue(
          res.data.market_data.current_price[currency.symbol.toLowerCase()]
        );
      })
      .catch((err) => {});

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
        setLoading(false);
      })
      .catch((error) => {});
  }, [currency]);

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="min-h-screen flex flex-row mx-auto max-w-screen-2xl mt-8">
        <Sidebar
          portfolios={portfolios}
          // setActivePortfolio={setActivePortfolio}
          activePortfolio={activePortfolio}
          setPortfolios={setPortfolios}
        />
        {Object.entries(transactionsAsset).length !== 0 ? (
          <Suspense fallback={<Loading />}>
            <Transactions
              currencyValue={currencyValue}
              activePortfolio={activePortfolio}
              portfolios={portfolios}
              setPortfolios={setPortfolios}
            />
          </Suspense>
        ) : (
          <Portfolio
            loading={loading}
            portfolios={portfolios}
            setPortfolios={setPortfolios}
            currencyValue={currencyValue}
          />
        )}
      </div>
      <Notifaction />
    </div>
  );
};

export default Dashboard;
