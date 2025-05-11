import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const Recovery = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const email = localStorage.getItem("submittedEmail");

      const payload = {
        ...values,
        email,
      };

      const response = await apiRequest("post", "/users/verify-otp", payload);

      if (response.data.statusCode === 200) {
        toast.success(t(response.data.message));
        navigate("/reset-password");
      } else {
        toast.error(t(response.data.message));
      }
    } catch (error) {
      toast.error(t(
        error.response?.data?.message)
      );
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
        {t("Recovery_Code")}
      </h1>
      <p className="text-gray-500 mb-6">
      {t("Enter_the_code_sent_to_your_email.")}
      </p>

      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("otp", {
            required: "Recovery code is required",
          })}
          label="Code"
          variant="outlined"
          placeholder={t("Enter_Verification_Code")}
          type="text"
          fullWidth
          className="mb-4"
          error={!!errors.otp}
          helperText={errors.otp?.message}
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

export default Recovery;
