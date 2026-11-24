// Loaded only when the French form opens: Cunningham styles (with self-hosted Roboto Flex),
// wording in the French of France, and the theme. Every style sits under .cunningham-form.
import "@/styles/cunningham.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.fr.json"
import type { UiConfig } from "./engine"
import { cunninghamTheme } from "./cunningham"

export default { ui: ui as unknown as UiConfig, theme: cunninghamTheme, rootClass: "cunningham-form" }
