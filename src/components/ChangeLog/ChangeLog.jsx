import React from "react";
import { Modal, Box } from "@mui/material";
import { t } from "i18next";

const ChangeLogModal = ({ data, open, handleClose }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        className="bg-white rounded-lg shadow-lg p-6 mx-auto mt-28 w-full sm:w-[400px]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t("Change_Log")}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="h-[320px] scrollbar-custom">
          {data.map((log) => (
            <div key={log._id} className="flex items-start space-x-3">
              <div className="flex">
                <div className="flex flex-col">
                  <div className="w-2.5 h-2.5 bg-red-redNew rounded-full my-1"></div>
                  <div className="w-[0.3px] h-[2rem] mx-1 my-1 border-[#BDBDBD] border"></div>
                </div>
                <div className="flex flex-col mx-5">
                  <p className="text-sm text-black-blacknew">{log.message}</p>
                  <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleClose}
            className="mt-6 w-[50%] py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            {t("Close")}
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default ChangeLogModal;
