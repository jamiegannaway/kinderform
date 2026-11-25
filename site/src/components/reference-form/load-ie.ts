// Loaded only when the Irish form opens: Government of Ireland Design System styles (with
// self-hosted Lato), the wording in English as used in Ireland, and the theme.
import "@/styles/govie.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.ie.json"
import type { UiConfig } from "./engine"
import { govieTheme } from "./govie"

export default { ui: ui as unknown as UiConfig, theme: govieTheme, rootClass: "govie-form" }
