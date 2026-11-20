// Loaded only when the German form opens: KERN UX styles (with self-hosted Fira Sans), the
// wording in German, and the theme.
import "@/styles/kern.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.de.json"
import type { UiConfig } from "./engine"
import { kernTheme } from "./kern"

export default { ui: ui as unknown as UiConfig, theme: kernTheme, rootClass: "kern-form" }
