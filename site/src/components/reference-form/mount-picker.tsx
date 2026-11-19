import { createRoot } from "react-dom/client"
import { isFormCountry } from "./countries"
import { FormDialog } from "./form-dialog"

const el = document.getElementById("kf-dialog-root")
if (el) {
  const open = el.dataset.open
  createRoot(el).render(
    <FormDialog initial={isFormCountry(open) ? open : null} pageTitle="Example enquiry forms | Kinderform" />,
  )
}
