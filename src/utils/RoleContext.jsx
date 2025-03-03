import React, { createContext, useState, useContext } from "react";

const SideBarContext = createContext();

export const SideBarProvider = ({ children }) => {
  const [clickedItem, setClickedItem] = useState(null);

  return (
    <SideBarContext.Provider value={{ clickedItem, setClickedItem }}>
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = () => {
  const context = useContext(SideBarContext);
  if (!context) {
    throw new Error("useSideBar must be used within a SideBarProvider");
  }
  return context;
};