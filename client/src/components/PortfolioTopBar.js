import React, { useState, useEffect } from "react";
import PortfoliosModal from "./PortfoliosModal";
import { useSelector } from "react-redux";

const PortfolioTopBar = ({
  portfolios,
  setPortfolios,
  activePortfolio,
  setActivePortfolio,
}) => {
  const [total, setTotal] = useState(0);
  const currency = useSelector((state) => state.currency);

  useEffect(() => {
    setTotal(0);

    for (let portfolio of portfolios) {
      for (let asset of portfolio.assets) {
        if (portfolio.name === activePortfolio.name) {
          setTotal(
            (prevState) => prevState + calculateTotalHoldings_Portfolio(asset)
          );
        }
      }
    }
  }, [currency, portfolios, activePortfolio.name]);

  const calculateTotalHoldings_Portfolio = (asset) => {
    return (
      asset.price *
      asset.transactions.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0)
    );
  };

  return (
    <div className="font-poppins w-full px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">{activePortfolio.name}</h1>
            <h1 className="text-sm text-gray-700">{`${
              currency.sign
            }${total.toLocaleString("en", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}</h1>
          </div>
          <PortfoliosModal
            setPortfolios={setPortfolios}
            currency={currency}
            activePortfolio={activePortfolio}
            portfolios={portfolios}
            setActivePortfolio={setActivePortfolio}
          />
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default PortfolioTopBar;
