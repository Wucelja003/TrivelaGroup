import { useTranslation } from "react-i18next";
import ContactForm from "../Components/ContactForm";
import { useSeo } from "../lib/seo";

export default function GetInTouch() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    path: "/getInTouch",
  });
  return <ContactForm />;
}
