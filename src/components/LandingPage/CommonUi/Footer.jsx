import React from "react";

const Footer = () => {
  return (
    // <footer className=" text-center py-4">
    //   <p className="text-sm text-gray-600 flex items-center justify-center space-x-2">
    //     <span>Feito com </span>
    //     <span className="text-red-500">❤️</span>
    //     <span>por: www.techbytech.tech @2024</span>
    //     <span className="flex space-x-1">
    //       {/* Icons */}
    //       <a
    //         href="#"
    //         className="text-blue-500 hover:text-blue-700"
    //         aria-label="Globe"
    //       >
    //         🌐
    //       </a>
    //       <a
    //         href="#"
    //         className="text-yellow-500 hover:text-yellow-700"
    //         aria-label="Star"
    //       >
    //         ⭐
    //       </a>
    //     </span>
    //   </p>
    // </footer>
    <div className="flex justify-center items-center mt-8 mb-6 ">
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
        @2024 🤖 👨‍💻 🚀
      </span>
    </div>
  </div>
  );
};

export default Footer;
