# Tribal front doors: pass 2 search notes (2026-11-14)

All 73 rows in `front-doors-tribal2.csv` are `search_result` / `unverified`. Pages were not opened.
I used 79 web searches, under the cap of 90. No new rows duplicate the 16 IDs already in the register.

## Title IV-E tribes

I found **no new tribes with approved Title IV-E plans**. Eight searches went on this. The ACF list
(https://acf.gov/cb/grant-funding/tribes-approved-title-iv-e-plans; data.gov metadata says it was last updated
8 September 2025) never showed its names in search snippets. So no pass-2 row is marked `selection: iv-e`.
Every row is marked `selection: search`.

What turned up:
- A 2015 article (https://theonefeather.com/2015/10/14/title-iv-e-document-approved-by-hhs/) names Keweenaw Bay
  and Navajo Nation as approved. Both already have rows.
- GAO-15-273 (https://www.gao.gov/assets/gao-15-273.pdf) has a table of tribal grantees and plan status as of
  December 2014. Only its title showed in snippets.
- A KTOO report (https://www.ktoo.org/?p=340904) says Tlingit & Haida (AK) won approval to get federal
  reimbursements for child welfare. It is unclear whether this is a direct IV-E plan. Row
  `us-ak-tribal-tlingit-haida` is marked `selection: search` and the doubt is in its notes.
- Many tribes have **state-tribal IV-E agreements**, which are not approved tribal plans. Rows note this where
  snippets showed it: SD (Oglala, Sisseton Wahpeton, Flandreau Santee, Standing Rock), ND (Spirit Lake,
  Turtle Mountain, MHA Nation), AK (Tanana Chiefs), CA (Karuk; Yurok has no row), MI (Bay Mills, Hannahville,
  Grand Traverse) and TX (Alabama-Coushatta; no row).
- Suggested next step: one person opens the ACF page, or the GAO table, by hand.

## States searched in pass 2

AK, NM, SD, ND, WI, OR, NE, NV, ID, NY, MS, ME, FL, UT, WY, IA, CO, CT, RI, MA, TX, LA, AL, SC, VA. I then widened
in AZ, CA, OK, WA, MN, MT and MI. KS turned up through other searches.

## States searched where no row was written

- **ME**: Maine law lets tribes license foster homes, but no tribal recruitment or licensing page turned up for
  Penobscot, Passamaquoddy, Houlton Band of Maliseet or Mi'kmaq.
- **IA**: Meskwaki Family Services page shows payee and referral services only. There was no sign of foster
  licensing.
- **TX**: Alabama-Coushatta has a IV-E agreement with Texas DFPS
  (https://nill.narf.org/resources/title-iv-e/texas/texas.pdf), but no recruitment page turned up. Nothing for
  Ysleta del Sur or Kickapoo Traditional Tribe.
- **LA**: The state ICWA appendix lists contacts only (Chitimacha, Coushatta, Tunica-Biloxi, Jena Band).
- **AL**: Poarch Band Family Services lists child and family welfare work, but nothing on foster care.
- **SC**: Nothing found for the Catawba Indian Nation.
- **VA**: Chickahominy family services page links to state and county offices. No tribal programme found.
- **RI**: Narragansett Tribal Child & Family Services does consultation and advocacy. There was no sign of
  licensing.

Pass 2 found only one row each for FL, NY, CT and MA. The rest of each of those states drew nothing (Miccosukee;
Saint Regis Mohawk, Oneida Indian Nation, Shinnecock; Mohegan; Aquinnah Wampanoag).

## Leads not written as rows (too thin, unclear or third-party only)

- Menominee (WI): an ordinance says the tribe may become a state-licensed child placing agency (https://www.ecode360.com/36565371).
- Lac du Flambeau (WI): 2014 news of foster recruitment (https://www.wxpr.org/government/2014-12-01/ldf-seeks-foster-families-for-respite-homes).
- Winnebago Tribe of Nebraska: only a third-party job posting (Preserving Native Families licensing specialist).
- Ponca Tribe of Nebraska ICWA page (https://poncatribe-ne.gov/services/social-services/indian-child-welfare-act/): no recruitment shown.
- Coushatta, Chitimacha (LA): contacts only.
- Yurok Tribe (CA): IV-E agreement with CDSS; a job posting mentions recruiting foster and adoptive parents. No tribal page.
- Hoopa Valley (CA): CFS page (https://www.hoopa-nsn.gov/departments/hoopa-valley-child-and-family-services/) with no foster recruitment shown.
- Pueblo of Laguna, Pueblo of Isleta (NM): only third-party directory entries mention foster care.
- Crow Tribe (MT): state directory lists licensing staff only.
- Blackfeet, Fort Belknap, Chippewa Cree (MT): contacts only.
- Spokane Tribe (WA): the job posting may be for child care licensing, not foster care.
- Suquamish, Swinomish, Kalispel, Nooksack (WA): directory entries only.
- Kiowa Tribe, Kaw Nation, Eastern Shawnee, Delaware Tribe, Fort Sill Apache, Otoe-Missouria, Cheyenne and Arapaho (OK):
  ICW pages or old state agreements with no recruitment snippet. Kaw: https://www.kawnation.gov/icw/; Kiowa:
  https://www.kiowatribe.org/department/indian-child-welfare.
- Lac Vieux Desert, Little River Band, Nottawaseppi Huron, Gun Lake (MI): no foster licensing page found.
- Rosebud Sioux, Cheyenne River Sioux (SD): state CPS serves these tribes directly; Cheyenne River bought a
  foster care village. Rosebud family services page: https://www.rosebudsiouxtribe-nsn.gov/family-services.
- Northern Arapaho (WY): state contracts only.
- Mendota Mdewakanton Dakota (MN): not federally recognised; page on American Indian foster families
  (https://mendotadakota.com/mn/american-indian-foster-families/).
- Red Lake, Bois Forte, Grand Portage, Lower Sioux, Shakopee (MN): Red Lake has a row from a 2020 job posting; the
  rest have contact list entries only.
- Kenaitze, Chugachmiut, Kodiak-area tribes, Copper River (AK): compact or contact listings only.
- Washoe Tribe, Walker River, Yerington Paiute (NV): no foster licensing seen.
- Shoshone-Bannock, Kootenai (ID): nothing found.
- United Indians of All Tribes Foundation (WA, https://unitedindians.org/services/foster-care/): an urban Indian
  non-profit child placing agency under state contract. It is not tribal, so it belongs in the private-agency
  phase (sector private_nonprofit).

## Updates suggested for existing register rows (not duplicated here)

- `us-az-tribal-salt-river-pima-maricopa`: an official programme page turned up at
  https://srpmic-nsn.gov/government/socialservices/fostercare/, with an inquiry form PDF at
  https://srpmic-nsn.gov/wp-content/uploads/2024/03/FosterCareInquiry.pdf.
- `us-ok-tribal-citizen-potawatomi`: the Nation's site has foster care articles (https://www.potawatomi.org/?p=53577).

## Cautions

- Several rows rest on state documents, tribal codes, job postings or news reports, not an enquiry page. Their
  `website` is blank and their notes say so.
- Some source URLs contain spaces exactly as they came back in results (Saginaw Chippewa packet; ND policy manual).
- Rows say nothing about quality or performance. Names of staff and phone numbers that showed up in snippets
  were left out.
