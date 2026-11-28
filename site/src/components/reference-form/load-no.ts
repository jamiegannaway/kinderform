// Loaded only when the Norwegian form opens: Designsystemet styles (its components, with a
// neutral theme of our own and self-hosted Inter), the wording in Norwegian Bokmål, and the theme.
import "@/styles/designsystemet.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.no.json"
import type { UiConfig } from "./engine"
import { designsystemetTheme } from "./designsystemet"

export default { ui: ui as unknown as UiConfig, theme: designsystemetTheme, rootClass: "dsn-form" }
