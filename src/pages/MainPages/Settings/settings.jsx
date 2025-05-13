import React, { useState, useEffect } from "react"; // Added useEffect
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pencil, UserRound, Save } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { setUserInfo } from "../../../features/auth/authSlice"; // Correct import for the action

export default function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.auth?.userInfo);
  const token = useSelector((state) => state?.auth?.userToken);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    address: "",
    newPassword: "",
    avatar: null, // Initialize avatar as null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Effect to initialize form data and preview when userInfo loads or changes
  useEffect(() => {
    if (userInfo) {
      setFormData({
        userName: userInfo.userName || "",
        email: userInfo.email || "",
        phoneNumber: userInfo.phoneNumber || "",
        address: userInfo.address || "",
        newPassword: "",
        avatar: null, // Reset avatar file selection on user info change
      });
      setAvatarPreview(userInfo.avatar || null); // Set preview from user data
    }
  }, [userInfo]); // Dependency array includes userInfo

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
      // Update formData state with the file object
      setFormData({
        ...formData,
        avatar: file, // Store the actual file object
      });

      // Generate and set the preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); // Show local preview
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      let dataToSend;
      let config = {}; // API request configuration

      const isAvatarChanged = !!formData.avatar; // Check if a new avatar file is selected

      // Prepare text fields that have actually changed
      const updatedTextFields = {};
      const hasChanged = (fieldName) => {
        // Trim strings before comparison, handle null/undefined gracefully
        const currentValue = formData[fieldName]
          ? String(formData[fieldName]).trim()
          : "";
        const originalValue = userInfo?.[fieldName]
          ? String(userInfo[fieldName]).trim()
          : "";
        // Only consider it changed if it's different AND not empty (unless original was also empty)
        return currentValue !== originalValue;
      };

      if (hasChanged("userName"))
        updatedTextFields.userName = formData.userName.trim();
      if (hasChanged("email")) updatedTextFields.email = formData.email.trim();
      if (hasChanged("phoneNumber"))
        updatedTextFields.phoneNumber = formData.phoneNumber.trim();
      if (hasChanged("address"))
        updatedTextFields.address = formData.address.trim();
      // Add password only if provided
      if (formData.newPassword)
        updatedTextFields.newPassword = formData.newPassword;

      const hasTextFieldChanges = Object.keys(updatedTextFields).length > 0;

      // Check if there are *any* changes (text or avatar)
      if (!hasTextFieldChanges && !isAvatarChanged) {
        toast.info(t("No changes detected"));
        setIsEditing(false);
        setIsLoading(false); // Stop loading
        return;
      }

      // --- Logic to determine request format ---
      if (isAvatarChanged) {
        // If avatar changed, always use FormData
        dataToSend = new FormData();

        // Append changed text fields to FormData
        Object.keys(updatedTextFields).forEach((key) => {
          dataToSend.append(key, updatedTextFields[key]);
        });

        // Append the avatar file (key 'avatar' must match backend Multer config)
        dataToSend.append("avatar", formData.avatar);

        // When sending FormData, DO NOT manually set Content-Type header.
        // The browser/axios will set it correctly with the boundary.
        config = {
          // No 'headers' needed for Content-Type here
        };
      } else {
        // If only text fields changed, use JSON
        dataToSend = updatedTextFields;
        config = {
          headers: { "Content-Type": "application/json" },
        };
      }
      // -----------------------------------------

      // Make the API request
      const response = await apiRequest(
        "PUT",
        `/users/update-profile/${userInfo._id}`,
        dataToSend, // Send FormData or JSON object
        token,
        config // Pass appropriate config (headers or empty)
      );

      // --- Handle Response ---
      if (response.status === 200 && response.data.success) {
        toast.success(t(response.data.message) || t("Profile updated successfully"));

        // IMPORTANT: Use the user data returned from the API response
        const updatedUserFromServer = response.data.data;

        // Dispatch action to update Redux store
        dispatch(
          setUserInfo({
            user: updatedUserFromServer, // Update with fresh data from server
            // Assuming token doesn't change on profile update
          })
        );

        // Reset form state AFTER successful update
        setFormData((prev) => ({
          ...prev,
          newPassword: "", // Clear password field
          avatar: null, // Clear avatar file state
        }));
        // Update preview with the new URL from the server
        setAvatarPreview(updatedUserFromServer.avatar || null);
        setIsEditing(false); // Exit editing mode
      } else {
        // Handle potential errors from the API response (even if status is 2xx but success: false)
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      // Handle network errors or exceptions during the request
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
    }
  };

  const toggleEdit = () => {
    const currentlyEditing = !isEditing;
    setIsEditing(currentlyEditing);

    if (!currentlyEditing) {
      // If cancelling edit, reset form to original userInfo
      if (userInfo) {
        setFormData({
          userName: userInfo.userName || "",
          email: userInfo.email || "",
          phoneNumber: userInfo.phoneNumber || "",
          address: userInfo.address || "",
          newPassword: "",
          avatar: null, // Clear any selected file
        });
        setAvatarPreview(userInfo.avatar || null); // Reset preview to original avatar
      }
    } else {
      // Entering edit mode - form already has current values or is pre-filled by useEffect
    }
  };

  // Conditional rendering if userInfo is not yet loaded
  if (!userInfo) {
    return <div className="p-6">Loading user data...</div>;
  }

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("Settings")}</h1>

      <form onSubmit={onSubmit}>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Avatar section */}
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
                    className="hidden" // Keep it hidden, use label
                    disabled={isLoading} // Disable while loading
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-7 right-3 p-1 rounded-full bg-rose-950 shadow transition duration-200 ${
                      isLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-rose-800"
                    }`} // Style disabled state
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Rest of the form fields... */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Username")}
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              readOnly={!isEditing || isLoading} // Disable if not editing or loading
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md ${isLoading ? "opacity-50" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              {t("Email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              // onChange={handleInputChange} // No longer needed as it's disabled
              disabled={true}
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed" // Always apply disabled styles
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Phone Number")}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              readOnly={!isEditing || isLoading}
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md ${isLoading ? "opacity-50" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Address")}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              readOnly={!isEditing || isLoading}
              rows={3}
              className={`w-full px-3 py-2 border ${
                isEditing ? "border-gray-300" : "border-gray-200 bg-gray-100"
              } rounded-md ${isLoading ? "opacity-50" : ""}`}
            />
          </div>

          {/* New Password field - keep it optional */}
          {/* {isEditing && (
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isLoading ? 'opacity-50' : ''}`}
                disabled={isLoading}
              />
            </div>
          )} */}

          {/* Display placeholder password when not editing */}
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

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <button
              type="button"
              onClick={toggleEdit}
              disabled={isLoading} // Disable cancel while loading
              className={`flex items-center gap-2 px-4 py-2 bg-black-blacknew text-white rounded-md transition ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-700"
              }`}
            >
              {isEditing ? (
                <>
                  {/* Icon can be X or similar for Cancel */}
                  <span>{t("Cancel")}</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>{t("Edit Profile")}</span>
                </>
              )}
            </button>

            {isEditing && (
              <button
                type="submit"
                disabled={isLoading} // Disable save while loading
                className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md transition ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? t("Saving...") : t("Save Changes")}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
