// Loaded only when the UK form opens: GOV.UK Frontend styles, wording and theme.
import "@/styles/govuk.scss"
import "./kf-form.css"
import ui from "../../../../schema/ui/enquiry-submission.uk.json"
import type { UiConfig } from "./engine"
import { govukTheme } from "./govuk"

export default { ui: ui as unknown as UiConfig, theme: govukTheme, rootClass: "" }
