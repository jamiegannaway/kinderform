// Loaded only when the Canadian form opens: GC Design System styles (with self-hosted Noto Sans
// and Lato), the wording in English and French, and the theme.
import "@/styles/gcds.scss"
import "./kf-form.css"
import en from "../../../../schema/ui/enquiry-submission.ca.json"
import fr from "../../../../schema/ui/enquiry-submission.ca-fr.json"
import type { UiConfig } from "./engine"
import { gcdsTheme } from "./gcds"

export default {
  ui: en as unknown as UiConfig,
  languages: [
    { code: "en", label: "English", ui: en as unknown as UiConfig },
    { code: "fr", label: "Français", ui: fr as unknown as UiConfig },
  ],
  theme: gcdsTheme,
  rootClass: "gcds-form",
}
