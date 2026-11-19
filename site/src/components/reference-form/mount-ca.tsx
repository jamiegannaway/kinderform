// The Canadian reference form, built with the GC Design System. The page loads
// @/styles/gcds.scss and ./kf-form.css; GCDS styles apply only inside the .gcds-form class.
import { createRoot } from "react-dom/client"
import ui from "../../../../schema/ui/enquiry-submission.ca.json"
import { ReferenceForm, type UiConfig } from "./engine"
import { GCDS_ROOT_CLASS, gcdsTheme } from "./gcds"

const el = document.getElementById("kf-form-ca")
if (el) {
  el.classList.add(GCDS_ROOT_CLASS)
  createRoot(el).render(<ReferenceForm ui={ui as unknown as UiConfig} theme={gcdsTheme} />)
}
