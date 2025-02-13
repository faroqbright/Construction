import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import apiRequest from "../../../utils/apiRequest";

const ForgetPassword = () => {
  const navigate = useNavigate();
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
        toast.success(response.data.message);
        localStorage.setItem("submittedEmail", values.email);
        setTimeout(() => {
          localStorage.removeItem("submittedEmail");
        }, 300000);
        navigate(`/recovery`);
      } else {
        toast.error(response.data.message || "Unexpected error occurred.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
        Forgot Password?
      </h1>
      <p className="text-gray-600 mb-4 text-base">
        Recover your password using the email.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              variant="outlined"
              type="email"
              placeholder="Enter Your Email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                "& label": { color: "black" }, // Make label text black
                "& label.Mui-focused": { color: "black" }, // Label turns gray when focused
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px", // Rounded corners
                  "& fieldset": {
                    borderColor: "grey", // Default border color
                  },
                  "&:hover fieldset": {
                    borderColor: "black", // Border turns black on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black", // Border turns black on focus
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
          {isLoading ? "Submitting..." : "Confirm"}
        </Button>
      </form>

      <span className="text-lightpurple-light flex justify-center mt-2">
        <NavLink to="/login">Back To Login</NavLink>
      </span>
    </div>
  );
};

export default ForgetPassword;
