import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pencil, UserRound } from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();
  const userInfo = useSelector((state) => state?.auth?.userInfo);
  console.log("userInfo", userInfo);

  const formattedDate = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("Settings")}</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <UserRound className="w-48 h-48 text-slate-100 rounded-full border-2 border-rose-950  bg-gray-400 mb-4" />
            <button className="absolute bottom-7 right-3 p-1 rounded-full bg-rose-950 shadow transition duration-200">
              <Pencil className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("Username")}
          </label>
          <input
            type="text"
            value={userInfo?.userName || ""}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("Email")}
          </label>
          <input
            type="email"
            value={userInfo?.email || ""}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("Password")}
          </label>
          <input
            type="password"
            value={formattedDate}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
