// Loaded only when the Canadian form opens: GC Design System styles (with self-hosted Noto Sans
// and Lato), wording and theme.
import "@/styles/gcds.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.ca.json"
import type { UiConfig } from "./engine"
import { gcdsTheme } from "./gcds"

export default { ui: ui as unknown as UiConfig, theme: gcdsTheme, rootClass: "gcds-form" }
