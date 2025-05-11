import "../../../utils/i18n";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="flex justify-center items-center mt-8 mb-6">
      <div className="flex justify-center items-center">
        <span className="text-center">
          {t("Made with love by:")}{' '}
          <a
            href="https://techbytech.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            techbytech.tech
          </a>{" "}
          @ {new Date().getFullYear()} 🤖 👨‍💻 🚀
        </span>
      </div>
    </footer>
  );
};

export default Footer;
