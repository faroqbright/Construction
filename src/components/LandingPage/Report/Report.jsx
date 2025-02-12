import React, { useState } from "react";
import {
  Button,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Pagination,
  PaginationItem,
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
import DropdownIcon from "../../../../src/assets/dropdown.svg";
import Footer from "../CommonUi/Footer";
export default function Report() {
  const [selectedTab, setSelectedTab] = useState("All Projects");
  const [page, setPage] = useState(1); 

  const handleChange = (event, value) => {
    setPage(value);
  };
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className=" rounded-lg shadow-md p-4 flex ">
        <div className="flex items-center space-x-4">
          <div className="bg-white border">
            <IconButton>
              <FiFilter />
            </IconButton>
          </div>
          <div className="bg-white border">
            <FormControl
              className="min-w-[150px]"
              size="small"
              variant="outlined"
            >
              <Select
                defaultValue="Chronological"
                input={
                  <OutlinedInput
                    startAdornment={
                      <InputAdornment position="start">
                        <img
                          src={DropdownIcon}
                          alt="dropdown"
                          className="h-8 w-8"
                        />
                      </InputAdornment>
                    }
                  />
                }
              >
                <MenuItem value="Chronological">Chronological</MenuItem>
                <MenuItem value="Alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="bg-white border">
            <FormControl
              className="min-w-[150px]"
              size="small"
              variant="outlined"
            >
              <Select
                defaultValue="August, 2021"
                input={
                  <OutlinedInput
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
                  />
                }
              >
                <MenuItem value="August, 2021">August, 2021</MenuItem>
                <MenuItem value="July, 2021">July, 2021</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="bg-white border">
            <TextField
              placeholder="Enter your keyword"
              size="small"
              className="w-[24rem]"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CiSearch className="w-5 h-5 text-black-blacknew font-bold" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="mt-4 w-full"
      >
        {[
          "All Projects",
          "Ongoing Projects",
          "Pending Projects",
          "Completed Projects",
        ].map((tab) => (
          <Chip
            key={tab}
            label={tab}
            sx={{
              py: 2,
              px: 4,
              backgroundColor: selectedTab === tab ? "#B91724" : "white",
              color: selectedTab === tab ? "white" : "black",
              fontWeight: selectedTab === tab ? "bold" : "normal",
              "&:hover": {
                backgroundColor: selectedTab === tab ? "#B91724" : "lightgray",
              },
            }}
          />
        ))}
      </Stack>
      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <h2 className="text-lg font-semibold mb-4">All Projects Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-black-blacknew border border-gray-200 text-sm">
            <thead className="text-black-blacknew font-semibold">
              <tr className="bg-gray-100">
                <th className="p-4 border-b">
                  <input type="checkbox" />
                </th>
                <th className="p-4 border-b text-left">Project Name</th>
                <th className="p-4 border-b text-left">Attached Report</th>
                <th className="p-4 border-b text-left">Created By</th>
                <th className="p-4 border-b text-left">Created At</th>
                <th className="p-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-4 border-b">
                    <input type="checkbox" />
                  </td>
                  <td className="p-4 border-b font-semibold">
                    Construction Project
                  </td>
                  <td className="p-4 border-b font-normal">
                    reportattached.pdf
                  </td>
                  <td className="p-4 border-b font-normal">John Doe</td>
                  <td className="p-4 border-b font-normal">Nov 14, 2024</td>
                  <td className="p-4 border-b font-normal">
                    <Button
                      startIcon={<MdOutlineFileDownload />}
                      sx={{
                        textTransform: "none",
                        color: "#121619",
                      }}
                    >
                      Download
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
                previous: () => <span>Previous</span>,
                next: () => <span>Next</span>,
              }}
            />
          )}
        />
      </div>

      <div className="mt-16">
        <Footer />
      </div>

    </div>
  );
}
