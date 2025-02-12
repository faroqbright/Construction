import React, { useState } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

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
        toast.error("Email is missing. Please try again.");
        navigate("/login");
      }

      const payload = {
        email,
        password: values.password,
      };

      const response = await apiRequest("post", "/users/reset-password", payload);

      if (response.data.statusCode === 200) {
        toast.success(response.data.message);
        localStorage.removeItem("submittedEmail");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Unexpected error occurred.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">Reset Password</h1>
      <p className="text-gray-500 mb-6">Code has been verified successfully!</p>

      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              variant="outlined"
              placeholder="Enter New Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ""}
              className="mb-4"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <IoEye /> : <IoEyeOff />}
                    </IconButton>
                  </InputAdornment>
                ),
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
              label="Confirm Password"
              variant="outlined"
              placeholder="Repeat New Password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword ? errors.confirmPassword.message : ""}
              className="mb-4"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility}>
                      {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Button
          variant="contained"
          fullWidth
          style={{
            background: "black",
            borderRadius: "0.3rem",
            height: "3rem",
            marginTop: "1.5rem",
          }}
          type="submit"
        >
          Submit
        </Button>
      </form>

      <span className="text-lightpurple-light flex justify-center mt-5">
        <NavLink to="/login">Back To Login</NavLink>
      </span>
    </div>
  );
};

export default ResetPassword;
