import React, { useState, useEffect } from "react";

const TotalPortfolio = ({ portfolio, currency }) => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(0);
    const calculateTotal = () => {
      for (let asset of portfolio.assets) {
        setTotal(
          (prevState) => prevState + calculateTotalHoldings_Portfolio(asset)
        );
      }
    };
    calculateTotal();
  }, [portfolio.assets]);

  const calculateTotalHoldings_Portfolio = (asset) => {
    return (
      asset.price *
      asset.transactions.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0)
    );
  };

  return (
    <p className="text-xs text-gray-600 font-medium">{`${
      currency.sign
    }${total.toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`}</p>
  );
};

export default TotalPortfolio;
