import { createRoot } from "react-dom/client"
import ui from "../../../../schema/ui/enquiry-submission.us.json"
import { ReferenceForm, type UiConfig } from "./engine"
import { uswdsTheme } from "./uswds"

const el = document.getElementById("kf-form")
if (el) createRoot(el).render(<ReferenceForm ui={ui as unknown as UiConfig} theme={uswdsTheme} />)
