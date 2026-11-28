// Loaded only when the Finnish form opens: Suomi.fi design system styles (with self-hosted
// Source Sans 3), the wording in Finnish, and the theme.
import "@/styles/suomifi.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.fi.json"
import type { UiConfig } from "./engine"
import { suomifiTheme } from "./suomifi"

export default { ui: ui as unknown as UiConfig, theme: suomifiTheme, rootClass: "suomifi-form" }
