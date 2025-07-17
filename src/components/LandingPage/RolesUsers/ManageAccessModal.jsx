import { useState, useEffect } from "react";
import { Modal, Box, Typography, Checkbox, Button } from "@mui/material";
import apiRequest from "../../../utils/apiRequest";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
// import socket from "../../../websockets/socket";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

export default function ManageAccessModal({ open, onClose, roleId, roleData }) {

  const token = useSelector((state) => state?.auth?.userToken);
  const { t } = useTranslation();

  const initialAccess = {
    add: {
      projects: false,
      reports: false,
      clients: false,
      users: false,
      roles: false,
      evaluation: false,
    },
    edit: {
      projects: false,
      reports: false,
      users: false,
      clients: false,
      roles: false,
      evaluation: false,
    },
    delete: {
      projects: false,
      reports: false,
      users: false,
      clients: false,
      roles: false,
      evaluation: false,
    },
    view: {
      projects: false,
      reports: false,
      users: false,
      clients: false,
      roles: false,
      evaluation: false,
      history: false,
    },
  };

  const [access, setAccess] = useState(initialAccess);

  useEffect(() => {
    if (roleData?.permissions) {
      const newAccess = { ...initialAccess };

      roleData?.permissions.forEach((permission) => {
        const module = permission.module
          .toLowerCase()
          .replace("management", "");
        if (permission?.create) newAccess.add[module] = true;
        if (permission?.read) newAccess.view[module] = true;
        if (permission?.update) newAccess.edit[module] = true;
        if (permission?.delete) newAccess.delete[module] = true;
      });

      setAccess(newAccess);
    }
  }, [roleData]);

  const handleAccess = async () => {
    const permissions = [];

    Object.keys(access).forEach((action) => {
      Object.keys(access[action]).forEach((module) => {
        const moduleName =
          module.charAt(0).toUpperCase() + module.slice(1) + "Management";
        const existingPermission = permissions.find(
          (p) => p.module === moduleName
        );

        if (existingPermission) {
          existingPermission.create =
            existingPermission.create ||
            (action === "add" && access[action][module]);
          existingPermission.read =
            existingPermission.read ||
            (action === "view" && access[action][module]);
          existingPermission.update =
            existingPermission.update ||
            (action === "edit" && access[action][module]);
          existingPermission.delete =
            existingPermission.delete ||
            (action === "delete" && access[action][module]);
        } else {
          permissions.push({
            module: moduleName,
            create: action === "add" && access[action][module],
            read: action === "view" && access[action][module],
            update: action === "edit" && access[action][module],
            delete: action === "delete" && access[action][module],
          });
        }
      });
    });

    const finalPermissions = permissions.map((permission) => ({
      ...permission,
      create: permission.create || false,
      read: permission.read || false,
      update: permission.update || false,
      delete: permission.delete || false,
    }));

    const payload = { permissions: finalPermissions };

    try {
      const response = await apiRequest(
        "put",
        `/roles/${roleId}`,
        payload,
        token
      );
      if (response.status === 200) {
        toast.success(t("Access updated successfully."));
        onClose();
      }
    } catch (error) {
      toast.error(t(error.message));
    }
  };

  // useEffect(() => {
  //   socket.on("accessedUpdate", async (accessedUpdate) => {
  //     console.log("Role updated:", accessedUpdate);
  //   });
  //   return () => {
  //     socket.off("accessedUpdate");
  //   };
  // }, []);

  const handleChange = (type, field) => {
    setAccess((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: !prev[type][field] },
    }));
  };

  const resetAccess = () => {
    setAccess(initialAccess);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetAccess();
        onClose();
      }}
      className="flex justify-center items-center"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          maxWidth: "500px",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
        className="shadow-lg"
      >
        <Typography variant="h6" className="text-lg font-semibold mb-6">
          {t("Manage_Access")}
        </Typography>

        <div className="max-h-[300px] scrollbar-custom overflow-y-auto px-2">
          {["add", "edit", "delete", "view"].map((action) => (
            <div key={action} className="mb-4">
              <Typography
                variant="subtitle1"
                className="font-medium capitalize mb-2"
              >
                {t("Can")} {t(action)}
              </Typography>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "projects", label: t("Projects") },
                  { key: "reports", label: t("Reports") },
                  { key: "clients", label: t("Clients") },
                  { key: "roles", label: t("Roles") },
                  { key: "evaluation", label: t("Evaluation") },
                  { key: "users", label: t("Users") },
                  { key: "finance", label: t("Billing") },
                  { key: "company", label: t("Company") },
                  ...(action === "view"
                    ? [{ key: "history", label: t("History") }]
                    : []),
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center">
                    <Checkbox
                      checked={access[action][key]}
                      onChange={() => handleChange(action, key)}
                      color="error"
                    />
                    <Typography variant="body2" className="capitalize">
                      {label}
                    </Typography>
                  </div>
                ))}
              </div>
              {action !== "view" && <hr className="my-2 border-gray-300" />}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="contained"
            sx={{ backgroundColor: "black", color: "white" }}
            onClick={handleAccess}
          >
            {t("Confirm")}
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#E9E9E9", color: "black" }}
            onClick={() => {
              resetAccess();
              onClose();
            }}
          >
            {t("Close")}
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
