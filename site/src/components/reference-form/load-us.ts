// Loaded only when the US form opens: USWDS styles, wording and theme.
import "@/styles/uswds.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.us.json"
import type { UiConfig } from "./engine"
import { uswdsTheme } from "./uswds"

export default { ui: ui as unknown as UiConfig, theme: uswdsTheme, rootClass: "kf-us" }
