import { createRoot } from "react-dom/client";
import MainRoutes from "./routes/MainRoutes.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/store.jsx";
import { SideBarProvider } from "./utils/RoleContext.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <SideBarProvider>
        <MainRoutes />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
        />
      </SideBarProvider>
    </PersistGate>
  </Provider>
);
