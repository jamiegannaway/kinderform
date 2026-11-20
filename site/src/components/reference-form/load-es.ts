// Loaded only when the Spanish form opens: DESY styles (the open design system of the Gobierno de
// Aragón), wording and theme.
import "@/styles/desy.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.es.json"
import type { UiConfig } from "./engine"
import { desyTheme } from "./desy"

export default { ui: ui as unknown as UiConfig, theme: desyTheme, rootClass: "desy-form" }
