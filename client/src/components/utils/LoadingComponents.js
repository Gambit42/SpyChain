import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const LoadingComponents = () => {
  return (
    <div className="mt-5 flex flex-col justify-center items-center bg-gray-50">
      <ClipLoader color={"#4F9FF6"} loading={true} size={50} />
    </div>
  );
};

export default LoadingComponents;
