import starterVersion from "../../../starter/VERSION?raw"
import { FORM_COUNTRIES, type FormCountry } from "@/components/reference-form/countries"

export type StarterKey = FormCountry | "ca-fr" | "global"

export const STARTER_VERSION = starterVersion.trim()
export const STARTER_BASE = `/downloads/starter/${STARTER_VERSION}`

export type Starter = {
  key: StarterKey
  name: string
  language: string
  location: string
  example?: string
}

const local: Record<FormCountry, { language: string; location: string }> = {
  uk: { language: "English", location: "the first part of a UK postcode" },
  us: { language: "English", location: "the first 3 digits of a ZIP code" },
  ca: { language: "English", location: "the first 3 characters of a Canadian postal code" },
  au: { language: "English", location: "a 4-digit Australian postcode" },
  de: { language: "German", location: "a 5-digit German postcode" },
  fr: { language: "French", location: "a 5-digit French postal code" },
  es: { language: "Spanish", location: "a 5-digit Spanish postal code" },
  ie: { language: "English", location: "the first 3 characters of an Eircode" },
  nl: { language: "Dutch", location: "the 4 digits of a Dutch postcode" },
  nz: { language: "English", location: "a 4-digit New Zealand postcode" },
  // Singapore's fostering scheme is national, so its form does not ask where someone lives.
  sg: { language: "English", location: "" },
  no: { language: "Norwegian (Bokmål)", location: "a 4-digit Norwegian postcode" },
  dk: { language: "Danish", location: "a 4-digit Danish postcode" },
  fi: { language: "Finnish", location: "the first 3 digits of a Finnish postcode" },
}

export const LOCAL_STARTERS: Starter[] = FORM_COUNTRIES.flatMap(({ code, name }) => {
  const kit: Starter = { key: code, name, ...local[code], example: `/example-form/${code}` }
  if (code === "ca") {
    return [
      kit,
      { ...kit, key: "ca-fr", language: "French", example: "/example-form/ca?lang=fr" },
    ]
  }
  return [kit]
})

export const GLOBAL_STARTER: Starter = {
  key: "global",
  name: "Any country",
  language: "English",
  location: "",
}

export const starterName = ({ name, key, language }: Starter) =>
  key === "ca" || key === "ca-fr" ? `${name} (${language})` : name
