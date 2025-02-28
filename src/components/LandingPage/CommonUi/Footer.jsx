import React from "react";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center mt-8 mb-6">
      <div className="flex justify-center items-center">
        <span className="text-center">
          Feito com ❤ por:{" "}
          <a
            href="https://techbytech.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            techbytech.tech
          </a>{" "}
          @ {new Date().getFullYear()} 🤖 👨‍💻 🚀
        </span>
      </div>
    </footer>
  );
};

export default Footer;
