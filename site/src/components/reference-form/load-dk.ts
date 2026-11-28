// Loaded only when the Danish form opens: Det Fælles Designsystem styles (the neutral theme, with
// self-hosted IBM Plex Sans), the wording in Danish, and the theme.
import "@/styles/dkfds.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.dk.json"
import type { UiConfig } from "./engine"
import { dkfdsTheme } from "./dkfds"

export default { ui: ui as unknown as UiConfig, theme: dkfdsTheme, rootClass: "dkfds-form" }
