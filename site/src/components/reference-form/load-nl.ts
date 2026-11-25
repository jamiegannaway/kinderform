// Loaded only when the Dutch form opens: NL Design System styles (Utrecht components and the
// candidate components, with the neutral Start theme and self-hosted IBM Plex Sans), the wording
// in Dutch, and the theme.
import "@/styles/nl-design.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.nl.json"
import type { UiConfig } from "./engine"
import { nlDesignTheme } from "./nl-design"

export default { ui: ui as unknown as UiConfig, theme: nlDesignTheme, rootClass: "nlds-form" }
