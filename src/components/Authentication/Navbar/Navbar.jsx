import React from "react";
import { useNavigate } from "react-router-dom";
import img1 from "../../../assets/logo.svg";
import LanguageSwitcher from "../../LandingPage/CommonUi/LanguageSwitcher";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#F6F6F6] h-16 flex items-center justify-between pr-20 mx-3 my-2 p-3">
      <img
        src={img1}
        className="h-10 cursor-pointer"
        alt="Logo"
        onClick={() => navigate("/login")}
      />
      <LanguageSwitcher />
    </div>
  );
}
