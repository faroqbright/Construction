import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";

const Recovery = () => {
  const navigate = useNavigate();

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
        toast.success(response.data.message);
        navigate("/reset-password");
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
        Recovery Code
      </h1>
      <p className="text-gray-500 mb-6">
        Enter the recovery code sent to your email.
      </p>

      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("otp", {
            required: "Recovery code is required",
          })}
          label="Code"
          variant="outlined"
          placeholder="Enter Verification Code"
          type="text"
          fullWidth
          className="mb-4"
          error={!!errors.otp}
          helperText={errors.otp?.message}
          sx={{
            "& label": { color: "black" }, // Label remains black
            "& label.Mui-focused": { color: "black" }, // Label stays black when focused
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px", // Rounded corners
              "& fieldset": {
                borderColor: "grey", // Default border color
              },
              "&:hover fieldset": {
                borderColor: "black", // Border turns grey on hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "black", // Border turns black on focus
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
          Submit
        </Button>
      </form>

      <span className="text-lightpurple-light flex justify-center mt-3">
        <NavLink to="/login">Back To Login</NavLink>
      </span>
    </div>
  );
};

export default Recovery;
