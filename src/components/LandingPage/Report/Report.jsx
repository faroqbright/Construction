import React, { useState } from "react";
import {
  Button,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Pagination,
  PaginationItem,
  InputBase,
} from "@mui/material";
import { FiFilter } from "react-icons/fi";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { CiSearch } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";

import {
  InputAdornment,
  Stack,
  Chip,
  FormControl,
  OutlinedInput,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DropdownIcon from "../../../../src/assets/dropdown.svg";
import Footer from "../CommonUi/Footer";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa6";

export default function Report() {
  const [selectedTab, setSelectedTab] = useState("All Projects");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();


  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    };

  const handleChange = (event, value) => {
    setPage(value);
  };

  const handleViewDashboard = (id) => {
    navigate("/");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="flex items-center space-x-3 mb-10">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-200 transition"
          onClick={handleViewDashboard}
        >
          <FaArrowLeft className="text-black w-5 h-5" />
        </button>
        <span className="text-black font-bold text-lg">{t("Reports")}</span>
      </div>
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-4">
          {/* Filter Icon with Outline */}
          <div className="bg-white rounded-lg border border-gray-300">
            <IconButton className="rounded-lg">
              <FiFilter />
            </IconButton>
          </div>

          {/* Sort Select */}
          <div className="bg-white rounded-lg border border-gray-300">
            <FormControl className="min-w-[150px]" size="small">
              <Select
                defaultValue="Chronological"
                className="rounded-lg border-none focus:ring-0"
              >
                <MenuItem value="Chronological">
                  {t("Sort")}: Chronological
                </MenuItem>
                <MenuItem value="Alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Date Select */}
          <div className="bg-white rounded-lg border border-gray-300">
            <FormControl className="min-w-[150px]" size="small">
              <Select
                defaultValue="August, 2021"
                className="rounded-lg border-none focus:ring-0"
                startAdornment={
                  <InputAdornment position="start">
                    <GrFormPrevious className="w-5 h-5" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <GrFormNext className="w-5 h-5" />
                  </InputAdornment>
                }
              >
                <MenuItem value="August, 2021">August, 2021</MenuItem>
                <MenuItem value="July, 2021">July, 2021</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Search Field  */}
        <div className="bg-white rounded-lg border border-gray-300 ml-auto">
          <TextField
            placeholder={t("Write_Your_Message")}
            size="small"
            className="w-[24rem]"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CiSearch className="w-5 h-5 text-black font-bold" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.5rem", // Tailwind's rounded-lg equivalent
              },
            }}
          />
        </div>
      </div>
      {/* Tabs */}
      {/* <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="mt-4 w-full"
      >
        {[
          t("All_Projects"),
          t("Ongoing"),
          t("Pending_Projects"),
          t("Completed_Projects"),
        ].map((tab) => (
          <Chip
            key={tab}
            label={tab}
            sx={{
              py: 3,
              px: 3,
              borderRadius: "9999px", // 🔹 Fully rounded buttons
              backgroundColor: selectedTab === tab ? "#B91724" : "white",
              color: selectedTab === tab ? "white" : "black",
              fontWeight: selectedTab === tab ? "bold" : "normal",
              "&:hover": {
                backgroundColor: selectedTab === tab ? "#B91724" : "lightgray",
              },
            }}
          />
        ))}
      </Stack> */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="mt-4 w-full"
      >
        {[
          t("All_Projects"),
          t("Ongoing"),
          t("Pending_Projects"),
          t("Completed_Projects"),
        ].map((tab) => (
          <Chip
            key={tab}
            label={tab}
            onClick={() => handleTabChange(tab)} // ✅ Add this to update selectedTab
            sx={{
              py: 3,
              px: 3,
              borderRadius: "9999px", // 🔹 Fully rounded buttons
              backgroundColor: selectedTab === tab ? "#B91724" : "white",
              color: selectedTab === tab ? "white" : "black",
              fontWeight: selectedTab === tab ? "bold" : "normal",
              cursor: "pointer", // ✅ Add cursor pointer for better UX
              "&:hover": {
                backgroundColor: selectedTab === tab ? "#B91724" : "lightgray",
              },
            }}
          />
        ))}
      </Stack>

      <h2 className="text-lg font-extrabold mb-6 mt-6">
        {t("All_Projects_Report")}s
      </h2>
      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-black-blacknew border-gray-200 text-sm">
            <thead className="text-black-blacknew font-semibold">
              <tr className="bg-white">
                <th className="pr-10">
                  <input type="checkbox" />
                </th>
                <th className="p-4 text-left text-lg">{t("Project_Name")}</th>
                <th className="p-4 text-left text-lg">
                  {t("Attached_Report")}
                </th>
                <th className="p-4 text-left text-lg">{t("Created_By")}</th>
                <th className="p-4 text-left text-lg">{t("Created_At")}</th>
                <th className="p-4 text-left text-lg">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-5">
                    <input type="checkbox" />
                  </td>
                  <td className="p-4 font-semibold">
                    {t("Construction_Project")}
                  </td>
                  <td className="p-4 font-normal">reportattached.pdf</td>
                  <td className="p-4 font-normal">John Doe</td>
                  <td className="p-4 font-normal">Nov 14, 2024</td>
                  <td className="p-4 font-normal">
                    <Button
                      startIcon={<MdOutlineFileDownload />}
                      sx={{
                        textTransform: "none",
                        color: "#121619",
                      }}
                    >
                      {t("Download")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}

      <div className="flex justify-end items-center mt-4">
        <Pagination
          count={11}
          page={page}
          onChange={handleChange}
          variant="outlined"
          shape="rounded"
          sx={{
            "& .Mui-selected": {
              backgroundColor: "#B91724 !important",
              color: "white !important",
              borderRadius: "50%",
            },
            "& .MuiPaginationItem-root": {
              color: "black",
              borderRadius: "50%",
            },
            "& .MuiPaginationItem-previousNext": {
              border: "none",
              backgroundColor: "transparent",
              color: "black",
            },
          }}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              slots={{
                previous: () => <span>{t("Previos")}</span>,
                next: () => <span>{t("Next")}</span>,
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
