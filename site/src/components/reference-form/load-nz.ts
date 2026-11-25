// Loaded only when the New Zealand form opens: New Zealand Government Design System styles (Arial,
// a system font, so no font files), the wording in New Zealand English, and the theme.
import "@/styles/nzgds.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.nz.json"
import type { UiConfig } from "./engine"
import { nzgdsTheme } from "./nzgds"

export default { ui: ui as unknown as UiConfig, theme: nzgdsTheme, rootClass: "nzgds-form" }
