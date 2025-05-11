import { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { MdLanguage } from "react-icons/md";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";
const LanguageSwitcher = ({ onLanguageChange }) => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (language) => {
    setAnchorEl(null);

    if (language) {
      i18n.changeLanguage(language);
      localStorage.setItem("i18nextLng", language);
      if (onLanguageChange) {
        onLanguageChange(language);
      }
    }
  };

  const displayLanguage = i18n.language.startsWith("pt")
    ? "Português"
    : "English";

  return (
    <div>
      <IconButton onClick={handleClick} aria-label="language" color="inherit">
        <MdLanguage size={24} />
        <span className="text-sm ml-1 capitalize">{displayLanguage}</span>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
        MenuListProps={{
          "aria-labelledby": "language-button",
        }}
      >
        <MenuItem
          onClick={() => handleClose("en")}
          selected={i18n.language.startsWith("en")} // Mark as selected
        >
          English
        </MenuItem>
        <MenuItem
          onClick={() => handleClose("pt")}
          selected={i18n.language.startsWith("pt")} // Mark as selected
        >
          Português
        </MenuItem>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
