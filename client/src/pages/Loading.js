import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const Loading = () => {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <ClipLoader color={"#4F9FF6"} loading={true} size={150} />
    </div>
  );
};

export default Loading;
