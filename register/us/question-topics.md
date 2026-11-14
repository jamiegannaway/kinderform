# Question topics (draft)

Every question in `form-questions.csv` (first contact) and `application-questions.csv` (full application) gets one topic code from this list. The codes let us compare first-contact forms across front doors without copying any form.

Where a topic matches a field in the Enquiry schema (`schema/enquiry.schema.json`), the field is named. Topics marked **sensitive** are ones the rubric (`rubric/rubric.md`, domain 3) says should not be asked at first contact.

This list is a draft. Add a code when a question fits none of these, and say why in the pull request.

## Contact and identity

| Code | Covers | Schema field |
|---|---|---|
| `name` | Enquirer's name | none (personal data is not held in the schema) |
| `contact_email` | Email address | none |
| `contact_phone` | Phone number | none |
| `contact_preference` | Preferred way or time to be contacted | `preferred_contact_window` |
| `postal_address` | Street address | none |
| `location` | ZIP code, county or city only | `postcode_outward` (UK); US equivalent to be added |
| `date_of_birth` | Date of birth or exact age (**sensitive** at first contact) | none |
| `age_check` | Confirmation of being over a minimum age | none |

## Interest and intent

| Code | Covers | Schema field |
|---|---|---|
| `interest_type` | Fostering, adopting, kinship, respite, emergency and so on | `fostering_interests` |
| `child_preferences` | Age range, sibling groups or needs the enquirer is open to. Records the question only, never answers | `fostering_interests` |
| `readiness` | How soon the person wants to start, or how far along they are | `intent_tier` |
| `prior_experience` | Earlier fostering, licensing or caring experience | none |
| `transfer` | Currently licensed with another agency | `intent_tier` (`transfer`) |
| `source` | How the person heard about the front door | `source` |
| `free_text` | Open box for questions or comments | none |

## Household

| Code | Covers | Schema field |
|---|---|---|
| `household_members` | Who lives in the home, partner or spouse | none |
| `relationship_status` | Married, single, partnered | none |
| `housing` | Owning or renting, bedrooms, space | none |
| `employment` | Work status or hours | none |
| `income` | Income or finances (**sensitive** at first contact) | none |
| `language` | Languages spoken or preferred | none |
| `demographics` | Race, ethnicity, religion, sexual orientation, gender (**sensitive** at first contact unless clearly optional and for monitoring) | none |

## Checks and eligibility

| Code | Covers | Schema field |
|---|---|---|
| `criminal_history` | Arrests, convictions or charges (**sensitive** at first contact) | none |
| `child_protection_history` | Earlier child abuse or neglect reports (**sensitive** at first contact) | none |
| `health` | Physical or mental health (**sensitive** at first contact) | none |
| `eligibility_other` | Any other screening question, such as citizenship or driving licence | none |

## Application stage

These topics usually appear in the full application, home study or check forms (`application-questions.csv`), not at first contact. Sensitive topics are expected at this stage; the codes still mark them so the summary can say what is asked and when.

| Code | Covers | Schema field |
|---|---|---|
| `motivation` | Why the person wants to foster or adopt | none |
| `parenting_history` | Own children, earlier parenting or caring roles | none |
| `parenting_approach` | Views on discipline, routines and supporting a child | none |
| `relationship_history` | Earlier marriages or partnerships (**sensitive**) | none |
| `education` | Schooling and qualifications | none |
| `references` | Names of referees (records the question only, never answers) | none |
| `support_network` | Family, friends and childcare support | none |
| `home_safety` | Checklist items about the home | none |
| `transport` | Driving licence, vehicle and insurance | none |
| `substance_use` | Alcohol or drug use (**sensitive**) | none |
| `background_check_consent` | Consent to criminal record, fingerprint or registry checks | none |
| `household_adults_checks` | Details of other adults in the home for checks | none |

## Consent and admin

| Code | Covers | Schema field |
|---|---|---|
| `consent_contact` | Permission to be contacted about the enquiry | `lawful_basis` |
| `consent_marketing` | Opt-in to newsletters or campaigns | `marketing_consent` |
| `privacy_ack` | Acknowledging a privacy notice | none |
| `captcha` | Spam check | none |
| `other` | Anything else; describe it in the paraphrase | none |
