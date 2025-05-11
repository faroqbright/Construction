import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import apiRequest from "../../../utils/apiRequest";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading } = useSelector((state) => state?.auth);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const response = await apiRequest(
        "post",
        "/users/forget-password",
        values
      );

      if (response.status === 200) {
        toast.success(t(response.data.message));
        localStorage.setItem("submittedEmail", values.email);
        setTimeout(() => {
          localStorage.removeItem("submittedEmail");
        }, 300000);
        navigate(`/recovery`);
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
        {t("Forgot_Password")}?
      </h1>
      <p className="text-gray-600 mb-4 text-base">
        {t("Recover_your_password_using_the_email.")}
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

        <Button
          variant="contained"
          type="submit"
          fullWidth
          style={{
            background: "black",
            borderRadius: "0.75rem",
            height: "3rem",
            marginTop: "2rem",
          }}
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : t("Confirm")}
        </Button>
      </form>

      <span className="text-lightpurple-light flex justify-center mt-2">
        <NavLink to="/login">{t("Back_To_Login")}</NavLink>
      </span>
    </div>
  );
};

export default ForgetPassword;
