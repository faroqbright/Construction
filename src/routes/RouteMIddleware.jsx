import React, { useEffect, useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { removeUserInfo } from "../features/auth/authSlice";
import apiRequest from "../utils/apiRequest";
import "../utils/i18n";
import { useTranslation } from "react-i18next";

const RouteMiddleware = ({
  children,
  isAuthRequired = false,
  requiredModules = [],
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userToken, userInfo } = useSelector((state) => state?.auth || {});
  const [tokenReady, setTokenReady] = useState(false);

  const getLocalStorageToken = () => {
    const persistAuth = localStorage?.getItem("persist:auth");
    if (persistAuth) {
      try {
        const parsedPersistAuth = JSON?.parse(persistAuth);
        const userToken = JSON.parse(parsedPersistAuth.userToken || "{}");
        return userToken;
      } catch (error) {
        console.error("Error parsing localStorage token:", error);
        return null;
      }
    }
    return null;
  };

  const localStorageToken = getLocalStorageToken();

  const handleLogout = useCallback(async () => {
    try {
      const parsedToken = localStorageToken
        ? localStorageToken.replace(/^"|"$/g, "")
        : null;

      if (parsedToken) {
        const response = await apiRequest(
          "post",
          "/users/logout",
          {},
          parsedToken
        );

        if (response.data.statusCode === 200) {
          dispatch(removeUserInfo());
          localStorage.removeItem("persist:auth");
          toast.success(t(response.data.message));
        }
      }

      navigate("/login");
    } catch (error) {
      console.error("Error:", error);
    }
  }, [dispatch, localStorageToken, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorageToken === null || userToken === undefined) {
        setTokenReady(true);
        return;
      }

      if (!localStorageToken || !userToken || localStorageToken !== userToken) {
        handleLogout();
      } else {
        setTokenReady(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [userToken, localStorageToken, handleLogout]);

  const hasPermission = () => {
    if (!requiredModules.length) {
      return true;
    }

    if (userInfo?.isMain) {
      return true;
    }

    const permissions = requiredModules.map((module) => {
      const permission = userInfo?.role?.permissions.find(
        (p) => p.module === module
      );
      return permission?.read === true;
    });

    return permissions.every(Boolean);
  };

  if (!tokenReady) {
    return null;
  }

  if (isAuthRequired) {
    if (!userToken || !localStorageToken || localStorageToken !== userToken) {
      return <Navigate to="/login" />;
    }

    if (requiredModules.length && !hasPermission()) {
      return <Navigate to="/" />;
    }
    return children;
  }

  if (userToken && localStorageToken && localStorageToken === userToken) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RouteMiddleware;
