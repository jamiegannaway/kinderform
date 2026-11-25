# Third-party notices

Kinderform's own code is under the [MIT licence](LICENSE), and its writing and data under [CC BY 4.0](LICENSE-CONTENT.md). The site also uses other people's work. This page lists it, with the licence each comes under.

The npm packages the site installs (in `site/package.json`) carry their own licence files in `node_modules`. The main ones are listed here.

## Design systems used by the example forms

Each example form uses a public-sector design system from its country, without government branding. Kinderform is not a government service.

| Form | Design system | How it is used | Licence |
|---|---|---|---|
| United Kingdom | GOV.UK Frontend 6.6 (`govuk-frontend`) | Sass from the npm package (`site/src/styles/govuk.scss`) | MIT, © Crown copyright |
| United States | U.S. Web Design System 3.14 (`@uswds/uswds`) | Sass from the npm package (`site/src/styles/uswds.scss`) | Public domain (CC0), with fonts and icons under their own licences (below) |
| Canada | GC Design System tokens 2.14 (`@cdssnc/gcds-tokens`) | Tokens from the npm package; component styles ported to `site/src/styles/gcds.scss` | MIT |
| Australia | Australian Government Design System (`@ag.ds-next/react` 1.36.0) | Styles ported to `site/src/styles/agds.scss` | MIT |
| Germany | KERN UX-Standard (`@kern-ux/native` 2.9.0) | Styles ported to `site/src/styles/kern.scss` | [EUPL-1.2](LICENSE-EUPL-1.2.txt). The ported stylesheet stays under the EUPL-1.2 |
| France | Cunningham (`@gouvfr-lasuite/cunningham-tokens` 3.1.0, `@gouvfr-lasuite/cunningham-react` 4.4.0) | Tokens and styles ported to `site/src/styles/cunningham.scss` | MIT, © France Université Numérique |
| Spain | DESY, Government of Aragon (`desy-html` 17.0.2) | Styles ported to `site/src/styles/desy.scss` | [EUPL-1.2](LICENSE-EUPL-1.2.txt). The ported stylesheet stays under the EUPL-1.2 |
| Ireland | Government of Ireland Design System (`@ogcio/design-system-react` 1.52.0, `@ogcio/theme-govie` 1.21.8) | Tokens and styles ported to `site/src/styles/govie.scss` | MIT, © OGCIO |
| New Zealand | New Zealand Government Design System, alpha (`@govtnz/ds` 0.2.2) | Styles ported to `site/src/styles/nzgds.scss` | MIT, © Crown copyright, Department of Internal Affairs |
| Singapore | Singapore Government Design System (`@govtechsg/sgds-web-component` 3.31.0) | Tokens and component styles ported to `site/src/styles/sgds.scss` | MIT, © Government Technology Agency of Singapore. Logos, the state crest, the coat of arms and agency identifiers are outside the grant and are not used |

The French form does not use the French State's design system (DSFR), which is reserved for State services on .gouv.fr. The Spanish form does not use the Spanish central government's design system, which is not open. The Irish form leaves out the GOV.IE header, the gov.ie logo and the Harp. The Singapore form leaves out the Official Government Banner, which is for .gov.sg services only. The New Zealand form leaves out the New Zealand Government logo and the coat of arms.

## Fonts

All fonts are served from this site.

| Font | Where | Licence |
|---|---|---|
| Geist (`@fontsource-variable/geist`) | The main site | SIL Open Font License 1.1 |
| Source Sans Pro, Merriweather, Public Sans (from USWDS) | US form | SIL Open Font License 1.1 |
| Noto Sans and Lato (`@fontsource/noto-sans`, `@fontsource/lato`) | Canadian and Irish forms | SIL Open Font License 1.1 |
| Fira Sans | German form, `site/public/fonts/kern/` | SIL Open Font License 1.1 (`OFL.txt` beside the files) |
| Roboto Flex | French form, `site/public/fonts/cunningham/` | SIL Open Font License 1.1 (`OFL.txt` beside the files) |
| Open Sans | Spanish form, `site/public/fonts/desy/` | SIL Open Font License 1.1 (`OFL.txt` beside the files) |
| Inter (`@fontsource-variable/inter` 5.3.0) | Singapore form, `site/public/fonts/sgds/` | SIL Open Font License 1.1 (`OFL.txt` beside the files) |

## Icons

| Icons | Where | Licence |
|---|---|---|
| Lucide (`lucide-react`) | The main site | ISC |
| Material Symbols (inline SVG paths) | French and Irish forms | Apache License 2.0, © Google |
| Material Icons (modified by GSA, from USWDS) | US form | Apache License 2.0 |
| AGDS, GCDS, KERN, NZGDS and SGDS icons (inline SVG paths) | Australian, Canadian, German, New Zealand and Singapore forms | The licence of each design system, above |

## Flags

The round flags on `/build` come from [flag-icons](https://github.com/lipis/flag-icons) 7.6.0, under the MIT licence, © Panayiotis Lipiridis. They are in `site/public/flags/`, with `LICENCE.md` beside them. Spain's is its civil flag, without the coat of arms.

## Map

The world map on `/example-form` is drawn from [Natural Earth](https://www.naturalearthdata.com/) 1:110m country boundaries, which are in the public domain, through the `world-atlas` package (ISC). `tools/world_map.mjs` builds it.

## Frameworks

The site is built with Astro, React, Tailwind CSS, shadcn/ui, Radix and JSON Forms. They are under the MIT licence.

## Not open: illustrations

The line drawings in `site/public/illustrations/` come from Notioly, a paid illustration pack. Kinderform has a licence to use them on its websites. They are **not** covered by this repository's licences. Do not copy, reuse or redistribute them. See [`site/public/illustrations/LICENCE.md`](site/public/illustrations/LICENCE.md).
