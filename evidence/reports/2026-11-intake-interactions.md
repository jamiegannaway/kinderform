# Fostering and adoption intake interactions: what the evidence says works, and a refined OUCM open standard

> **Status:** desk review, version 1, 14 November 2026.
>
> **How it was made:** produced with an AI-assisted research tool, then added to the repository by the maintainer. A few citations were checked by hand on 14 November 2026 (marked *maintainer check*). Most figures have **not yet been checked against the originals by a person**. Check the source before quoting anything.
>
> **Editing note:** the wording has been brought into line with the project's rule against market language about carers and children. Figures, evidence grades and sources are unchanged. Where a source's own published title uses such words, the title is kept as published.
>
> **What this is not:** the recommendations below are proposals for discussion. None of them is yet part of the OUCM standard. Any change to `schema/` will go through the usual schema-first process with examples and tests.
>
> **Companion work:** the earlier front-door audit covered the online enquiry forms themselves. This review covers what happens after someone gets in touch.

**Bottom line:** the best-evidenced lever in intake is relational responsiveness, not a perfect first-call script. That means a prompt, warm human first contact; one named person who keeps in touch; early contact with experienced carers or adopters; and honest information about the process. Speed on its own is not enough. England's hubs became much faster at initial visits but did not, in a controlled comparison, lead to more approvals than non-hub areas. The OUCM draft standard should therefore keep its fast-contact rules and add continuity, hand-off and honesty rules to them.

## TL;DR

- **Speed matters most at the very first touch, then continuity takes over.** Prospective carers and adopters describe the first enquiry as the moment that decides whether they feel welcome. Not being followed up is a documented reason for dropping out: in one Australian study, a quarter of people who enquired and did not go on never got a follow-up. But the controlled evaluation of Foster with North East found no measurable gain in applications or approvals, even though the share of initial visits held within 5 days rose from 29% to 50%. The weak points now are hand-offs, gaps in contact during assessment, and expectations that don't match reality.
- **The strongest transferable mechanisms are personal and reciprocal.** These include a named worker, follow-up calls, "a safe space to ask questions", contact with carer and adopter peers, and messages that say "I have done something for you". The Behavioural Insights Team's SMS trial found that messages from a named adviser mentioning an appointment booked for the person raised attendance from 10.5% to 26.8%. DfE's own Kantar trial found that framing fostering and adoption as a continuum, and offering a "safe space", raised stated intent. That trial measured intentions, not actual behaviour.
- **What OUCM should do.** Keep acknowledgement within 5 minutes and a human attempt within 1 working day. Make "warm hand-off within 2 working days, first contact from the receiving team within 5" mandatory. Add a named "journey guide" and a "keeping in touch" rhythm during assessment. Offer peer contact at the first conversation. Record every touchpoint as an `Interaction` event so services can measure what they currently cannot. Then run an open, pre-registered trial of the nurture and hand-off rules, because no randomised evidence on intake interactions exists in fostering or adoption.

---

## 1. Scope, interpretation and method

**Interpretation.** "Interactions" means the human and digital touchpoints after an enquiry is made, whether by web form, phone, email or event, up to submission of a formal application.

- **Fostering in England:** up to the application or Form F assessment start (Stages 1–2).
- **Adoption in England:** Registration of Interest (ROI), then Stage 1, then Stage 2.

This covers:

- acknowledgements and first calls
- follow-ups, information packs and information events
- initial visits and peer contact
- nurture and "not now" handling
- hand-offs between organisations
- digital and AI tools
- withdrawal conversations

The online enquiry form itself is out of scope and referenced only.

**Method.** Desk research (November 2026) covering:

- UK official statistics and DfE-commissioned evaluations (Ipsos, Kantar, Ipsos/CEI)
- DfE policy and programme documents from 2026
- Adoption UK, Coram and Adoption England data
- local authority and RAA procedures and annual reports
- Behavioural Insights Team (BIT) trial reports
- peer-reviewed and landmark literature: Sebba 2012; Rodger et al. 2006; Madden et al. 2017; Randle et al.; Del Valle et al.
- vendor and practice material, treated as observed practice rather than evidence

A sub-study checked the US and older literature on attrition.

**Evidence grades used in this report:**

- **A:** randomised or quasi-experimental
- **B:** large observational or administrative data
- **C:** qualitative
- **D:** practice guidance or opinion

Each claim is labelled as **Evidence**, **Observed practice** or **Recommendation (OUCM)**.

**Key limitation.** This review found no randomised or quasi-experimental study of a specific intake interaction in fostering or adoption, such as call timing, number of attempts, or nurture cadence. Grade A evidence comes only from:

- the hub-level evaluation (a whole-model change, not single interactions)
- message-framing studies of stated intentions
- analogous domains such as jobcentres and sales

## 2. The scale of the problem

**England, fostering 2024–25 (Evidence, B):**

- DfE's *Renewing Fostering: homes for 10,000 more children* (February 2026) says "Interest in fostering is not the problem": in 2024–25 there were almost 150,000 enquiries (149,795, on Community Care's reading of the data) but only 7,365 newly approved foster carers. DfE notes that enquiry counts are "likely to include multiple enquiries from individuals, and… variations in how fostering services define enquiries."
- It says people who express an interest wait "weeks or months for a reply".
- 59% of local authority fostering assessments take over six months.
- The accompanying consultation estimates that a one-week delay per household adds up to 4,430 cumulative weeks of fostering capacity deferred.

**Ofsted, *Fostering in England 2024–25* (Evidence, B):**

- 8,290 applications were received, and 5,370 were completed by 31 March 2025. *(Maintainer check, 14 November 2026: both figures match Ofsted's main findings, published 26 November 2025.)*
- Of the completed applications, 2,050 were approved, 3,290 withdrawn and 30 rejected.
- Of the withdrawals, 2,175 were by applicants and 1,115 by services.

**Correction to earlier OUCM notes:** the "61% withdrawal" figure is 61% of *completed* applications (3,290 of 5,370), not of all applications received.

**Reasons applicants gave for withdrawing:**

| Reason | Share |
|---|---|
| Change in household circumstances (not financial) | 36% |
| The process was not as expected | 20% |

Ofsted's main findings for 2024–25 also record "other or unknown reason" at 35%. This is a residual category, not a statement that applicants gave no reason.

**Earlier figures:**

- Ipsos/DfE (2023) reports that only 6% of enquiries reached application in 2021–22.
- In 2023–24, Ofsted recorded 8,485 applications, 1,815 approvals, 3,670 withdrawals and 50 rejections.

**DfE's own end-to-end hubs booklet (March 2026):** "Only 14% of initial visits currently result in approval, with prospective carers often disengaging during lengthy assessments."

**England, adoption (Evidence, B):** Coram Institute and Adoption England, *Every Day is Everything* (September 2026), covering 2021/22 to 2025/26:

- Adopter registrations (all agencies, including VAAs) fell 15%, from 3,740 in 2021/22 to 3,180 in 2025/26.
- Approvals fell 25%, from about 2,990 to 2,240 (figures rounded to the nearest 10).
- At 31 March 2026 there were 3,010 children and 1,400 approved families: 1,610 more children than families.
- If registrations fall a further 15%, sufficiency could drop from 41% to about 13% of need by 2030.
- Coram's ASG headline measures (Q3 2025/26) show only 25% of adoptive families were approved within 6 months of registration.

**What this means.** In fostering, plenty of people enquire, but many stop at each step of the journey to approval. In adoption, fewer people are coming forward as well. So adoption intake has to help people keep going *and* avoid putting off the shrinking number who come forward.

## 3. Interaction maps

### 3a. Fostering intake, England (observed practice, with evidence on timing)

| Stage | Typical interactions | Who | Channels | Typical timing (where documented) | Where people are lost |
|---|---|---|---|---|---|
| 0. Enquiry received | Auto-acknowledgement; logged in CRM or case system | Hub (over 70% of local authorities by October 2026, per DfE), LA recruitment team, or IFA | Web form, phone, email, events | Immediate to same day | Not reaching the enquirer is the main early loss |
| 1. First contact / "initial conversation" | Screening call: motivation, spare room, household, working, checks consent; myth-busting; next steps | Recruitment officer or adviser; in Foster with North East, a hub fostering social worker | Phone (dominant); some evenings and weekends | Ipsos case-study services reported 1–2 working days; Doncaster procedure: next working day | Essex analysis: most "no further action" closures happen soon after initial contact, often because contact can't be established |
| 2. Information | Information pack (often digital); FAQs; offer of an information session or a "speak to a carer" | Recruitment team | Email or post; webinars and drop-ins | Packs within 5 working days in several procedures (Redbridge, Nottinghamshire); Doncaster makes a courtesy call 5 days after the pack | Silence after the pack; Redbridge sends a follow-up letter at 2 weeks |
| 3. Peer contact (optional) | Buddy or mentor; carer at events | Experienced carer | Phone, in person | Derby (Foster for East Midlands): mentor offered on the first call; DfE end-to-end model: buddy "from the point of completion of enquiry" | Uptake varies by LA (Foster with North East) |
| 4. Expression of interest (EOI) and initial home visit | EOI form; home visit to explore suitability and "right time" | Social worker (hub-led, joint or LA-led) | In person or virtual | Common standard is within 5 working days of request (Nottinghamshire, Doncaster, Wales); Foster with North East: 50% within 5 days in 2025 | Visit seen as "invasive" by some; "not the right time" |
| 5. Hand-off to assessing service | Transfer from hub to LA; allocation | Hub → LA | Email/system plus call | Foster with North East evaluation recommends first LA contact within 5 working days | Main friction point in Foster with North East: communication "ceased or diminished" |
| 6. Application → Stage 1/2 | Application form; checks; Skills to Foster; "keeping in touch" calls | Assessing social worker; hub | Mixed | DfE target: initial visit to approval under 200 days / 6 months | 61% of completed applications withdrawn; 20% "process not as expected" |

**Kinship branch.** Connected-persons enquiries arrive through the same front door but follow a different legal route, with urgent, child-specific assessment. Foster with North East's training groups included kinship carers alongside mainstream applicants, and DfE's end-to-end booklet has a separate kinship section.

**Recommendation (OUCM):** add a kinship flag at the first conversation that diverts the enquiry within 1 working day to the kinship or connected-persons team. Do not put it through the nurture sequence.

### 3b. Adoption intake, England (structurally different)

| Stage | Typical interactions | Who | Statutory or typical timing | Notes |
|---|---|---|---|---|
| 0. Enquiry | Acknowledgement; initial call | RAA (most), VAA, a few LAs | Statutory guidance: detailed information within **10 working days** of a request | Many RAAs require an information event before an ROI |
| 1. Information event | Usually online, often mandatory before ROI | RAA team, adopters as speakers | Held regularly | Adopt South 2025/26: 653 enquiries → 428 households at online information events → 189 ROIs → 171 into assessment → 86 approved |
| 2. Initial visit or conversation | Explores readiness, Early Permanence interest | Social worker | Varies | Adopt South: 64% of approved adopters wished to be considered for Early Permanence |
| 3. Registration of Interest | ROI form | RAA | Decision to accept within **5 working days** | Adopt South reports being the only RAA meeting the enquiry-to-ROI 5-day timescale |
| 4. Stage 1 (pre-assessment) | Checks, references, preparation training | RAA | **2 months** | Fast-track (approved foster carers, previous adopters): decision within **4 months** of ROI |
| 5. Stage 2 (assessment) | Home study | Social worker | **4 months** | Adoption UK Barometer 2026 (England, 2,445 of 3,078 UK respondents): only 39% said approvals ran "smoothly with no delays", 61% reported delays, and more than half found the process so challenging they considered dropping out; 87% said their social worker understood and supported them |

**Where adoption differs:**

- The steps are formalised: ROI and statutory timescales.
- Information events are commonly a gateway.
- Adopters actively choose between agencies. The Wales Barometer reports 92% knew they had a choice, and that promptness of response and the quality of the information event were among the factors driving that choice.
- Fear of rejection is acute, especially after infertility, and among single and same-sex applicants (Kantar 2022).
- Inter-country adoption is a separate, specialist route and should be signposted out.

### 3c. Devolved nations (brief)

- **Wales:** Foster Wales is a national network of the 22 local authority services. Foster Wales Bridgend promises contact "within one working day" and aims to complete an initial visit and pre-assessment screening within 5 working days. The Bridgend/Merthyr/RCT regional front door sets a 24-hour follow-up call and an initial visit within 5 working days. The AFA Cymru *National Fostering Framework Good Practice Guide* tells staff to "always offer prospective applicants a home visit within five working days". The Adoption Barometer shows Welsh prospective adopters report more positively than the UK average: 44% said their approval ran smoothly versus 39% UK-wide, and 91% said their social worker was supportive.
- **Scotland and Northern Ireland:** this review found no published, comparable intake response standards. The Scotland Barometer reports that "recommendations from others with experience of adopting" (21%) was the most-reported influence on choice of agency. This is a gap OUCM could fill through voluntary data sharing.

## 4. Evidence on what works, stage by stage

### 4.1 Evidence table

| # | Finding | Source | Year | Country | Method | Grade |
|---|---|---|---|---|---|---|
| 1 | Hub-led initial visits raised the share held within 5 days from 29% to 50%, and cut waits over 21 days from 13% to 2%. No statistically significant effect on applications or approvals versus matched non-hub LAs | Ipsos/CEI, *Evaluation of Foster with North East, Year 3* | 2026 | England | Staggered difference-in-differences plus monitoring plus qualitative (n=51) | A (null) / B |
| 2 | Hub-to-LA handover was a friction point: some withdrawn applicants said communication "ceased or diminished" | Same | 2026 | England | Qualitative | C |
| 3 | Hubs where more people go on to approval "prioritise relationship-building early on, maintain regular contact throughout the process", and some offer out-of-hours support. Only 14% of initial visits end in approval | DfE end-to-end hubs booklet | 2026 | England | Programme data (unpublished method) | B/D |
| 4 | The first enquiry's "feel" was the factor most often cited as affecting recruitment. Many saw enquiring as the start of the application and feared asking "the wrong question". Follow-up calls "shift the power imbalance" | Kantar Public for DfE, *Applying behavioural insights to fostering and adoption* | 2022 | England | Literature review, 20 stakeholder interviews, 30 in-home interviews, 8 groups | C |
| 5 | In an online RCT (effective n=2,198), every prototype message beat "typical" recruitment copy on intent. Continuum framing was best for fostering; a "safe space" framing was best for adoption. Challenge framing faded on second exposure for fostering | Same (Behaviour Change Lab) | 2022 (fieldwork 2020) | England | Online RCT of stated intent | A (intentions only) |
| 6 | Services reported responding in 1–2 working days. Quick response, a relational approach, and hearing from carers were the main enablers. Word-of-mouth enquiries were the "strongest" | Ipsos for DfE, *Foster carer recruitment and conversion rates* | 2023 | England | 10 case studies plus workshop | C |
| 7 | "Enquiry" is defined inconsistently within and between services, so rates of progress from enquiry can't be compared between services | Same | 2023 | England | Qualitative | C |
| 8 | Only half of enquirers got a personal follow-up; 96% weren't carers 10 months later; a quarter of those who did not go on gave the agency never following up as the reason | Keogh & Svensson, via Sebba (Rees Centre review) | 1999 / 2012 | Australia | Survey | B (dated) |
| 9 | 80% of enquiries don't become applications (Triseliotis); drop-out from enquiry to registration ranged 70–95% across English LAs (Bebbington & Miles); fewer than 2% of South Australian campaign enquirers registered (Delfabbro) | Sebba, Rees Centre review | 2012 | International | Literature review | B (dated) |
| 10 | Of 300 US families seeking to adopt from foster care, 98 finalised and 102 discontinued. Top barriers: process logistics (92.5%), agency communication and responsiveness (79.5%), agency emotional support (65%) | Madden et al., *Adoption Quarterly* 20(1) (AdoptUSKids barriers sample) | 2017 | USA | Longitudinal survey and exit interviews | B |
| 11 | "Steep attrition" from first call to adoption; the initial call is the first "crucial point" agencies handle poorly | Geen, Malm & Katz, Urban Institute/HKS working paper | 2005 | USA | Mixed methods, 3 sites | C |
| 12 | 35% of foster parents found out about fostering through knowing other foster families | Rodger, Cummings & Leschied, *Child Abuse & Neglect* 30(10) | 2006 | Canada | Survey, n=652 | B |
| 13 | Applicants withdraw late once they learn the reality of fostering, e.g. when shown a weekly schedule of meetings that clashes with work | Fostering Network & CEI, *Foster carer retention and recruitment in England* | 2023 | England | Survey plus focus groups | C |
| 14 | Prospective adopters: 39% (England) say approvals ran with no delays and 61% reported delays; 87% felt supported by their social worker (2,445 England respondents of 3,078 UK-wide) | Adoption UK, *Adoption Barometer 2026* | 2026 | UK | Annual survey | B (self-selected) |
| 15 | Firms that tried to contact an online sales enquiry within an hour were nearly 7 times as likely to qualify it as firms that tried an hour later, and over 60 times as likely as firms that waited 24 hours or more. Average response was 42 hours; 23% never responded | Oldroyd, McElheran & Elkington, *Harvard Business Review* | 2011 | USA | Audit of 2,241 firms plus 1.25m sales enquiries | B (analogue; vendor-linked data) |
| 16 | SMS naming an adviser who had booked a slot for the person ("reciprocity") raised recruitment-event attendance from 10.5% to 26.8% | BIT, Bedford Jobcentre | 2015 | England | RCT (n=1,224) | A (analogue) |
| 17 | Commitment and implementation-intention redesign of jobcentre conversations raised benefit off-flow (Essex stepped-wedge: 56.8% → 58.5%) | BIT, DWP | 2015 | England | Stepped-wedge trial (n=110,838) | A (analogue) |
| 18 | A behavioural email before an Army assessment centre had no significant effect on pass rates. Late-stage nudges can fail | BIT Update 2015–16 | 2016 | England | RCT | A (analogue, null) |
| 19 | Spain: only 7% of 343 non-relative foster families were repeating the experience. Recruitment (*captación*) is under-evaluated, and exit interviews with families who drop out are recommended | Del Valle et al.; *Zerbitzuan* review | 2010 / 2022 | Spain | Case-file study; review | B / D |

### 4.2 Speed of response

**Evidence:**

- Delay and lack of follow-up clearly cause losses (rows 8, 10, 11).
- DfE now names reply delays as a national failure.
- The *size* of the speed effect within fostering is unknown.
- The best test so far (row 1) found big speed gains at the initial-visit stage but no measurable difference in approvals.
- The HBR decay curve (row 15) comes from commercial sales, where buyers compare vendors within hours. In fostering, people often think about it for years: Ipsos cites 2–5 years from first thinking to approval.

**Interpretation:**

- Speed transfers most strongly to two moments: (a) making contact while the person is still emotionally "open" and reachable, and (b) not losing them to another agency, which Ipsos documents.
- It transfers weakly to the later decision to apply, which depends on household readiness. Changes in household circumstances account for 36% of applicant withdrawals.

**Recommendation:** keep the fast first touch. It is cheap, and Essex's data shows unreachable enquirers are the largest early loss. But don't promise that speed alone will mean more approvals.

### 4.3 The first conversation

**Evidence (C):**

- Kantar found that a "cold, curt, critical, or overly intrusive" first call makes enquirers doubt themselves. People who don't "fit the mould" fear judgement most: minority ethnic, single and same-sex applicants, and those with difficult histories.
- Effective agencies help people reframe past difficulties as strengths.
- Ipsos describes the tension between screening ("so we don't waste our time and their time") and going "at the enquirer's pace".

**Who should make the call.** There is no comparative evidence on social worker versus adviser. Foster with North East uses hub fostering social workers for the screening conversation. AdoptUSKids' checklist asks whether the responder is "family-oriented" and "trained to address expectations and fears families typically present".

**Realistic job preview.** (This is the research term for giving honest information about a role before someone commits.) There are no fostering trials. Ipsos participants argued that honest information early would let enquirers "opt themselves out early". The Fostering Network/CEI found late withdrawals once reality bites. Kantar's key-driver analysis found that confidence is boosted by believing support will be available, so honesty should be paired with support ("challenge and support"). Note that the challenge-only frame weakened fostering intent on second exposure.

**Recommendation:** a structured but conversational first call covering:

1. welcome and thanks
2. their questions first ("there are no wrong questions; asking doesn't count against you")
3. two or three eligibility myths relevant to them
4. an honest preview of the time commitment, with examples, plus the support offered
5. a fostering–adoption–other-roles continuum where relevant
6. an agreed next step with a date

### 4.4 Information events and initial visits

**Observed practice and evidence:**

- Adoption commonly uses online information events as a gateway. Adopt South's published figures show about 66% of enquirers attended, and about 44% of attendees returned an ROI.
- Sebba reports that in Erie County, phoning enquirers within 3 days of a missed information meeting and offering a one-to-one meeting brought in people who would otherwise not have gone on (no effect size given).
- Foster with North East found that digital and travel requirements deterred some participants from training and buddying, and recommends non-digital options.

**Recommendation:**

- Offer both online and in-person formats.
- Don't make an event a hard prerequisite for fostering.
- Always run a "missed event" recovery call within 2 working days.

### 4.5 Carer-to-carer and adopter-to-adopter contact

**Evidence:**

- Word of mouth produces the strongest enquiries (Ipsos, C).
- Knowing other foster families is the most common route in (Rodger et al., B).
- Foster with North East's buddy scheme "gave honest, practical insight", but uptake varied (C).
- The Australian CFECFW rapid review (2024) notes "some studies" show benefits of buddies through accreditation (D).
- There is no trial evidence. A practitioner critique warns against relying on buddies as an educational tool (D).

**Recommendation:** offer peer contact at the first conversation, with a defined purpose (for example a 30-minute "what the first year is really like" call). Record whether it was offered, accepted and held.

### 4.6 Relationship continuity and transparency

**Evidence:**

- Ipsos's earlier Foster with North East work and the Year 3 report show enquirers value continuity and "keeping in touch" calls (C).
- DfE now *requires* end-to-end hubs to provide a "dedicated consistent 'journey guide' from enquiry to approval" through a named individual, targeted at the points where most people drop out (D/policy).
- In adoption, Barometer respondents describe periods of "next to no contact" between Stage 1 and Stage 2 workers (C).

**Recommendation:** a named journey guide and a "what happens next" timeline sent after every stage change.

### 4.7 Nurture and "not now"

**Evidence:**

- Essex found that over half of enquirers who were contacted but later closed said it "wasn't the right time" (B, single LA).
- Kantar recommends keeping people "warm until circumstances change" or offering other roles such as respite or mentoring (C).
- Derby's procedure keeps in "regular contact over a period of one month, via email, text and phone calls" if no visit is booked.
- There is no evidence on the best cadence. Commercial "dormant database reactivation" vendors exist, but their claims are marketing, not evidence.

**Recommendation:** let the enquirer choose the re-contact date, and send fewer, more relevant messages. See section 10.

### 4.8 Hand-offs

**Evidence:** hand-off is the most clearly documented current failure point in England's hub model (row 2). The evaluation recommends:

- joint communications explaining the transition
- first LA contact within 5 working days
- clear responsibility for questions about fees, support and assessment

DfE's end-to-end model aims partly to "reduce handover". The adoption literature flags "jurisdictional and interjurisdictional issues" for 26% of US families.

### 4.9 Withdrawal and exit

**Evidence:**

- Ofsted captures withdrawal reason categories.
- Ipsos recommends gathering more qualitative data on why people don't go on "in the least resource intensive way".
- The Spanish review recommends exit interviews.
- Withdrawal is not always failure. An informed decision not to foster can be a good outcome (CoramBAAF commentary; Ipsos).

**Recommendation:** a short, optional exit conversation plus a one-question reason code, with an explicit "door stays open" offer.

### 4.10 Equity in interactions

**Evidence:**

- Kantar found fear of judgement concentrated among people who do not "fit the mould". It reported a perceived lack of cultural awareness in some services, which turns questions into "dead ends", and found rigid assumptions about faith-matching.
- Ipsos reports that progress from enquiry differs by gender, age and ethnicity, but notes the ethnicity differences "cannot be reliably" estimated.
- Foster with North East saw no shift in enquirer diversity despite targeted activity.
- In adoption, You Can Adopt prioritises Black and Black Mixed Heritage adopters.

**Recommendation:**

- Record, with consent, the demographics of where people stop, stage by stage.
- Train first-call staff on misconceptions specific to each group (renting, single, LGBTQ+, age, working, disability, convictions).
- Audit early closures by service for disproportionality.

## 5. Behavioural science: what has been tried and what transfers

| Mechanism | Fostering/adoption evidence | Analogue evidence | Likely transfer |
|---|---|---|---|
| Messenger and reciprocity ("I've booked this for you" from a named person) | Kantar: follow-up calls shift power; Foster with North East values named contacts (C) | BIT Bedford: 10.5% → 26.8% attendance (A) | **High**: use named senders and pre-booked slots |
| Implementation intentions and commitment (specific next step, date, place) | None | BIT/DWP jobcentres: positive stepped-wedge effect (A) | **High** for booking visits and events |
| Safe-space and permission framing | Kantar RCT: best for adoption intent (A, intentions) | n/a | **High** for first-contact copy |
| Continuum framing (foster ↔ adopt ↔ respite/mentoring) | Kantar RCT: best for fostering intent (A, intentions) | n/a | **High**; also supports "not now" re-routing |
| Honest challenge framing | Kantar: initial lift fades for fostering on re-exposure (A, intentions) | Realistic job preview literature (not reviewed here) | **Medium**: always pair with support |
| Social norms / "you have been chosen" | None | HMRC email: 1.6% → 2.4% click-through (A) | **Low–medium**: risks feeling manipulative in a life-changing decision |
| Reminders before events | Erie County missed-meeting calls (C) | BIT SMS evidence broadly positive; but an Army pre-assessment email had no effect (A) | **Medium**: use for attendance, not for the decision itself |

**Trials found on fostering or adoption recruitment specifically:**

- DfE/Kantar's message test (2020 fieldwork).
- An older BIT West Sussex trial with *existing* carers (resilience training), which is not about intake.

This review found no Foundations or Nesta trial on enquiry follow-up. This is a genuine gap.

## 6. Digital, automation and AI

**Observed practice:**

- **DfE direction:** DfE has told new hubs to align with government data, digital and technical standards "rather than investing in new digital solutions at this time". DfE "will develop digital tools… that streamline the recruitment and onboarding of prospective foster carers", which hubs will integrate with "when ready in 2027". This is the most important digital fact for OUCM. A national tool is coming, and an open standard could shape it.
- **Specialist enquiry systems:** Council Advertising Network has an Enquiry Management System for councils, co-designed with 10 council fostering teams, arguing that generic retail CRMs fit poorly. Procedures show enquiry records held in Mosaic and LCS.
- **Weekly dashboards:** Foster with North East shares weekly PDF dashboards. The evaluators found this data was used operationally but not yet strategically.
- **Chatbots:** vendor chatbots for fostering agencies offer 24/7 web chat and WhatsApp (e.g. fostering.ai). This review found no published evaluation.
- **A cautionary public-sector analogue:** a Wandsworth and Richmond AI chatbot pilot for adult unpaid carers (Tovie AI) was reported by local press to produce corrupted text and inaccurate service advice. The council says assessments were reviewed by social workers.
- **US data targeting:** The Contingent (Oregon) uses data and AI to target likely foster parents by ZIP code with texts and email (journalistic source).
- **AI search:** commentary notes prospective carers now use general AI assistants to compare providers.

**Risks:**

- Inaccurate eligibility advice. This is the biggest risk, because eligibility myths are themselves a barrier.
- Safeguarding disclosures made to a bot.
- UK GDPR: special category data, and household members' data collected before consent.
- Losing the relational signal that Kantar shows enquirers read as a preview of "the system".

**Recommendation (human-in-the-loop rules):**

1. AI may draft acknowledgements, summaries, follow-up emails and call notes, but a named human approves anything that is personalised.
2. Bots may answer factual FAQs from an approved knowledge base, with links to sources. They must never make eligibility determinations and must hand off to a human on any disclosure, distress or "can I with my…" question.
3. Every AI-touched message is logged as an `Interaction` with `ai_assisted=true`.
4. No automated re-contact without opt-in.

The legitimate speed gain from AI is in the *first five minutes and the first working day*: instant, warm, specific acknowledgements, and call-prep summaries for staff. It is not in replacing the conversation.

## 7. Exemplars and published standards (observed practice; no ranking intended)

**Published response and contact standards:**

| Service | Published standard |
|---|---|
| Foster Wales Bridgend | Contact within 1 working day; initial visit and screening within 5 working days |
| Bridgend/Merthyr/RCT regional front door | Follow-up call within 24 hours; initial visit within 5 working days |
| Doncaster | Next-working-day response; courtesy call 5 days after the information pack; visit within 5 working days |
| Nottinghamshire | Visit offered within 5 working days |
| Derby (Foster for East Midlands) | Information pack same day; mentor and information session offered at first call; one month of multi-channel contact |
| National Fostering Group Wales | Screening call within 2 days |
| Florida (USA) adoption customer-service protocol | Inquiries answered within 3 business days |
Procedure manuals say what a service intends. They may not reflect actual performance.

*Editing note, 14 November 2026: a row naming three services' reply times from our own earlier front-door audit has been removed. Services see our findings about them privately before anything is published.*

**Strong design features worth reusing:**

- Foster with North East's "keeping in touch" calls and regional buddy scheme.
- Adopt South's published stage-by-stage figures and 5-day enquiry-to-ROI performance.
- Oklahoma's Bridge Resource Support Center (2010), which made follow-up calls at 10 and 30 days, gave consistent information, and reduced time from inquiry to worker follow-up.
- AdoptUSKids' *Is your response system family friendly?* checklist, which includes experienced families designing intake and auditing response.
- Essex's analysis of "no further action" closures by stage and channel.

**Problems documented in published sources:**

- Reply waits of weeks or months (DfE 2026).
- Communication gaps at hub-to-LA hand-off (Foster with North East evaluation).
- "Next to no contact" between adoption Stage 1 and Stage 2 workers (Adoption Barometer).
- Historic agency failures to follow up (Keogh & Svensson; Geen et al.).

**A note on secret shopping.** AdoptUSKids' checklist suggests auditing intake with a "secret shopper method". OUCM should prefer consented, declared test enquiries arranged with services rather than deceptive mystery shopping.

## 8. International lessons (brief)

- **USA:** "Customer service" is an established recruitment frame (AdoptUSKids/NRCDR). Some states publish response standards (Florida: 3 business days). The strongest data comes from the adoption barriers study. Lesson: treat responsiveness and emotional support as core service quality, and track each step from inquiry to licensure.
- **Australia:** Randle and colleagues' social-marketing programme found 40% of 897 non-carers knew nothing about foster care, and a notable share had simply never been asked. Historic follow-up failures are well documented. Lesson: ask directly, and follow up personally.
- **Spain:** recruitment is under-evaluated. The 2022 *Zerbitzuan* review calls for evaluation tools for the recruitment-and-contact process and exit interviews with families who drop out. Only 7% of foster families repeat the experience (Del Valle et al.). In a small Canary Islands study (n=26), campaigns (42.3%) and friends or relatives who knew the programme (26.9%) or fostered (23.1%) were the main routes in. Lesson: word of mouth and evaluation infrastructure.
- **Ireland (Tusla), New Zealand (Oranga Tamariki):** this review could not verify intake-interaction evidence or standards. They are listed as gaps.

## 9. Measurement

| Metric | Definition | Collected nationally now? |
|---|---|---|
| Time to acknowledgement | received → first outbound message | No |
| Time to first human attempt | received → first call attempt | No (DfE hub standard "call within 24 hours" is to be monitored) |
| Time to first conversation | received → conversation held | No |
| Contact attempts per enquiry and per channel | count | No |
| Unreachable rate | closed without contact / enquiries | No (Essex measures it locally) |
| Information event attendance and missed-event recovery | booked → attended → recovered | Partial (RAA local data) |
| Peer contact offered, accepted, held | flags | No |
| Time to initial visit | EOI → visit | Hub monitoring only (Foster with North East: 50% ≤5 days) |
| Hand-off latency | hand-off sent → first contact from receiving team | No |
| Progress between stages, and time in each stage | enquiry → visit → application → approval | Ofsted (fostering: enquiries, applications, outcomes); ASG/Coram (adoption: registrations, approvals, % approved within 6 months) |
| Withdrawal reason by stage | coded | Ofsted (application stage only) |
| Enquirer-reported experience | "I felt welcomed and able to ask anything" (1–5); one open question | No |

**Recommendation:** define "enquiry" once, aligned to Ofsted's 2023–24 clarification that an enquiry must be "actionable" with name and contact details, so that OUCM data is comparable.

## 10. Implications for the OUCM open standard

These are proposals. They have not been adopted.

### 10.1 Refined first-contact standard

| Draft element | Verdict | Revised rule | Basis |
|---|---|---|---|
| Acknowledgement within 5 minutes | **Confirm** | Within 5 minutes, 24/7. Must name the person who will call and when; a written promise of a call slot | Low cost; Kantar (first-contact feel); BIT (named messenger) |
| First human attempt within 1 working day | **Confirm** | Within 1 working day; includes an evening or Saturday option | DfE hub standard (call within 24h); Wales 1 working day; Ipsos (evening/weekend contact) |
| First conversation within 5 working days | **Confirm** | Unchanged | Essex (unreachable losses) |
| 3 attempts over 5 working days across channels | **Tighten** | 3 attempts at different times of day across 2+ channels, the last offering self-booking; then a "we'll keep your place" message | Analogue persistence evidence; Derby practice |
| Nurture on days 2, 7, 21 by intent tier | **Change** | Day 2: personal "what happens next" (named sender). Day 7: peer-story or peer-call offer. Day 21: check-in call. Then follow the enquirer's chosen cadence only. Maximum 1 message a week unless the person replies | No cadence evidence; avoid over-contact; reciprocity and peer evidence |
| "Not now" with chosen re-contact date (3/6/12 months) | **Confirm and extend** | Add an "other ways to help" offer (respite, mentoring, adoption ↔ fostering continuum) and an opt-in newsletter | Kantar (keep warm, continuum); Essex ("not the right time") |
| One-question withdrawal survey | **Extend** | One coded question plus an optional 10-minute exit conversation; "door stays open" | Ipsos; Spanish review |
| *New:* named journey guide | **Add** | Assigned at first conversation; continues through assessment | DfE end-to-end requirement; continuity evidence |
| *New:* warm hand-off | **Add** | Joint message within 2 working days naming the new contact; receiving team's first contact within 5 working days; sender keeps responsibility until contact is confirmed | Foster with North East Year 3 recommendation |
| *New:* missed-event recovery | **Add** | Call within 2 working days offering a 1:1 | Erie County via Sebba |
| *New:* kinship branch | **Add** | Divert within 1 working day; no nurture | Different legal pathway |
| *New:* keeping-in-touch rhythm | **Add** | At least every 2 weeks from EOI to panel, or whenever there is a gap with no activity | Foster with North East; Adoption Barometer (contact gaps) |

### 10.2 Proposed `Interaction` data object

```
Interaction {
  interaction_id: uuid
  enquiry_id: uuid                  # FK to Enquiry
  sequence_no: int
  type: enum [acknowledgement, call_attempt, conversation, sms, email, whatsapp,
              letter, info_pack, info_session_booked, info_session_attended,
              info_session_missed, home_visit, peer_contact_offered, peer_contact_held,
              nurture, keeping_in_touch, handoff_sent, handoff_received,
              not_now_agreed, recontact, withdrawal_conversation, exit_survey]
  channel: enum [phone, video, in_person, email, sms, whatsapp, post, web_chat, portal]
  direction: enum [outbound, inbound]
  actor_role: enum [system, recruitment_adviser, social_worker, journey_guide,
                    peer_carer, peer_adopter, hub, la, raa, ifa, vaa, ai_agent]
  actor_org_id: string              # ODS/Ofsted URN where available
  ai_assisted: bool
  human_approved_by: string|null
  occurred_at: datetime
  duration_seconds: int|null
  outcome: enum [no_answer, voicemail, connected, completed, booked, attended,
                 missed, declined, opted_out, bounced]
  topics: [eligibility_myth, finances, process_timeline, support, kinship,
           adoption_continuum, disclosure, other]
  next_step_agreed: string|null
  next_contact_due_at: datetime|null
  recontact_preference: enum [3m, 6m, 12m, custom, none]|null
  handoff_to_org_id: string|null
  handoff_acknowledged_at: datetime|null
  enquirer_feedback_score: int(1-5)|null   # "felt welcomed / able to ask anything"
  consent_basis: enum [consent, public_task, legitimate_interest]
}
```

**Design notes:**

- It is event-sourced. Enquiry status should be *derived* from Interactions, not edited by hand.
- It aligns `actor_org_id` and service fields with Open Referral/HSDS-style organisation and service identifiers.
- It uses Ofsted's "actionable enquiry" definition.
- Store topics as codes, not free text, to limit special-category data.
- *Maintainer note:* to keep the existing schema's pseudonymous design, `human_approved_by` should hold a role or a local reference, never a name, and `next_step_agreed` should be a coded value rather than free text. This would need settling before any schema change.

### 10.3 Reusable interaction patterns (described in words)

1. **First call (15–25 minutes).**
   - Thank them, and give them permission: "Nothing you ask counts against you."
   - Ask "What made you get in touch now?" Their questions come first.
   - Correct the two or three myths relevant to them.
   - Give an honest picture of a typical week, together with the support offered.
   - Present options along the continuum.
   - Offer peer contact.
   - Agree a dated next step (implementation intention) and send a summary by text or email within an hour from the named worker.
   - *Basis:* Kantar; BIT; Ipsos.
2. **"What happens next" sequence.** After every stage change, send a short message from the named guide. It covers what just happened, what happens next, who will contact them and by when, how long it usually takes, and one thing they can do now. *Basis:* continuity and transparency evidence; Barometer complaints about delays.
3. **"Not now".** Validate the decision ("timing matters, and this is a good decision"). Ask for their preferred re-contact date and channel. Offer other ways to help. Then re-contact on that date with one personal message. *Basis:* Essex; Kantar.
4. **Warm hand-off.** Send one three-way message introducing the new named contact. Hand over a summary so they don't have to repeat their story. The sender confirms first contact has happened, and escalates if it hasn't within 5 working days. *Basis:* Foster with North East Year 3.
5. **Withdrawal conversation.** Thank them. Ask one reason-code question, and offer an optional chat. Name what they could do if things change, offer to keep the record (with consent), and leave the door open. *Basis:* Ipsos; Spanish review; CoramBAAF on "good" withdrawals.

### 10.4 Adoption-specific variants

- Make the adoption first contact explicitly a **safe space** (Kantar's best adoption frame). Acknowledge infertility and fear of rejection where the person raises them.
- Tie the information event and ROI rhythm to statutory clocks: information within 10 working days; ROI decision within 5 working days.
- Make Early Permanence and fostering-to-adopt visible early, since 64% of Adopt South's approved adopters wished to be considered for Early Permanence.
- Pair adopters with an adopter peer before ROI.
- For people declined at ROI, the agency should give written reasons and signpost other agencies (procedure requirement). Make this a coded `Interaction`.

## 11. Gaps and research agenda

**Missing evidence:**

- No causal evidence on any single intake interaction in fostering or adoption: timing, number of attempts, peer contact, nurture cadence, or journey guides.
- No national data on response times or enquirer experience.
- Weak data for Scotland, Northern Ireland, Ireland and New Zealand.
- No equity analysis of early closures.
- No evaluations of chatbots or AI in this domain.

**Questions OUCM could answer openly:**

1. Does a named-sender, pre-booked-slot acknowledgement raise first-conversation rates? This could be an individual-level RCT within a hub.
2. Does offering peer contact at the first call raise EOI and application rates and reduce "process not as expected" withdrawals?
3. Does a warm hand-off protocol reduce withdrawals between hub and LA? This could use a stepped-wedge design across LAs in a hub.
4. What nurture cadence brings the most "not now" enquirers back without increasing opt-outs?

**Outline of a pre-registered evaluation:**

- **Partners:** a hub or RAA, plus Foundations or a university.
- **Registration:** pre-register on OSF.
- **Design:** randomise at enquiry level, or stepped-wedge at LA level.
- **Primary outcome:** EOI or ROI within 90 days.
- **Secondary outcomes:** application within 12 months; withdrawal reason; "felt welcomed" score; opt-outs.
- **Sample size:** set from baseline rates. Foster with North East-scale volumes support only moderate effects, so pool across hubs.
- **Ethics review, DPIA and transparency notice:** no deception, and publish results whatever they show.
- **Openness:** publish the `Interaction` schema and analysis code openly.

## Caveats

- The strongest controlled evidence found no gain in approvals from a faster hub front door. Claims that speed alone gets more people to approval are not yet proven.
- Several widely quoted attrition figures (80%, 70–95%, <2%, 96%) come from 1990–2008 studies reached through Sebba's review.
- The HBR data was supplied by a co-author's vendor.
- Kantar's RCT measured intentions in a panel, not real enquiries.
- DfE's "14%" and "9 of 10 hubs" statements come from programme documents with unpublished methods.
- Some standards come from procedure manuals and may not reflect actual performance.
- Randle et al.'s "never asked" share appears as both 22% and almost one-third in secondary sources. It is reported here only as "a notable share". *(Maintainer check, 14 November 2026: the abstract of Randle, Miller, Dolnicar & Ciarrochi (2014) gives "almost one-third" of 756 Australians surveyed in 2009. The 22% figure may come from a different paper by the same team; not yet traced.)*

---

## Sources

Links were collected by the research tool in November 2026. Titles marked † are described from the link because the tool did not record the full title. Vendor pages, blogs and press are listed separately and count as observed practice or commentary, not evidence.

### Official statistics, policy and government-commissioned research (England)

- DfE (February 2026). *Renewing Fostering: homes for 10,000 more children.* [Link](https://assets.publishing.service.gov.uk/media/69826905015e2ba11991bbef/Renewing_Fostering_-_homes_for_10_000_more_children_-_February_2026_accessible.pdf)
- DfE (2026). Consultation on proposed changes to foster care, deposited in Parliament (DEP2026-0085). † [Link](https://data.parliament.uk/DepositedPapers/Files/DEP2026-0085/Foster_care_proposed_changes_handling_allegations_abuse_consultation.pdf)
- DfE (March 2026). *Fostering Recruitment and Retention Programme: end-to-end programme booklet.* [Link](https://assets.publishing.service.gov.uk/media/69c407bdb66ff902f45441d9/Fostering_Recruitment_and_Retention_Programme_end-to-end_programme_booklet.pdf)
- Ipsos and CEI for DfE (2026). *Evaluation of Foster with North East Pathfinder Hub: year 3 report.* [Link](https://assets.publishing.service.gov.uk/media/6aa8195b1a63d2d2be90460e/Evaluation_of_Foster_with_North_East_Pathfinder_Hub_year_3_report.pdf)
- Ipsos UK for DfE (July 2023). *Foster carer recruitment and conversion rates.* [Link](https://assets.publishing.service.gov.uk/media/64b155569959000013002b02/Foster_carer_recruitment_and_conversion_rates_report.pdf)
- Kantar Public for DfE (2022). *Applying behavioural insights to fostering and adoption in England.* [Link](https://assets.publishing.service.gov.uk/media/639b0743d3bf7f7f88f10fa8/Applying_behavioural_insights_to_fostering_and_adoption_in_England.pdf)
- Ofsted (November 2025). *Main findings: fostering in England 1 April 2024 to 31 March 2025.* Added by maintainer check, 14 November 2026. [Link](https://www.gov.uk/government/statistics/fostering-in-england-1-april-2024-to-31-march-2025/main-findings-fostering-in-england-1-april-2024-to-31-march-2025)
- Ofsted. *Fostering in England 1 April 2023 to 31 March 2024.* [Link](https://www.gov.uk/government/statistics/fostering-in-england-1-april-2023-to-31-march-2024/fostering-in-england-1-april-2023-to-31-march-2024)

### Adoption data and surveys

- Coram (2026). *Adoption and Special Guardianship Leadership Board: headline measures, Q3 2025–26.* † [Link](https://www.coram.org.uk/wp-content/uploads/2026/03/ASG-Q3-2025-2026-Headline-Measures-2.pdf)
- Adoption England (2026). *Annual report 2025–26.* [Link](https://www.adoptionengland.co.uk/sites/default/files/2026-07/Adoption%20England%20Annual%20report%2025-26_FINAL_0.pdf)
- Adopt South (2026). *Annual report 2025–26*, via Hampshire County Council. [Link](https://democracy.hants.gov.uk/documents/s150131/FINAL%20-%20Adopt%20South%20Annual%20Report%202025-26.pdf)
- Adoption UK (2026). *Adoption Barometer 2026: the early stages (Wales).* [Link](https://www.adoptionuk.org/adoption-barometer-2026-the-early-stages-wales)
- Adoption UK. *Adoption Barometer* report for Wales, hosted by Adopt Cymru (uploaded September 2025). † [Link](https://adoptcymru.com/app/uploads/2025/09/auk-barometerreportwales-englishfinal.pdf)
- Adoption UK. *Adoption Barometer* publications (downloads; the research tool did not record which edition each is). † [Link 1](https://www.adoptionuk.org/Handlers/Download.ashx?IDMF=ce435368-5898-4a55-b89b-36b632d995ab) · [Link 2](https://www.adoptionuk.org/Handlers/Download.ashx?IDMF=f9ad8070-de72-42c7-ad12-d47f23bdf0a4) · [Link 3](https://www.adoptionuk.org/Handlers/Download.ashx?IDMF=05a422b1-03c8-4c93-aea3-1979d01b4413) · [Link 4](https://www.adoptionuk.org/Handlers/Download.ashx?IDMF=6501ceec-87a1-4f03-ab7a-a5b2bcd62edb)

### Peer-reviewed and academic

- Madden et al. (2017). Agency-related barriers experienced by families seeking to adopt from foster care. *Adoption Quarterly*, 20(1), 25–43. [DOI](https://doi.org/10.1080/10926755.2015.1121187)
- Rodger, S., Cummings, A. & Leschied, A. (2006). Who is caring for our most vulnerable children? The motivation to foster in child welfare. *Child Abuse & Neglect*, 30(10), 1129–1142. Link added by maintainer check. [DOI](https://doi.org/10.1016/j.chiabu.2006.04.005)
- Randle, M., Miller, L., Dolnicar, S. & Ciarrochi, J. (2014). The science of attracting foster carers. *Child & Family Social Work*, 19(1), 65–75. [Link](https://www.researchgate.net/publication/259550708_The_science_of_attracting_foster_carers)
- Randle, M. et al. Heterogeneity among potential foster carers: an investigation of reasons for not foster caring. † [Link](https://www.researchgate.net/publication/223996415_Heterogeneity_Among_Potential_Foster_Carers_An_Investigation_of_Reasons_for_Not_Foster_Caring)
- Sebba, J. (2012). *Why do people become foster carers? An international literature review on the motivation to foster.* Rees Centre, University of Oxford. [Link](https://www.education.ox.ac.uk/wp-content/uploads/2019/06/Why-Do-People-Become-Foster-Carers-An-International-Literature-Review-on-the-Motivation-to-Foster.pdf)
- Geen, R., Malm, K. & Katz, J. *Listening to parents: overcoming barriers to the adoption of children from foster care.* Harvard Kennedy School working paper. [Link](https://www.hks.harvard.edu/publications/listening-parents-overcoming-barriers-adoption-children-foster-care)
- Del Valle, J. F. et al. El acogimiento en familia ajena en España: una evaluación de la práctica y sus resultados (Non-relative family foster care in Spain: practice and outcomes assessment). [Link](https://www.researchgate.net/publication/233717999_El_acogimiento_en_familia_ajena_en_Espana_Una_evaluacion_de_la_practica_y_sus_resultadosNon-relative_family_foster_care_in_Spain_Practice_and_outcomes_assessment)
- Review of recruitment (*captación*) in family foster care, published in *Zerbitzuan* (2022), via Observatorio de la Infancia. † [Link](https://www.observatoriodelainfancia.es/ficherosoia/documentos/7386_d_Revision-Captacion-Acogimiento-Familiar.pdf)
- Observatorio de la Infancia document (id 8030). † [Link](https://www.observatoriodelainfancia.es/oia/esp/descargar.aspx?id=8030&tipo=documento)
- Universidad de La Laguna. *El proceso del acogimiento familiar especializado: debilidades y potencialidades.* [Link](https://riull.ull.es/xmlui/bitstream/handle/915/3762/El%20proceso%20del%20acogimiento%20familiar%20especializado%20debilidades%20y%20potencialidades.%20.pdf?sequence=1&isAllowed=y)
- Universidad de La Laguna. *Más de un hogar: proyecto de investigación sobre el acogimiento familiar ajeno.* [Link](https://riull.ull.es/xmlui/bitstream/handle/915/16892/Mas%20de%20un%20hogar.%20Proyecto%20de%20investigacion%20sobre%20el%20acogimiento%20familiar%20ajeno.%20.pdf?sequence=1)

### Sector bodies, practice guidance and trials

- The Fostering Network and CEI (May 2023). *Foster carer retention and recruitment in England.* [Report](https://www.thefosteringnetwork.org.uk/media/cxspoevy/cei_report_foster_carer_retention_and_recruitment_may23.pdf) · [Summary](https://www.thefosteringnetwork.org.uk/media/krhneabn/retention-and-recruitment-report-24-may-2023.pdf)
- CoramBAAF. Commentary on fostering in England: morale, motivation and the wait for reform. † [Link](https://corambaaf.org.uk/updates/fostering-england-morale-motivation-and-realities-waiting-overdue-reform)
- AFA Cymru (2022). *National Fostering Framework: good practice guide, recruitment.* [Link](https://afkacymru.org.uk/wp-content/uploads/2022/07/Good-Practice-Guide-Recruitment.pdf)
- Behavioural Insights Team. *Update report 2013–2015.* [Link](https://www.bi.team/wp-content/uploads/2015/08/BIT_Update-Report-Final-2013-2015.pdf) (also [here](https://www.bi.team/wp-content/uploads/2015/07/BIT_Update-Report-Final-2013-2015.pdf))
- Behavioural Insights Team. *Update report 2015–16.* [Link](https://www.bi.team/wp-content/uploads/2016/09/BIT_Update_Report_2015-16-.pdf)
- Behavioural Insights Team. *Annual update report 2017–2018.* [Link](https://www.bi.team/wp-content/uploads/2019/01/Annual-update-report-BIT-2017-2018.pdf)
- AdoptUSKids / NRCDR. *Is your response system family friendly?* [Link](https://adoptuskids.org/_assets/files/NRCDR-org/is-your-response-system-friendly.pdf)
- AdoptUSKids. *Using customer service concepts to enhance recruitment and retention practices.* [Link](https://www.adoptuskids.org/_assets/files/using-customer-service-concepts-to-enhance-recuitment-and-retention-practices.pdf)
- AdoptUSKids. Presentation to the Oklahoma House of Representatives (Bridge Resource Support Center). † [Link](https://adoptuskids.org/_assets/files/DR-Grantees/year-one/presentation-to-oklahoma-house-of-representatives.pdf)
- Florida Department of Children and Families (2010). *Customer service and support protocols: adoption.* [Link](https://www.myflfamilies.com/sites/default/files/2023-05/CustomerServiceAndSupportProtocols-AdoptionMay2010.pdf)
- Centre for Excellence in Child and Family Welfare, Victoria (April 2024). Rapid review (digital). † [Link](https://cfecfw.org.au/app/uploads/2024/04/CFECFW_RapidReview-DigitalFinal-April2024.pdf)

### Local procedures, reports and published standards

- Essex County Council insights blog. A look at foster carer recruitment, inside and out. † [Link](https://blog.essex.gov.uk/insights-blog/look-foster-carer-recruitment-inside-and-out)
- Doncaster Children's Services procedures: recruitment, assessments and approvals of foster carers. [Link](https://doncastercs.trixonline.co.uk/chapter/recruitment-assessments-and-approvals-of-foster-carers)
- Nottinghamshire procedures: assessments and approvals of foster carers. [Link](https://nottinghamshirecs.trixonline.co.uk/chapter/assessments-and-approvals-of-foster-carers)
- Redbridge procedures: assessment and approval of foster carers. [Link](https://redbridgechildcare.proceduresonline.com/chapters/p_ass_app_fost.html)
- Derby procedures: assessment and approvals of foster carers. [Link](https://derbycsc.trixonline.co.uk/chapter/assessment-and-approvals-of-foster-carers)
- Cambridgeshire procedures: recruitment, assessment and approval of prospective adopters. [Link](https://cambridgeshirecs.trixonline.co.uk/chapter/recruitment-assessment-and-approval-of-prospective-adopters)
- Westmorland and Furness procedures: recruitment, assessment and approval of prospective adopters. [Link](https://westmorlandfurnesscs.trixonline.co.uk/chapter/recruitment-assessment-and-approval-of-prospective-adopters)
- Barnet procedures: assessment and approvals of prospective adopters. [Link](https://barnetfs.trixonline.co.uk/chapter/assessment-and-approvals-of-prospective-adopters)
- Foster Wales Bridgend. How it works. [Link](https://bridgend.fosterwales.gov.wales/how-it-works/)
- Bridgend County Borough Council. Regional fostering front door report. † [Link](https://democratic.bridgend.gov.uk/documents/s23986/10.%20Regional%20fostering%20front%20door%20report.pdf)
- National Fostering Agency Wales (February 2026). Statement of purpose. [Link](https://assets.ctfassets.net/qgpn44y3rm46/3irWQ4fPKHwda6oznCxQEy/f4112bd3184f757bd628b13873bc3782/NFA_Wales_Statement_of_Purpose_February_2026.pdf)

### Vendor pages, commentary and press (observed practice only)

- Council Advertising Network. Foster carer recruitment. [Link](https://can-digital.net/foster-carer-recruitment/)
- fostering.ai (vendor). [Link](https://fostering.ai/)
- FosterReady (vendor). Local authorities page. [Link](https://fosterready.uk/local-authorities)
- Fosterwiki. 2025 recruitment and retention impact report. [Link](https://fosterwiki.com/2025-recruitment-and-retention-impact-report/)
- CYP Now. How AI is changing the way future foster carers find agencies. [Link](https://www.cypnow.co.uk/content/comment/how-ai-is-changing-the-way-future-foster-carers-find-agencies)
- Putney News (26 December 2025). Council refuses to answer questions about AI carer tool failures. [Link](https://putney.news/2025/12/26/council-refuses-to-answer-questions-about-ai-carer-tool-failures/)
- KGW (Oregon). AI recruiting for foster care: The Contingent. [Link](https://www.kgw.com/article/news/state/ai-recruiting-foster-care-the-contingent-nonprofit-oregon/283-d8196abb-687f-4e15-ba22-28eed8f9c48c)
- Practitioner commentary (Substack) on foster carer recruitment. † [Link](https://rolfepearce.substack.com/p/foster-carer-recruitment-is-not-an)
- Secondary summaries of the HBR speed-of-response study (vendor blogs). [Autoesta](https://autoesta.com/research/speed-to-lead-statistics/) · [Outnurture](https://www.outnurture.com/blog/speed-to-lead-why-instant-response-matters)

### Cited in the text but with no link recorded yet

- Coram Institute and Adoption England (September 2026). *Every Day is Everything.*
- Oldroyd, McElheran & Elkington (2011). The short life of online sales leads. *Harvard Business Review.* (The title is as published.)
- Keogh, L. & Svensson, U. (1999), as cited by Sebba (2012). This may be the same study as Keogh et al. (1999) in the evidence library.
- Community Care's analysis of the 2024–25 enquiry figures.
