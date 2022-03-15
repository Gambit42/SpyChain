import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, changeActive } from "../redux/actions";
import welcomeSVG from "../assets/svg/welcome.svg";
import { RiSpyFill, RiLock2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";

const Register = ({ setIsLogged }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleInput = (e) => {
    const targetName = e.target.name;
    const targetValue = e.target.value;

    if (targetName === "name") {
      setInput({ ...input, name: targetValue });
    } else if (targetName === "password") {
      setInput({ ...input, password: targetValue });
    } else if (targetName === "confirmPassword") {
      setInput({ ...input, confirmPassword: targetValue });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    //Allows the cookie to be sent into the client
    const config = {
      method: ["POST"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };

    const userRegisterData = {
      userName: input.name,
      password: input.password,
    };

    if (input.password !== input.confirmPassword) {
      setError("Passwords does not match.");
      setTimeout(() => {
        setError("");
      }, 5000);
    } else {
      axios
        .post(
          "https://spy-chain.herokuapp.com/register",
          userRegisterData,
          config
        )
        .then((res) => {
          // dispatch(getUser(res.data.user));
          // dispatch(changeActive(res.data.user.portfolios[0]));
          // setIsLogged(true);
          navigate("/login");
        })
        .catch((error) => {
          console.log(error.response.data.error);
          setError(error.response.data.error);
          setTimeout(() => {
            setError("");
          }, 5000);
        });
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-l from-blue-100 to-blue-300 h-screen w-screen font-poppins">
      <div className="rounded w-4/5 shadow-lg flex flex-row bg-white max-w-4xl">
        <div className="hidden w-full md:flex flex-col justify-between min-h-max bg-gray-50">
          <div className="p-6">
            <div className="flex flex-row items-center">
              <RiSpyFill className="w-8 h-8 text-blue-500 mr-1" />
              <h1 className="text-blue-500 text-font-montserrat font-bold text-2xl font-montserrat">
                SpyChain
              </h1>
            </div>
            <div className="px-2">
              <p className="text-xs text-neutral-900">
                Track your crypto with ease.
              </p>
            </div>
          </div>
          <div className="pb-24 px-6 pt-10 flex justify-center">
            <img src={welcomeSVG} className="w-56" />
          </div>
        </div>
        <div className="w-full px-2 py-6">
          <div className="flex flex-col items-center py-10 bg-white md:hidden">
            <div className="flex flex-row items-center">
              <RiSpyFill className="w-8 h-8 text-blue-500 mr-1" />
              <h1 className="text-blue-500 text-font-montserrat font-bold text-2xl font-montserrat">
                SpyChain
              </h1>
            </div>
            <div className="pt-1">
              <p className="text-xs text-neutral-900">
                Track your crypto with ease.
              </p>
            </div>
          </div>
          <div className="flex flex-col w-4/5 max-w-xs mx-auto justify-center md:h-full">
            <div className="pb-4 md:pb-5">
              <h1 className="text-2xl font-bold">Register</h1>
              <p className="text-sm">Please fill in the form to signup.</p>
            </div>
            <form
              method="post"
              onSubmit={handleSubmit}
              className="flex flex-col py-2 items-center"
            >
              <div className="border-b-2 border-blue-300 border-b-blue-500 mb-4 w-full flex flex-row items-center py-1">
                <FaRegUser className="w-5 h-5 mx-2 text-neutral-900" />
                <input
                  autocomplete="off"
                  onChange={handleInput}
                  placeholder="Username"
                  name="name"
                  className=" placeholder:text-neutral-500 w-full px-1 py-2 text-sm leading-tight text-neutral-900 bg-transparent appearance-none focus:outline-none focus:shadow-outline bg-none"
                  value={input.name}
                />
              </div>
              <div className="border-b-2 border-blue-300 border-b-blue-500 w-full flex flex-row items-center py-1 mb-4">
                <RiLock2Line className="w-5 h-5 mx-2 text-neutral-900" />
                <input
                  autocomplete="off"
                  name="password"
                  type="password"
                  onChange={handleInput}
                  placeholder="Password"
                  value={input.password}
                  className=" placeholder:text-neutral-500 w-full px-1 py-2 text-sm leading-tight text-neutral-900 bg-transparent appearance-none focus:outline-none focus:shadow-outline bg-none"
                />
              </div>
              <div className="border-b-2 border-blue-300 border-b-blue-500 w-full flex flex-row items-center py-1">
                <RiLock2Line className="w-5 h-5 mx-2 text-neutral-900" />
                <input
                  name="confirmPassword"
                  type="password"
                  onChange={handleInput}
                  placeholder="Confirm Password"
                  value={input.confirmPassword}
                  className=" placeholder:text-neutral-500 w-full px-1 py-2 text-sm leading-tight text-neutral-900 bg-transparent appearance-none focus:outline-none focus:shadow-outline bg-none"
                />
              </div>
              <p className="text-left text-sm italic text-red-500 w-full pt-2 pl-6 h-10">
                {error}
              </p>
              <div className="mt-6 w-full flex flex-col items-center">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded-full hover:bg-blue-400 focus:outline-none focus:shadow-outline"
                >
                  REGISTER
                </button>
              </div>
              <div className="mt-4 w-full flex flex-col items-center">
                <h1
                  className="text-sm text-blue-600 cursor-pointer"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Have an account? Login here.
                </h1>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
