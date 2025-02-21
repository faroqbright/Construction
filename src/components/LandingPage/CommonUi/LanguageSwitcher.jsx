import { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { MdLanguage } from "react-icons/md";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (language) => {
    if (language) {
      i18n.changeLanguage(language);
    }
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton onClick={handleClick} aria-label="language">
        <MdLanguage size={24} />
        <span className="text-lg ml-2 ">
        {i18n.language === "en" ? "English " : "Português"}
        </span>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
        <MenuItem onClick={() => handleClose("en")}>
          {i18n.language === "en" ? "✔ " : ""}English
        </MenuItem>
        <MenuItem onClick={() => handleClose("pt")}>
          {i18n.language === "pt" ? "✔ " : ""}Português
        </MenuItem>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
