import { createRoot } from "react-dom/client"
import ui from "../../../../schema/ui/enquiry-submission.uk.json"
import { ReferenceForm, type UiConfig } from "./engine"
import { govukTheme } from "./govuk"

const el = document.getElementById("kf-form")
if (el) createRoot(el).render(<ReferenceForm ui={ui as unknown as UiConfig} theme={govukTheme} />)
