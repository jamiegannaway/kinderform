// Loaded only when the Australian form opens: Australian Government Design System styles,
// wording and theme.
import "@/styles/agds.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.au.json"
import type { UiConfig } from "./engine"
import { agdsTheme } from "./agds"

export default { ui: ui as unknown as UiConfig, theme: agdsTheme, rootClass: "agds-form" }
