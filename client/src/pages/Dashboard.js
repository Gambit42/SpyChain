import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import Portfolio from "../components/Portfolio";
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../redux/actions";
import Sidebar from "../components/Sidebar";
import Notifaction from "../components/utils/Notification";

const Dashboard = () => {
  const dispatch = useDispatch();
  const activePortfolio = useSelector((state) => state.activePortfolio);
  const [loading, setLoading] = useState(true);
  const currency = useSelector((state) => state.currency);
  const [portfolios, setPortfolios] = useState([]);
  // const [activePortfolio, setActivePortfolio] = useState({
  //   name: "",
  //   assets: [],
  // });

  useEffect(() => {
    const config = {
      method: ["GET"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

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
                console.log(res);
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
        setLoading(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
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
        <Portfolio
          loading={loading}
          portfolios={portfolios}
          setPortfolios={setPortfolios}
        />
      </div>
      <Notifaction />
    </div>
  );
};

export default Dashboard;
