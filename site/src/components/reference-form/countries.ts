// The example form in each country, and the design system it is built with. Shared by the map
// page (rendered at build time) and the dialog that opens each form (in the browser).
export const FORM_COUNTRIES = [
  { code: "uk", name: "United Kingdom", system: "GOV.UK Design System", short: "GOV.UK" },
  { code: "us", name: "United States", system: "U.S. Web Design System", short: "USWDS" },
  { code: "ca", name: "Canada", system: "GC Design System", short: "GC Design System" },
  { code: "au", name: "Australia", system: "Australian Government Design System", short: "AGDS" },
  { code: "de", name: "Germany", system: "KERN UX-Standard", short: "KERN UX" },
  { code: "fr", name: "France", system: "Cunningham design system", short: "Cunningham" },
  { code: "es", name: "Spain", system: "DESY design system (Aragon)", short: "DESY" },
] as const
export type FormCountry = (typeof FORM_COUNTRIES)[number]["code"]

export const isFormCountry = (v: unknown): v is FormCountry => FORM_COUNTRIES.some((c) => c.code === v)
export const countryOf = (code: FormCountry) => FORM_COUNTRIES.find((c) => c.code === code)!
