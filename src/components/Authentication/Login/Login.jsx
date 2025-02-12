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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const response = await apiRequest("post", "/users/login", values);
      console.log(response);
      if (response.data.data.user.isClient === true) {
        toast.error("You are not authorized to access the admin panel.");
      } else if (response.data.statusCode === 200) {
        dispatch(setUserInfo(response.data.data));
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-black">Login</h1>
      <p className="text-gray-600 mb-4 text-base">Login to access your account</p>

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
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{ required: "Password is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              variant="outlined"
              placeholder="Enter Your Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              className="!mt-4"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} style={{ color: "#DC2626" }}>
                      {showPassword ? <IoEye /> : <IoEyeOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <div className="flex justify-between items-center my-4">
          <div className="flex items-center">
            <Checkbox size="small" />
            <span className="text-sm text-gray-500">Remember me</span>
          </div>
          <NavLink
            to="/forgot-password"
            className="text-sm text-red-600 font-medium underline"
          >
            Forgot Password
          </NavLink>
        </div>

        <Button
          variant="contained"
          fullWidth
          style={{
            background: "#000",
            borderRadius: "0.3rem",
            height: "3rem",
          }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
