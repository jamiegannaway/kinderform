// Loaded only when the Singapore form opens: SGDS styles (with self-hosted Inter), the wording,
// and the theme.
import "@/styles/sgds.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.sg.json"
import type { UiConfig } from "./engine"
import { sgdsTheme } from "./sgds"

export default { ui: ui as unknown as UiConfig, theme: sgdsTheme, rootClass: "sgds-form" }
