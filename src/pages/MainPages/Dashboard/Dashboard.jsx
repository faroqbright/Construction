import React, { useEffect, useState } from "react";
import PendingProjects from "../../../components/LandingPage/Dashboard/PendingProjects";
import OngoingPro from "../../../components/LandingPage/Dashboard/OngoingPro";
import { useSelector, useDispatch } from "react-redux";
import { Button, TextField, IconButton, InputAdornment } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import apiRequest from "../../../utils/apiRequest";
import { setUserInfo } from "../../../features/auth/authSlice";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const token = useSelector((state) => state.auth.userToken);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password");

  useEffect(() => {
    if (
      user &&
      user.isPasswordChanged === false &&
      user.isClient === false &&
      user.isMain === false
    ) {
      setShowModal(true);
    }
  }, [user]);

  const handlePasswordSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await apiRequest(
        "post",
        "/users/update-password",
        {
          email: user.email,
          password: values.password,
        },
        token
      );

      if (res?.data?.statusCode === 200) {
        toast.success(t(res.data.message));
        setShowModal(false);
        dispatch(setUserInfo({ user: { ...user, isPasswordChanged: true } }));
      }
    } catch (error) {
      toast.error(
        t(error?.response?.data?.message) || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-blacknew bg-opacity-40 transition-all">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">
              {t("Change Your Password")}
            </h2>

            <form onSubmit={handleSubmit(handlePasswordSubmit)}>
              <Controller
                name="password"
                control={control}
                defaultValue=""
                rules={{
                  required: t("error_password_required"),
                  minLength: {
                    value: 8,
                    message: t("error_password_min_length"),
                  },
                  validate: {
                    hasUpper: (value) =>
                      /[A-Z]/.test(value) || t("error_password_uppercase"),
                    hasLower: (value) =>
                      /[a-z]/.test(value) || t("error_password_lowercase"),
                    hasNumber: (value) =>
                      /\d/.test(value) || t("error_password_number"),
                    hasSymbol: (value) =>
                      /[!@#$%^&*]/.test(value) || t("error_password_symbol"),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("Password")}
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
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
                defaultValue=""
                rules={{
                  required: t("error_confirm_password_required"),
                  validate: (value) =>
                    value === password || t("error_passwords_no_match"),
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("Confirm Password")}
                    type={showConfirm ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm((prev) => !prev)}
                          >
                            {showConfirm ? <IoEye /> : <IoEyeOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  mt: 2,
                  borderRadius: "8px",
                  height: "3rem",
                  backgroundColor: "#000",
                }}
                disabled={loading}
              >
                {loading ? t("Saving...") : t("Change Password")}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3">
          <PendingProjects />
        </div>
        <div className="w-full lg:w-1/3">
          <OngoingPro />
        </div>
      </div>
    </>
  );
};

export default Dashboard;