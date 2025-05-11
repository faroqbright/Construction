import React, { useState } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const onSubmit = async (values) => {
    try {
      const email = localStorage.getItem("submittedEmail");

      if (!email) {
        toast.error(t("Email is missing. Please try again."));
        navigate("/login");
      }

      const payload = {
        email,
        password: values.password,
      };

      const response = await apiRequest(
        "post",
        "/users/reset-password",
        payload
      );

      if (response.data.statusCode === 200) {
        toast.success(t(response.data.message));
        toast.success(t(response.data.message));
        localStorage.removeItem("submittedEmail");
        navigate("/login");
      } else {
        toast.error(t(response.data.message));
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message));
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
        {t("Reset_Password")}
      </h1>
      <p className="text-gray-500 mb-6">{t("Code_has_been_verified_successfully!")}</p>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: t("Password_is_required"),
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("Password")}
              variant="outlined"
              placeholder= {t("Enter_New_password")}
              type={showPassword ? "text" : "password"}
              fullWidth
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ""}
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
                    borderColor: "grey",
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
          name="confirmPassword"
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("Repeat_password")}
              variant="outlined"
              placeholder={t("Repeat_New_password")}
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              error={!!errors.confirmPassword}
              helperText={ errors.showConfirmPassword ? errors.showConfirmPassword : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConfirmPasswordVisibility}
                      style={{ color: "#DC2626" }}
                    >
                      {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": {
                  color: "black",
                },
                "& label.Mui-focused": {
                  color: "black",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: "grey",
                  },
                  "&:hover fieldset": {
                    borderColor: "grey",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          style={{
            background: "#000",
            borderRadius: "0.75rem",
            height: "3rem",
            marginTop: "2rem",
          }}
        >
          {t("Submit")}
        </Button>
      </form>

      <span className="text-lightpurple-light flex justify-center mt-3">
        <NavLink to="/login">{t("Back_To_Login")}</NavLink>
      </span>
    </div>
  );
};

export default ResetPassword;
