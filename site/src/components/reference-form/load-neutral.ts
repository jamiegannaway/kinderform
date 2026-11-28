// Loaded only when a form is shown in the neutral design: its theme and its one stylesheet.
// The wording is the country's own, loaded separately (see form-page.tsx).
import "./kf-form.css"
import "./neutral.css"
import { neutralTheme } from "./neutral"

export default { theme: neutralTheme, rootClass: "kf-neutral" }
