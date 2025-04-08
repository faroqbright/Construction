import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pencil, UserRound, Save } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";

export default function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.auth?.userInfo);
  const token = useSelector((state) => state?.auth?.userToken);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: userInfo?.userName || "",
    email: userInfo?.email || "",
    phoneNumber: userInfo?.phoneNumber || "",
    address: userInfo?.address || "",
    newPassword: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(userInfo?.avatar || null);

  const formattedDate = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString()
    : "";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        avatar: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userName", formData.userName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);

      if (formData.newPassword) {
        formDataToSend.append("newPassword", formData.newPassword);
      }

      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }

      const response = await apiRequest(
        "patch",
        "/users/update-profile",
        formDataToSend,
        token
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        
        // Update Redux store with new user data
        const updatedUser = {
          ...userInfo,
          ...response.data.user,
          avatar: response.data.user.avatar || userInfo.avatar
        };
        
        dispatch(setCredentials({ 
          userInfo: updatedUser,
          userToken: token 
        }));

        // Update local state
        setFormData(prev => ({
          ...prev,
          newPassword: "", // Clear password field
          avatar: null // Clear avatar file
        }));

        // Keep the avatar preview
        if (response.data.user.avatar) {
          setAvatarPreview(response.data.user.avatar);
        }

        setIsEditing(false);
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      console.error("Error:", error);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form data when entering edit mode
      setFormData({
        userName: userInfo?.userName || "",
        email: userInfo?.email || "",
        phoneNumber: userInfo?.phoneNumber || "",
        address: userInfo?.address || "",
        newPassword: "",
        avatar: null,
      });
      setAvatarPreview(userInfo?.avatar || null);
    }
  };

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("Settings")}</h1>

      <form onSubmit={onSubmit}>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={toggleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-rose-950 text-white rounded-md hover:bg-rose-900 transition"
            >
              {isEditing ? (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>

            {isEditing && (
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            )}
          </div>

          <div className="flex justify-center">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-48 h-48 rounded-full border-2 border-rose-950 object-cover mb-4"
                />
              ) : (
                <UserRound className="w-48 h-48 text-slate-100 rounded-full border-2 border-rose-950 bg-gray-400 mb-4" />
              )}
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-7 right-3 p-1 rounded-full bg-rose-950 shadow transition duration-200 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Username")}
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Email")}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              readOnly={!isEditing}
              rows={3}
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Account Created")}
            </label>
            <input
              type="text"
              value={formattedDate}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md"
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("Password")}
              </label>
              <input
                type="password"
                value="********"
                readOnly
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md"
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}