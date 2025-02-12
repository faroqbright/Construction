import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Checkbox, Button } from "@mui/material";
import apiRequest from "../../../utils/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import socket from "../../../websockets/socket";

export default function ManageAccessModal({ open, onClose, roleId, roleData }) {
  const token = useSelector((state) => state?.auth?.userToken);

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

      roleData.permissions.forEach((permission) => {
        const module = permission.module.toLowerCase().replace("management", "");
        if (permission.create) newAccess.add[module] = true;
        if (permission.read) newAccess.view[module] = true;
        if (permission.update) newAccess.edit[module] = true;
        if (permission.delete) newAccess.delete[module] = true;
      });

      setAccess(newAccess);
    }
  }, [roleData]);

  const handleAccess = async () => {
    const permissions = [];
  
    // Loop through each action type (add, view, edit, delete)
    Object.keys(access).forEach((action) => {
      Object.keys(access[action]).forEach((module) => {
        const moduleName = module.charAt(0).toUpperCase() + module.slice(1) + "Management";
        const existingPermission = permissions.find((p) => p.module === moduleName);
  
        if (existingPermission) {
          // Update the existing permission based on the action
          existingPermission.create = existingPermission.create || (action === "add" && access[action][module]);
          existingPermission.read = existingPermission.read || (action === "view" && access[action][module]);
          existingPermission.update = existingPermission.update || (action === "edit" && access[action][module]);
          existingPermission.delete = existingPermission.delete || (action === "delete" && access[action][module]);
        } else {
          // Add a new permission object
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
  
    // Ensure that even objects where all properties are false are included
    const finalPermissions = permissions.map((permission) => ({
      ...permission,
      create: permission.create || false,
      read: permission.read || false,
      update: permission.update || false,
      delete: permission.delete || false,
    }));
  
    const payload = { permissions: finalPermissions };
  
    try {
      const response = await apiRequest("put", `/roles/${roleId}`, payload, token);
      if (response.status === 200) {
        toast.success("Access updated successfully.");
        onClose();
      } else {
        toast.error("Failed to update access.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    }
  };
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for roleUpdated event
    socket.on("accessedUpdate", async (accessedUpdate) => {
      console.log("Role updated:", accessedUpdate);

      // // Fetch updated access data
      // const token = localStorage.getItem("authToken"); // Replace with your auth token logic
      // const roles = await getAccess(token);

      // // Update Redux state
      // dispatch(setRoles(roles));
    });

    return () => {
      socket.off("accessedUpdate");
    };
  }, []);
  const handleChange = (type, field) => {
    setAccess((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: !prev[type][field] },
    }));
  };

  const resetAccess = () => {
    setAccess(initialAccess); // Reset to initial access state
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "8px",
    p: 4,
  };

  return (
    <Modal open={open} onClose={() => { resetAccess(); onClose(); }}>
      <Box sx={{ ...modalStyle }} className="shadow-lg">
        <Typography variant="h6" className="text-lg font-semibold mb-4">
          Manage Access
        </Typography>

        {["add", "edit", "delete", "view"].map((action) => (
          <div key={action} className="mb-4">
            <Typography
              variant="subtitle1"
              className="font-medium capitalize mb-2"
            >
              Can {action}
            </Typography>
            <div className="grid grid-cols-3 gap-2">
              {[
                "projects",
                "reports",
                "clients",
                "roles",
                "evaluation",
                "users",
                ...(action === "view" ? ["history"] : []),
              ].map((field) => (
                <div key={field} className="flex items-center">
                  <Checkbox
                    checked={access[action][field]}
                    onChange={() => handleChange(action, field)}
                    color="error"
                  />
                  <Typography variant="body2" className="capitalize">
                    {field}
                  </Typography>
                </div>
              ))}
            </div>
            {action !== "view" && <hr className="my-2 border-gray-300" />}
          </div>
        ))}

        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="contained"
            sx={{ backgroundColor: "black", color: "white" }}
            onClick={handleAccess}
          >
            Confirm
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#E9E9E9", color: "black" }}
            onClick={() => { resetAccess(); onClose(); }}
          >
            Close
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
