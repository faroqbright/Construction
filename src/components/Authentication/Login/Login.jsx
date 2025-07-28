import React, { useState } from "react";
import {
  TextField,
  Checkbox,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { setUserInfo } from "../../../features/auth/authSlice";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (values) => {
  console.log("click")

    setLoading(true);
    try {
      const response = await apiRequest("post", "/users/login", values);
  console.log("dsdsdsds")

      console.log(response);

      const { data } = response.data;
      const { user, accessToken } = data;

      if (user.isClient === true) {
        toast.error(t("You are not authorized to access the admin panel."));
        return;
      }

      if (response.data.statusCode === 200) {
        // Determine language from loca lStorage
        const languageCode = localStorage.getItem("i18nextLng");
        let languageSelectedForApi;

        if (languageCode?.toLowerCase().startsWith("pt")) {
          languageSelectedForApi = "portuguese";
        } else if (languageCode?.toLowerCase().startsWith("en")) {
          languageSelectedForApi = "english";
        }

        // If a valid language is selected, send to API
        if (languageSelectedForApi) {
          const endpoint = `/language/${response.data.data.user._id}`;
          const payload = { languageSelected: languageSelectedForApi };

            await apiRequest("put", endpoint, payload, accessToken);
        }

        // Save user info and navigate
        dispatch(setUserInfo(data));
        toast.success(t(response.data.message));
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      
      toast.error(t(error.response?.data?.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
        {t("Login")}
      </h1>
      <p className="text-gray-600 mb-4 text-base">
        {t("Login_to_access_your_account")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{ required: t("Email_is_required") }}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("Email")}
              variant="outlined"
              type="email"
              placeholder={t("Enter_Your_Email")}
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                "& label": { color: "black" },
                "& label.Mui-focused": { color: "black" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: "grey",
                  },
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{ required: t("Password_is_required") }}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("Password")}
              variant="outlined"
              placeholder={t("Enter_Your_Password")}
              type={showPassword ? "text" : "password"}
              fullWidth
              className="!mt-4"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      style={{ color: "#DC2626" }}
                    >
                      {showPassword ? <IoEye /> : <IoEyeOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: "black" },
                "& label.Mui-focused": { color: "black" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: "grey",
                  },
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
          )}
        />

        <div className="flex justify-between items-center my-3">
          <div className="flex items-center">
            <Checkbox
              size="small"
              sx={{
                color: "black",
                "&.Mui-checked": {
                  color: "black",
                },
                "&:hover": {
                  color: "black",
                },
              }}
            />
            <span className="text-sm text-black">{t("Remember_me")}</span>
          </div>
          <NavLink
            to="/forgot-password"
            className="text-sm text-red-600 font-medium underline"
          >
            {t("Forgot_Password")}
          </NavLink>
        </div>

        <Button
          variant="contained"
          fullWidth
          style={{
            background: "#000",
            borderRadius: "0.75rem",
            height: "3rem",
          }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : t("Login")}
        </Button>
      </form>
    </div>
  );
};

export default Login;
