// Facts about each design system the example forms use: who makes it, its licence, its typeface
// and what Kinderform leaves out. Taken from CLAUDE.md, THIRD_PARTY_NOTICES.md and the header of
// each ported stylesheet in site/src/styles/. The country pages at /example-form/<country> and the
// downloadable forms (site/scripts/build-form-downloads.mjs) both read this file.
//
// A country's design system is the "design_system" value in its wording file,
// schema/ui/enquiry-submission.<country>.json. To add a country:
//   - with a design system already listed here: nothing to add in this file;
//   - with a new design system: add an entry to DESIGN_SYSTEMS under the same key;
//   - with no national design system ("design_system": "neutral"): add one sentence to
//     NEUTRAL_ONLY saying why. The country then shows only the neutral version.
//
// Links point to each system's own website where we have one on record, and otherwise to its
// source code or package. This file has no imports, so Node scripts can read it too.

export type Licence = { name: string; url: string; copyleft?: boolean }

export type DesignSystem = {
  /** The full name, as its makers write it. */
  name: string
  /** A short name for buttons and links: "Download the KERN UX version". */
  short: string
  maker: string
  /** The package and version the form's styles come from. */
  version: string
  licence: Licence
  /** The copyright line the licence asks us to keep. */
  copyright: string
  link: { href: string; text: string }
  /** The typeface on this site. The downloads use the reader's own system fonts instead. */
  typeface: string
  /** What the form leaves out, as a list of things, for "We left out ...". */
  leftOut: string
  /** The ported or compiled stylesheet in this repository. */
  stylesheet: string
}

const MIT: Licence = { name: "MIT licence", url: "https://opensource.org/license/mit" }
const EUPL: Licence = {
  name: "European Union Public Licence 1.2 (EUPL-1.2)",
  url: "https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12",
  copyleft: true,
}
const CC0: Licence = { name: "public domain (CC0 1.0)", url: "https://creativecommons.org/publicdomain/zero/1.0/" }

export const REPO = "https://github.com/jamiegannaway/kinderform"
export const SITE = "https://www.kinderform.org"

export const DESIGN_SYSTEMS = {
  govuk: {
    name: "GOV.UK Frontend",
    short: "GOV.UK Frontend",
    maker: "The Government Digital Service, for UK government services",
    version: "govuk-frontend 6.6",
    licence: MIT,
    copyright: "© Crown copyright",
    link: { href: "https://frontend.design-system.service.gov.uk/", text: "Go to the GOV.UK Frontend website" },
    typeface: "Helvetica or Arial, already on most devices",
    leftOut: "the crown, the GOV.UK logotype, the GDS Transport typeface, and the header and footer",
    stylesheet: "site/src/styles/govuk.scss",
  },
  uswds: {
    name: "U.S. Web Design System (USWDS)",
    short: "USWDS",
    maker: "The U.S. General Services Administration",
    version: "@uswds/uswds 3.14",
    licence: CC0,
    copyright: "A work of the U.S. Government, which the General Services Administration releases under CC0",
    link: { href: "https://designsystem.digital.gov/", text: "Go to the USWDS website" },
    typeface: "Source Sans Pro and Merriweather, from USWDS",
    leftOut: "the “official website of the United States government” banner and the identifier, which are for .gov and .mil sites only",
    stylesheet: "site/src/styles/uswds.scss",
  },
  gcds: {
    name: "GC Design System",
    short: "GC Design System",
    maker: "The Canadian Digital Service, for the Government of Canada",
    version: "@cdssnc/gcds-tokens 2.14, with styles ported from @cdssnc/gcds-components 0.47",
    licence: MIT,
    copyright: "© 2021 Canadian Digital Service – Service numérique canadien",
    link: { href: "https://design-system.canada.ca/en/", text: "Go to the GC Design System website" },
    typeface: "Noto Sans and Lato",
    leftOut: "the Canada wordmark, the flag symbol, the Government of Canada signature, and the header and footer",
    stylesheet: "site/src/styles/gcds.scss",
  },
  agds: {
    name: "Australian Government Design System (AGDS)",
    short: "AGDS",
    maker: "The Australian Government",
    version: "styles ported from @ag.ds-next/react 1.36.0",
    licence: MIT,
    copyright: "© the authors of @ag.ds-next/react",
    link: { href: "https://www.npmjs.com/package/@ag.ds-next/react", text: "See the AGDS package" },
    typeface: "Your device’s own system font",
    leftOut: "the Commonwealth Coat of Arms, the “Australian Government” lockup, and the header and footer",
    stylesheet: "site/src/styles/agds.scss",
  },
  kern: {
    name: "KERN UX-Standard",
    short: "KERN UX",
    maker: "The KERN team (Dataport and contributors), as an open standard for German public administration",
    version: "styles ported from @kern-ux/native 2.9.0",
    licence: EUPL,
    copyright: "© the KERN team (Dataport and contributors)",
    link: { href: "https://gitlab.opencode.de/kern-ux/kern-ux-plain", text: "See the KERN UX source code" },
    typeface: "Fira Sans",
    leftOut: "the KERN header strip (Kopfzeile) and the eagle word mark (Bildwortmarke)",
    stylesheet: "site/src/styles/kern.scss",
  },
  cunningham: {
    name: "Cunningham",
    short: "Cunningham",
    maker: "France Université Numérique, now kept up by La Suite numérique at DINUM, the French State’s digital office",
    version: "styles ported from @gouvfr-lasuite/cunningham-tokens 3.1.0 and cunningham-react 4.4.0",
    licence: MIT,
    copyright: "© 2022 France Université Numérique",
    link: { href: "https://github.com/suitenumerique/cunningham", text: "See the Cunningham source code" },
    typeface: "Roboto Flex",
    leftOut:
      "the French State’s design system (DSFR) with its brand block, tricolour, Marianne font and look. Only State services may use it",
    stylesheet: "site/src/styles/cunningham.scss",
  },
  desy: {
    name: "DESY",
    short: "DESY",
    maker: "SDA Servicios Digitales de Aragón, for the Government of Aragon",
    version: "styles ported from desy-html 17.0.2",
    licence: EUPL,
    copyright: "© SDA Servicios Digitales de Aragón",
    link: { href: "https://bitbucket.org/sdaragon/desy-html", text: "See the DESY source code" },
    typeface: "Open Sans",
    leftOut: "the Aragon and Spanish government logos and the EU funding logos",
    stylesheet: "site/src/styles/desy.scss",
  },
  govie: {
    name: "Government of Ireland Design System",
    short: "GOV.IE Design System",
    maker: "The Office of the Government Chief Information Officer (OGCIO), Ireland",
    version: "styles ported from @ogcio/design-system-react 1.52.0 and @ogcio/theme-govie 1.21.8",
    licence: MIT,
    copyright: "© 2024 OGCIO (PER)",
    link: { href: "https://ds.services.gov.ie", text: "Go to the GOV.IE Design System website" },
    typeface: "Lato",
    leftOut: "the GOV.IE header, the gov.ie logo and the Harp",
    stylesheet: "site/src/styles/govie.scss",
  },
  "nl-design": {
    name: "NL Design System",
    short: "NL Design System",
    maker: "Gemeente Utrecht, Frameless and the NL Design System community",
    version:
      "styles ported from @utrecht/component-library-css 9.0.16, the candidate components and the Start theme 9.2.0",
    licence: EUPL,
    copyright: "© Gemeente Utrecht, Frameless B.V. and the Community for NL Design System",
    link: { href: "https://github.com/nl-design-system/utrecht", text: "See the NL Design System source code" },
    typeface: "IBM Plex Sans",
    leftOut: "the central government’s house style (Rijkshuisstijl), its logo and fonts, and any city’s theme",
    stylesheet: "site/src/styles/nl-design.scss",
  },
  nzgds: {
    name: "New Zealand Government Design System",
    short: "NZ Government Design System",
    maker: "The Department of Internal Affairs, for the New Zealand Government",
    version: "styles ported from @govtnz/ds 0.2.2 (alpha)",
    licence: MIT,
    copyright: "© Crown copyright 2019, Department of Internal Affairs on behalf of the New Zealand Government",
    link: { href: "https://github.com/GOVTNZ/govtnz-design-system", text: "See the design system’s source code" },
    typeface: "Arial, already on most devices",
    leftOut: "the New Zealand Government logo, the coat of arms, and the header and footer",
    stylesheet: "site/src/styles/nzgds.scss",
  },
  sgds: {
    name: "Singapore Government Design System (SGDS)",
    short: "SGDS",
    maker: "The Government Technology Agency of Singapore (GovTech)",
    version: "styles ported from @govtechsg/sgds-web-component 3.31.0",
    licence: MIT,
    copyright: "© 2019 Government Technology Agency of Singapore",
    link: { href: "https://github.com/GovTechSG/sgds-web-component", text: "See the SGDS source code" },
    typeface: "Inter",
    leftOut: "the Official Government Banner, the state crest, the lion head and agency logos",
    stylesheet: "site/src/styles/sgds.scss",
  },
  designsystemet: {
    name: "Designsystemet",
    short: "Designsystemet",
    maker: "Digitaliseringsdirektoratet (Digdir), Norway’s digital agency",
    version: "@digdir/designsystemet-css 1.24.1",
    licence: MIT,
    copyright: "© Digitaliseringsdirektoratet (Digdir)",
    link: { href: "https://designsystemet.no", text: "Go to the Designsystemet website" },
    typeface: "Inter",
    leftOut:
      "Digdir’s, Altinn’s and other agencies’ themes, the ID-porten login header and the coat of arms. The form uses a plain theme of our own",
    stylesheet: "site/src/styles/designsystemet.scss",
  },
  dkfds: {
    name: "Det Fælles Designsystem (Danish Common Design System)",
    short: "Det Fælles Designsystem",
    maker: "The Danish Business Authority and the Danish Agency for Digitisation",
    version: "dkfds 11.3.0, neutral theme",
    licence: MIT,
    copyright: "© 2021 Danish Business Authority & Danish Agency for Digitisation",
    link: { href: "https://designsystem.dk", text: "Go to the Det Fælles Designsystem website" },
    typeface: "IBM Plex Sans",
    leftOut: "the borger.dk and Virk themes and logos, the MitID and NemLog-in header and the coat of arms",
    stylesheet: "site/src/styles/dkfds.scss",
  },
  suomifi: {
    name: "Suomi.fi design system",
    short: "Suomi.fi",
    maker: "The Digital and Population Data Services Agency (DVV), Finland",
    version: "suomifi-ui-components 19.0.0 with suomifi-design-tokens 7.0.0",
    licence: MIT,
    copyright: "© Population Register Centre",
    link: { href: "https://github.com/vrk-kpa/suomifi-ui-components", text: "See the Suomi.fi source code" },
    typeface: "Source Sans 3",
    leftOut:
      "the Suomi.fi logo, brand mark, header and login, the state lion and the coat of arms. Only the Suomi.fi brand family may use its logo and brand mark",
    stylesheet: "site/src/styles/suomifi.scss",
  },
} satisfies Record<string, DesignSystem>

export type DesignSystemKey = keyof typeof DESIGN_SYSTEMS

export const isDesignSystem = (v: unknown): v is DesignSystemKey => typeof v === "string" && v in DESIGN_SYSTEMS

// The neutral version: the site's own shadcn/ui look, for any country.
export const NEUTRAL = {
  name: "Kinderform neutral design",
  short: "neutral",
  maker: "Kinderform, with shadcn/ui components (new-york style, neutral theme)",
  licence: MIT,
  link: { href: "https://ui.shadcn.com", text: "Go to the shadcn/ui website" },
  typeface: "Geist on this site, and your device’s own font in the download",
  about: "Kinderform’s own plain look, with no country’s branding. Use it as a base for your service’s own style.",
}

// Countries whose wording file says "design_system": "neutral", and why, in one sentence.
export const NEUTRAL_ONLY: Record<string, string> = {
  se: "Sweden has no open national design system that a non-government site may use, so its form uses only the neutral design.",
}
export const neutralOnlyReason = (code: string, name: string) =>
  NEUTRAL_ONLY[code] ??
  `${name} has no open national design system that this form can use, so it uses the neutral design only.`
