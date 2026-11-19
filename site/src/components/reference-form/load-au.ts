// TEMPORARY: uses the GOV.UK theme until the au theme is ready.
import "@/styles/govuk.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.au.json"
import type { UiConfig } from "./engine"
import { govukTheme } from "./govuk"

export default { ui: ui as unknown as UiConfig, theme: govukTheme, rootClass: "" }
