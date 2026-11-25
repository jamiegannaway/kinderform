"""Turn polite_fetch.py output into census rows for any country.

Usage (from the repository root):
    python tools/crawl_to_census.py CRAWL.jsonl FRONT_DOORS.csv [--date YYYY-MM-DD]

FRONT_DOORS.csv has one row per front door, with at least these columns:
    front_door_id, name, country, region, operator_type, service_type
and optionally register_id (the ID in a register file, to link the census form to it).
Crawl keys must start with the front_door_id ("id|website", "id|form_url|follow1"...).

For each front door whose pages (including followed links) hold an enquiry form on a
page about fostering or adoption, this writes:
- forms.csv: one primary form, observed "direct_fetch"
- questions.csv: one row per question. Radio buttons and tick boxes that share a name
  are one question, labelled by their legend. Each is tagged with a census topic by
  keyword rules (English, French, German, Spanish, Catalan and Dutch). Questions the rules cannot place are tagged
  other/unclassified for a person to tag.
- answer_options.csv: the choices offered by select boxes, radio buttons and tick boxes
- guidance.csv: whether a reply time is stated on the page, whether a privacy notice is
  linked, and how a marketing opt-in is handled, where the page shows it

Rows this tool wrote before (form IDs ending "-enquiry" and notes starting "Read by the
polite crawler") are replaced. Rows a person recorded are never touched, and a front
door that already has a person-recorded form with fields is skipped.
Standard library only.
"""

import argparse
import csv
import json
import re
import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from crawl_to_register import EMAIL, PHONE, clean_promise, stated_hours, within  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
C = ROOT / "census"
MARK = "Read by the polite crawler"

# (category, topic, pattern), first match wins. English and French; MORE below adds German, Spanish and Catalan.
RULES = [
    ("consent", "marketing", r"newsletter|subscribe|mailing list|marketing|e-?news|updates (?:by|via)|stay connected|keep in touch|stay up to date|"
                                    r"updates|opt out|products and services|infolettre|bulletin"),
    ("consent", "privacy_acknowledgement", r"privacy|confidentialit|collection notice"),
    ("consent", "terms", r"terms and conditions|terms of use"),
    ("consent", "contact", r"(?:consent|agree|happy) .*contact|permission to contact|text messages?|\bsms\b|contact me"),
    ("consent", "declaration_and_checks", r"certify|i verify|correct and complete|read and agree|acknowledge|declar"),
    ("consent", "processing", r"consent|i agree|i understand|i accept|data protection|permission to store|process my data|"
                              r"j.accepte|consens"),
    ("contact_identity", "email", r"e-?mail|courriel"),
    ("contact_identity", "date_of_birth", r"date of birth|birth ?date|birthday|\bdob\b|date de naissance"),
    ("eligibility", "age", r"\bage\b|\bâge\b|over 1[89]|over 2[15]|years old|\b(?:18|21|25) (?:years|or)"),
    ("contact_identity", "phone", r"phone|mobile|\bcell|telephone|t[ée]l[ée]phone|\bfax\b|\btel\b|contact (?:number|no)"),
    ("contact_identity", "postcode", r"post ?code|zip|postal code|code postal"),
    ("routing", "local_authority", r"\bcounty\b|council|borough|local authority|\bregion\b|\bstate\b|province|territor|municipalit|r[ée]gion"),
    ("eligibility", "citizenship", r"place of birth|born in|country of birth"),
    ("eligibility", "residency", r"(?:currently|do you) live in|reside in|live in (?:the )?state|based in|living (?:in|within)|relocate"),
    ("routing", "local_authority", r"where do you live|\brcm\b|\bmrc\b"),
    ("routing", "nearest_office", r"nearest|closest|office|branch|location"),
    ("contact_identity", "address", r"address|street|suburb|\bcity\b|\btown\b|apartment|\bapt\b|\bsuite\b|po box|^line \d|"
                                    r"^country$|adresse|ville|rue"),
    ("contact_identity", "name", r"name|^(?:first|last|middle|title|prefix|suffix)\b|surname|\bnom\b|pr[ée]nom"),
    ("source", "how_heard", r"hear about|heard about|how did you (?:find|hear)|where did you|\breferr|referred|source|social media|"
                            r"facebook|instagram|billboard|radio|\btv\b|movie|newspaper|friend|website|poster|pamphlet|handout|^hear\b|"
                            r"comment avez-vous"),
    ("contact_preference", "time", r"best time|time to (?:call|contact)|when (?:is it|can we|should we)|availability|"
                                   r"monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|noon|moment"),
    ("contact_preference", "method", r"prefer.*contact|contact method|how .*contact(?:ed)? you|be contacted|\btext\b|\bmail\b|"
                                     r"leave .*(?:message|msg)|preferred method"),
    ("contact_preference", "language", r"language|langue|interpreter"),
    ("information_event", "event_dates", r"information (?:session|evening|event)|info session|webinar|event|s[ée]ance"),
    ("prior_involvement", "social_services", r"children.s aid|involved with|involvement with|social services|child protection"),
    ("experience", "own_children", r"children of your own|had children|have children"),
    ("transfer", "current_carer", r"transfer|another agency|currently (?:a )?(?:approved|registered|licensed|foster)"),
    ("experience", "prior_fostering", r"(?:previous|prior|before|ever).*(?:foster|adopt)|(?:foster|adopt)ed before|licensed|"
                                      r"home ?study|assessment"),
    ("experience", "childcare_experience", r"experience|worked with children|childcare"),
    ("interest", "child_preferences", r"age of (?:the )?child|ages? range|sibling|children you (?:could|would|can)|special needs|"
                                     r"youth|adolescen|teen|infant|toddler|their ages"),
    ("household", "children_in_household", r"children (?:in|at|living)|own children|your children|^children\b|kids|vos enfants|enfants"),
    ("household", "partner", r"partner|spouse|husband|wife|conjoint"),
    ("household", "applicant_type", r"single|couple|applying (?:as|alone|with)|joint applic|second applicant"),
    ("household", "relationships", r"marital|married|relationship status|in a relationship|[ée]tat civil"),
    ("household", "household_composition", r"household|live with you|people (?:in|living)|occupants|who lives|other adults?|"
                                            r"summary of your family|about your family|"
                                            r"family unit|child (?:one|two|three|four)|lives with"),
    ("household", "pets", r"\bpets?\b|\bdogs?\b|animal"),
    ("housing", "spare_bedroom", r"bedroom|spare room|chambre"),
    ("housing", "tenure", r"\brent\b|\brenting\b|own your home|homeowner|tenure|mortgage|propri[ée]taire|locataire"),
    ("housing", "smoking", r"smok|vap"),
    ("work", "income", r"income|salary|financ|revenu"),
    ("work", "driving_licence", r"driv|licen[cs]e to drive|vehicle|\bcar\b"),
    ("work", "employment_history", r"education|school|degree"),
    ("work", "occupation", r"occupation|job title|profession"),
    ("work", "employment_status", r"employ|\bwork|emploi"),
    ("equality", "ethnicity", r"ethnic|\brace\b|aboriginal|torres strait|indigenous|first nations|m[ée]tis|inuit|cultural|origin|"
                              r"autochtone|\basian\b|\bwhite\b|hispanic|latino|\bblack\b|caucasian|pacific islander|native american"),
    ("equality", "gender", r"gender|\bsex\b|pronoun|\bgenre\b"),
    ("equality", "religion", r"relig|faith"),
    ("health", "disability", r"disab|handicap"),
    ("health", "health", r"health|medical|sant[ée]"),
    ("criminal_record", "criminal_record", r"criminal|convict|offen[cs]e|police check|record check|ant[ée]c[ée]dents"),
    ("eligibility", "citizenship", r"citizen|citoyen"),
    ("eligibility", "residency", r"residen|visa|immigration|permanent"),
    ("prior_involvement", "social_services", r"social services|child protection|\bcps\b|involvement with"),
    ("intent", "journey_stage", r"how long have you been|thinking about|considering"),
    # "Why do you want to foster?" names the care, but asks for motivation. It must come before care_type.
    ("free_text", "motivation", r"^\W*(?:why|pourquoi)\b(?!.*contact)|what (?:made|makes|motivat)|motivat"),
    ("interest", "care_type", r"foster|adopt|respite|kinship|emergency|short.?term|long.?term|type of care|type of service|"
                              r"^service$|interest|program|"
                              r"treatment|famille d.accueil|accueil"),
    ("intent", "journey_stage", r"how soon|ready to|stage|timeline|when (?:would|do) you (?:like|want) to start|next step|subject|applies to you|"
                                r"topic|reason|need help|help you with|how can we help|why are you contacting|how involved"),
    ("free_text", "motivation", r"\bwhy\b|motivat|pourquoi"),
    ("free_text", "about_you", r"about (?:you|yourself)|tell us"),
    ("free_text", "questions", r"message|comment|question|anything else|additional|enquiry|inquiry|details|like us to know|"
                               r"specifics|notes|demande|pr[ée]cis"),
]
# German, Spanish and Catalan words for the same topics. Each is added to the first rule for its topic,
# so the order above still decides which topic wins.
MORE = {
    ("consent", "marketing"): r"werbung|infopost|bolet[ií]n|comercial|publicidad|butllet",
    ("consent", "privacy_acknowledgement"): r"datenschutzerkl|datenschutzhinweis|pol[ií]tica|privacidad|privacitat|"
                                            r"pris connaissance|politique (?:du site|de confidentialit)",
    ("consent", "declaration_and_checks"): r"best[äa]tige|versichere|wahrheitsgem|declaro|certifico",
    ("consent", "processing"): r"einwillig|einverstanden|ich stimme|zustimm|datenschutz|acepto|consiento|autorizo|"
                               r"consentimiento|protecci[oó]n de datos|accepto|consento",
    ("contact_identity", "email"): r"correo|correu",
    ("contact_identity", "date_of_birth"): r"geburtsdatum|geburtstag|geboren am|fecha de nacimiento|data de naixement",
    ("eligibility", "age"): r"\balter\b|\bedad\b(?! de(?:l| los| las) (?:menor|niñ|hij))|\bedat\b",
    ("contact_identity", "phone"): r"telefon|handy|\bmobil|rufnummer|tel[eé]fono|m[oó]vil|celular|tel[eè]fon|m[oò]bil",
    ("contact_identity", "postcode"): r"\bplz\b|postleitzahl|c[oó]digo postal|codi postal",
    ("routing", "nearest_office"): r"amb qui|con qui[eé]n|mit wem",
    ("routing", "local_authority"): r"landkreis|bezirk|bundesland|jugendamt|provincia|municipio|comunidad aut[oó]noma|"
                                    r"\bisla\b|comarca|municipi|d[ée]partement",
    ("eligibility", "residency"): r"wohnhaft|\bresidencia\b|\bresido\b",
    ("contact_identity", "address"): r"anschrift|stra(?:ß|ss)e|hausnummer|\bort\b|wohnort|\bstadt\b|direcci[oó]n|"
                                     r"domicilio|\bcalle\b|localidad|poblaci[oó]n|ciudad|adreça|carrer|\bcommune\b|localitat|"
                                     r"^pays\b|^land\b|^pa[ií]s\b",
    ("contact_identity", "name"): r"apellido|nombre|cognom|anrede|civilit[ée]",
    ("source", "how_heard"): r"aufmerksam|wie haben sie|erfahren sie|c[oó]mo (?:nos )?(?:ha|has) conocido|"
                             r"c[oó]mo (?:se|te) enter|com (?:ens )?(?:ha|has) conegut",
    ("contact_preference", "time"): r"erreichbar|uhrzeit|vormittag|nachmittag|abends|montag|dienstag|mittwoch|donnerstag|"
                                    r"freitag|horario|ma[ñn]ana|\btarde\b|lunes|martes|mi[ée]rcoles|jueves|viernes|"
                                    r"disponibilidad|horari|\bmat[ií]\b|\bheure\b|\bhora\b",
    ("contact_preference", "method"): r"kontaktaufnahme|wie (?:m[öo]chten|sollen) wir|bevorzugt|c[oó]mo prefiere|"
                                      r"medio de contacto|forma de contacto|v[ií]a de contacto",
    ("contact_preference", "language"): r"sprache|idioma|llengua",
    ("information_event", "event_dates"): r"infoabend|informationsabend|infoveranstaltung|veranstaltung|\btermin|r[ée]union|"
                                          r"sesi[oó]n informativa|sessi[oó] informativa|charla|jornada",
    ("experience", "own_children"): r"eigene kinder|leibliche kinder|hijos propios|tiene hijos|fills propis",
    ("experience", "prior_fostering"): r"bereits pflege|schon einmal|ha sido familia|anteriormente",
    ("experience", "childcare_experience"): r"erfahrung|experiencia|experi[eè]ncia",
    ("interest", "child_preferences"): r"alter des kindes|geschwister|edad del menor|edad de los ni|hermanos|germans",
    ("household", "children_in_household"): r"\bkinder\b|\bhijos\b|ni[ñn]os|menores|\bfills\b|infants",
    ("household", "partner"): r"ehepartner|lebenspartner|ehefrau|ehemann|pareja|c[oó]nyuge|esposo|esposa|parella",
    ("household", "applicant_type"): r"alleinstehend|alleinerziehend|\bpaar\b|monoparental|en pareja|soltero",
    ("household", "relationships"): r"situation (?:familiale|matrimoniale)|familienstand|verheiratet|ledig|estado civil|casad[oa]|estat civil",
    ("household", "household_composition"): r"haushalt|wer lebt|unidad familiar|convivientes|personas que viven|"
                                             r"n[uú]cleo familiar|unitat familiar|convivents",
    ("household", "pets"): r"haustier|\btiere\b|\bhund|katze|mascota|\bperro|\bgato\b",
    ("housing", "spare_bedroom"): r"zimmer|wohnraum|habitaci[oó]n|dormitorio",
    ("housing", "tenure"): r"\bmiete\b|eigentum|alquiler|en propiedad|lloguer",
    ("housing", "smoking"): r"rauch|fumador|fumar|fumeu",
    ("work", "income"): r"einkommen|gehalt|ingresos|salario|econ[oó]mic|ingressos",
    ("work", "driving_licence"): r"f[üu]hrerschein|fahrzeug|\bauto\b|carn[eé] de conducir|permiso de conducir|veh[ií]culo|"
                                 r"coche|carnet de conduir|cotxe",
    ("work", "employment_history"): r"ausbildung|schulabschluss|bildung|estudios|nivel educativo|estudis",
    ("work", "occupation"): r"\bberuf\b|t[äa]tigkeit|profesi[oó]n|ocupaci[oó]n|professi[oó]",
    ("work", "employment_status"): r"berufst[äa]tig|arbeit|erwerbs|trabaj|situaci[oó]n laboral|empleo|treball",
    ("equality", "ethnicity"): r"herkunft|etnia|origen",
    ("equality", "gender"): r"geschlecht|\bsexo\b|g[ée]nero|\bsexe\b|g[eè]nere",
    ("equality", "religion"): r"konfession|glaube",
    ("health", "disability"): r"behinderung|discapacidad|discapacitat",
    ("health", "health"): r"gesundheit|\bsalud\b|\bsalut\b",
    ("criminal_record", "criminal_record"): r"f[üu]hrungszeugnis|vorstraf|antecedentes|delitos|antecedents",
    ("eligibility", "citizenship"): r"staatsangeh[öo]rigkeit|nationalit[äa]t|nacionalidad|nacionalitat",
    ("intent", "journey_stage"): r"wie lange|[üu]berlegen|wann m[öo]chten|cu[aá]ndo|desde cu[aá]ndo|th[ée]matique|\bsujet\b|"
                                 r"\bobjet\b|\bbetreff\b|\basunto\b|\bassumpte\b",
    ("interest", "care_type"): r"pflege|bereitschaft|vollzeit|kurzzeit|verwandt|acogi|urgencia|temporal|permanente|"
                               r"adopci|acolli|assistant(?:e)? familia",
    ("free_text", "motivation"): r"warum|por qu[eé]|motivaci[oó]n|per qu[eè]",
    ("free_text", "about_you"): r"[üu]ber sich|erz[äa]hlen sie|sobre (?:usted|ti)|cu[ée]ntenos",
    ("free_text", "questions"): r"nachricht|anmerkung|\bfrage|anliegen|mitteilung|bemerkung|sonstiges|mensaje|comentario|"
                                r"consulta|pregunta|observaciones|missatge|comentari|observacions",
}
# Dutch words for the same topics, added the same way.
DUTCH = {
    ("consent", "marketing"): r"nieuwsbrief",
    ("consent", "privacy_acknowledgement"): r"privacyverklaring|privacybeleid|privacyreglement",
    ("consent", "declaration_and_checks"): r"naar waarheid|ik verklaar",
    ("consent", "processing"): r"toestemming|ik ga akkoord|\bakkoord\b|verwerking van (?:mijn )?gegevens",
    ("contact_identity", "date_of_birth"): r"geboortedatum|geboren op",
    ("eligibility", "age"): r"leeftijd(?! van (?:het|de) kind)",
    ("contact_identity", "phone"): r"telefoon|\bmobiel",
    ("routing", "local_authority"): r"gemeente|provincie|\bregio\b",
    ("contact_identity", "address"): r"\badres|straat|huisnummer|woonplaats|\bplaats\b",
    ("contact_identity", "name"): r"\bnaam\b|voornaam|achternaam|tussenvoegsel|voorletters|aanhef|roepnaam",
    ("source", "how_heard"): r"hoe (?:bent|heeft|ben|heb) (?:u|je|jij)|via welke weg|waar heeft u",
    ("contact_preference", "time"): r"bereikbaar|ochtend|\bmiddag|\bavond\b|maandag|dinsdag|woensdag|donderdag|vrijdag",
    ("contact_preference", "method"): r"hoe wilt u|hoe wil je|contactvoorkeur|voorkeur voor contact",
    ("contact_preference", "language"): r"\btaal\b|voertaal",
    ("information_event", "event_dates"): r"informatieavond|voorlichtingsavond|informatiebijeenkomst|bijeenkomst|infoavond",
    ("experience", "own_children"): r"eigen kinderen",
    ("experience", "prior_fostering"): r"eerder pleeg|al eerder|ooit pleeg",
    ("experience", "childcare_experience"): r"ervaring",
    ("interest", "child_preferences"): r"leeftijd van (?:het|de) kind|broertjes|zusjes|broers en zussen",
    ("household", "children_in_household"): r"\bkinderen\b|thuiswonende",
    ("household", "partner"): r"echtgeno",
    ("household", "applicant_type"): r"alleenstaand|\bstel\b",
    ("household", "relationships"): r"burgerlijke staat|getrouwd|gehuwd|samenwonend",
    ("household", "household_composition"): r"huishouden|gezinssamenstelling|inwonend|gezinsleden|wie woont",
    ("household", "pets"): r"huisdier|\bhond|\bkat\b|\bkatten\b",
    ("housing", "spare_bedroom"): r"slaapkamer|\bkamer\b",
    ("housing", "tenure"): r"huurwoning|koopwoning|\bhuur\b|eigen woning",
    ("housing", "smoking"): r"\brook|\broken\b",
    ("work", "income"): r"inkomen",
    ("work", "driving_licence"): r"rijbewijs",
    ("work", "employment_history"): r"opleiding",
    ("work", "occupation"): r"\bberoep",
    ("work", "employment_status"): r"\bwerk|\bbaan\b|werkzaam",
    ("equality", "gender"): r"geslacht",
    ("equality", "religion"): r"geloof|levensovertuiging",
    ("health", "disability"): r"beperking",
    ("health", "health"): r"gezondheid",
    ("criminal_record", "criminal_record"): r"\bvog\b|verklaring omtrent|strafblad|\bvgb\b",
    ("eligibility", "citizenship"): r"nationaliteit",
    ("intent", "journey_stage"): r"\bonderwerp\b",
    ("interest", "care_type"): r"pleeg|crisisopvang|deeltijd|voltijd|gezinshuis|logeer",
    ("free_text", "motivation"): r"waarom|motivatie",
    ("free_text", "about_you"): r"over (?:uzelf|jezelf)|vertel (?:ons|iets)",
    ("free_text", "questions"): r"bericht|opmerking|\bvra(?:a)?g|toelichting",
}
for _key, _words in DUTCH.items():
    MORE[_key] = MORE[_key] + "|" + _words if _key in MORE else _words
_seen = set()
_rules = []
for c, t, p in RULES:
    if (c, t) not in _seen and (c, t) in MORE:
        p = p + "|" + MORE[(c, t)]
    _seen.add((c, t))
    _rules.append((c, t, re.compile(p, re.I)))
RULES = _rules

JUNK = re.compile(
    r"^(?:item meta|fields?|input|wpforms|ninja|gform|nf|tfa|formid|track id|accepted by|search|recherche)\b|\bvalue$|"
    r"^\d+$|^[^A-Za-zÀ-ÿ]*$|if you are human|leave this field (?:blank|empty)|honeypot|hidden|[0-9a-f]{12,}|"
    r"captcha|recaptcha|not a robot|g-recaptcha|ak[ _]?hp|wpcf7|empty\d|characters shown|code (?:above|is in the image|in the image)|prevent spam|"
    r"form handle|form fields field|^(?:website|url|x/twitter|twitter|linkedin|to)$|^[a-z0-9]{10,}$|utm_|gclid|msclkid|"
    r"[gw]braid|fbclid|referr?er|entry ?page|page ?url|form ?type|nelio|sendmail|^project$|^fuction$|quiz|^ad |"
    r"feedback|was this page helpful|leer lassen|laisser (?:ce champ )?vide|dejar (?:en )?blanco|deixa(?:r|u) en blanc|"
    r"leeg laten|niet invullen", re.I)
PLACEHOLDER = re.compile(r"^(?:-+|please (?:select|choose)|select|choose|choisir|s[ée]lectionner|--.*|"
                         r"bitte (?:w[äa]hlen|ausw[äa]hlen)|ausw[äa]hlen|seleccion[ae]|elija|escoja|tria|"
                         r"maak een keuze|selecteer|kies)\b", re.I)
NOT_ENQUIRY = re.compile(r"donat|volunteer|event registration|job|resume|career|password|log ?in|sign ?in|"
                         r"upload|type your signature|newsletter only|search|access record|subject access|records request|"
                         r"spende|ehrenamt|stellenangebot|karriere|donaci|donativo|voluntari|empleo|trabaja con nosotros|"
                         r"ofertas de trabajo|affiche|votre [ée]v[ée]nement|proposer un [ée]v[ée]nement|"
                         r"vacature|werken bij|doneer|donatie", re.I)
# A page whose address names an application holds the full application, not a first-contact form.
# The census covers first contact only; application forms belong in register/us/application-forms.csv.
APPLICATION_PAGE = re.compile(r"application|how-to-apply|apply-now|/apply/?$", re.I)
NOT_APPLICATION = re.compile(r"process|enquir|inquir", re.I)  # "the application process" pages often carry an enquiry form
# Fields only a full application asks for: bank details, debts, place of birth, the applicant's signature line.
APPLICATION_FIELDS = re.compile(r"\biban\b|bank account|sort code|schulden|kontoinhaber|geburtsort|antragsteller|"
                                r"place of birth|lieu de naissance|lugar de nacimiento|\bdebts?\b|geboorteplaats|"
                                r"burgerservicenummer|\bbsn\b", re.I)
# Pages about childminding or elderly care, which share words with fostering in German and French.
NOT_TOPIC = re.compile(r"kindertagespflege|tagesmutter|tagesv[äa]ter|altenpflege|seniorenpflege|"
                       r"assistant(?:e)?s? maternel|gastouder|kinderopvang", re.I)
# Words that show a page or form is about fostering or adoption. Bare "accueil" (French for the home
# page) and bare "pflege" (also childminding and elderly care) are too broad, so only longer forms count.
TOPIC_PAGE = re.compile(r"foster|adopt|carer|famille d.accueil|famille d.adoption|accueil familial|out-of-home care|kinship|"
                        r"assistant(?:e)?s? familia|pflegefamilie|pflegeeltern|pflegekind|pflegestelle|vollzeitpflege|"
                        r"bereitschaftspflege|pflegeverh[äa]ltnis|adopci|acogi|acolli|pleegzorg|pleegouder|pleegkind|"
                        r"pleeggezin|pleegfamilie|gezinshuis|caregiv|whānau care|whanau care", re.I)
INPUT = {"text": "text", "email": "email", "tel": "tel", "textarea": "textarea", "select": "select",
         "radio": "radio", "checkbox": "checkbox", "date": "date", "number": "text", "url": "text"}


def plain(text):
    text = re.sub(r"\((?:required|requis|obligatoire)\)|\*", "", str(text), flags=re.I)
    return " ".join(text.split()).strip(" *:")


def label_of(field):
    for key in ("label", "aria_label", "placeholder"):
        text = plain(field.get(key, ""))
        if text and not JUNK.search(text):
            return text
    name = re.sub(r"[_\-\[\]\.]+", " ", field.get("name", ""))
    name = plain(re.sub(r"(?<=[a-z])(?=[A-Z])", " ", name))
    return "" if not name or JUNK.search(name) or re.fullmatch(r"[a-z]{1,2} ?\d*", name, re.I) else name


def shorten(text, limit=110):
    text = plain(text)
    if len(text) <= limit:
        return text
    cut = re.split(r"(?<=[.?!])\s", text)[0]
    if len(cut) <= limit:
        return cut
    return text[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def topic_of(text):
    for category, topic, pattern in RULES:
        if pattern.search(text):
            return category, topic
    return "other", "unclassified"


def questions_of(form):
    """Yield dicts: label, topic text, input_type, required, options, checked (for single tick boxes)."""
    groups, order = {}, []
    for field in form["fields"]:
        kind = field["type"]
        if kind in ("radio", "checkbox") and field.get("name"):
            key = ("group", field["name"])
            if key not in groups:
                groups[key] = {"field": field, "options": [], "checked": False}
                order.append(key)
            option = plain(field.get("label", ""))
            if option and not JUNK.search(option):
                groups[key]["options"].append(option[:60])
            groups[key]["checked"] |= bool(field.get("checked"))
        else:
            key = ("field", id(field))
            groups[key] = {"field": field, "options": [], "checked": False}
            order.append(key)
    items = list(_items(groups, order))
    # Single tick boxes in a run (three or more, or two short ones) are one multiple-choice question.
    merged, run = [], []
    for item in items + [None]:
        if item is not None and item["input_type"] == "checkbox" and not item["options"] and len(item["label"]) <= 40:
            run.append(item)
            continue
        if len(run) >= 3 or (len(run) == 2 and all(len(r["label"]) <= 25 for r in run)):
            labels = [r["label"] for r in run]
            merged.append({"label": "Choice of: " + ", ".join(labels), "text": " ".join(labels), "input_type": "checkbox",
                           "required": any(r["required"] for r in run), "options": labels, "checked": False})
        else:
            merged.extend(run)
        run = []
        if item is not None:
            merged.append(item)
    yield from merged


def _items(groups, order):
    for key in order:
        g = groups[key]
        field = g["field"]
        kind = INPUT.get(field["type"], "unknown")
        if key[0] == "group":
            options = g["options"]
            legend = plain(field.get("legend", ""))
            if len(options) <= 1:
                label = options[0] if options else (legend or label_of(field))
                options = []
            else:
                name = label_of({"name": field.get("name", "")})
                label = legend or plain(field.get("near_text", "")) or name or "Choice"
                if label in options:
                    label = name or "Choice"
            if not label or JUNK.search(label):
                continue
            yield {"label": label, "text": label + " " + " ".join(options), "input_type": kind,
                   "required": field.get("required"), "options": options, "checked": g["checked"]}
        else:
            label = label_of(field)
            if not label:
                continue
            options = [o for o in field.get("options", []) if not PLACEHOLDER.search(o)]
            yield {"label": label, "text": label + " " + field.get("name", ""), "input_type": kind,
                   "required": field.get("required"), "options": options, "checked": False}


def form_text(form):
    """The form's own words: labels, field names and choices."""
    return " ".join(label_of(f) + " " + f.get("name", "") + " " + " ".join(f.get("options", []))
                    for f in form.get("fields", []))


def is_enquiry(form, page_text):
    """page_text is the page's title and address. The topic must show there or in the form itself,
    not just in a menu, so a council's general contact form counts only if it mentions fostering
    or adoption."""
    fields = form.get("fields", [])
    labels = " ".join((label_of(f) + " " + f.get("name", "") + " " + f.get("type", "")).lower() for f in fields)
    if len(fields) < 3 or NOT_ENQUIRY.search(labels):
        return False
    if not re.search(r"name|\bnom\b|pr[ée]nom|nombre|apellido|cognom", labels) or \
            not re.search(r"e-?mail|courriel|correo|correu|phone|t[ée]l|telefon|m[oó]vil|handy", labels):
        return False
    if NOT_TOPIC.search(page_text) or len(APPLICATION_FIELDS.findall(form_text(form))) >= 2:
        return False
    return bool(TOPIC_PAGE.search(page_text) or TOPIC_PAGE.search(form_text(form)))


def reply_value(sentence):
    """The promise as English words, for example "2 working days", whatever language the page uses."""
    w = within(sentence)
    if not w:
        return ""
    n, unit, working = w
    unit = unit[:-1] if n == 1 else unit
    return f"{n} {'working ' if working else ''}{unit}"


def load(name):
    with open(C / name, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return reader.fieldnames, list(reader)


def write(name, header, rows):
    with open(C / name, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=header, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("crawl")
    ap.add_argument("front_doors")
    ap.add_argument("--date", default="")
    args = ap.parse_args()

    doors = list(csv.DictReader(open(args.front_doors, encoding="utf-8", newline="")))
    records = {}
    for line in open(args.crawl, encoding="utf-8"):
        r = json.loads(line)
        records.setdefault(r["key"].split("|")[0], []).append(r)

    fh, forms = load("forms.csv")
    qh, questions = load("questions.csv")
    oh, options = load("answer_options.csv")
    gh, guidance = load("guidance.csv")
    taxonomy = {(r["category"], r["topic"]) for r in load("taxonomy.csv")[1]}

    # Person-recorded forms with fields: keep, and skip their front doors and URLs.
    human = [f for f in forms if not f["notes"].startswith(MARK)]
    human_doors = {f["front_door_id"] for f in human if f["front_door_id"] and f["fields_observed"] != "no"}
    human_urls = {f["form_url"].rstrip("/") for f in human if f["form_url"] and f["fields_observed"] != "no"}
    site = lambda u: urllib.parse.urlsplit(u).netloc.lower().removeprefix("www.")
    human_sites = {site(u) for f in human if f["fields_observed"] != "no" for u in (f["form_url"], f["source_url"]) if u}

    new_ids, new_urls = set(), set()
    new_forms, new_q, new_o, new_g = [], [], [], []
    for door in doors:
        recs = records.get(door["front_door_id"], [])
        register_id = door.get("register_id", "")
        if register_id in human_doors:
            continue
        best, best_rec = None, None
        for r in recs:
            if r.get("status") != 200:
                continue
            path = urllib.parse.urlsplit(r.get("final_url") or r["url"]).path
            if APPLICATION_PAGE.search(path) and not NOT_APPLICATION.search(path):
                print("left out, an application page:", door["front_door_id"], r.get("final_url") or r["url"])
                continue
            page = " ".join([r.get("title", "") or "", r["url"], r.get("final_url", "") or ""])
            for f in r.get("forms", []):
                if is_enquiry(f, page) and (best is None or len(f["fields"]) > len(best["fields"])):
                    best, best_rec = f, r
        if best is None:
            continue
        url = best_rec.get("final_url") or best_rec["url"]
        if url.rstrip("/") in human_urls or site(url) in human_sites or not url.startswith("https://"):
            continue
        form_id = re.sub(r"[^a-z0-9-]+", "-", door["front_door_id"].lower()).strip("-") + "-enquiry"
        # One row per form: a council's fostering and adoption pages often lead to the same form.
        if form_id in new_ids or url.rstrip("/") in new_urls:
            continue
        new_ids.add(form_id)
        new_urls.add(url.rstrip("/"))
        date = args.date or best_rec.get("fetched_at", "")
        text = (best_rec.get("text", "") or "").lower()
        platform = next((p for p in ("binti", "hubspot", "jotform", "formstack", "gravity", "wpforms", "salesforce",
                                     "microsoft forms", "typeform", "cognito") if p in text or p in url.lower()), "")
        new_forms.append({
            "form_id": form_id, "front_door_id": register_id, "name": door["name"],
            "operator_type": door["operator_type"], "service_type": door["service_type"], "country": door["country"],
            "region": door["region"], "form_stage": "primary", "access_route": "online_form", "form_url": url,
            "platform": platform, "template_group": "", "fields_observed": "yes", "observed": "direct_fetch",
            "date_checked": date, "source_url": url,
            "notes": f"{MARK}: labels and choices from the page; required only where the page marks it; "
                     "topics tagged by keyword rules. Not yet checked by a person.",
        })
        n, seen = 0, set()
        marketing = None
        for q in questions_of(best):
            label = shorten(q["label"])
            if label.lower() in seen or EMAIL.search(label) or PHONE.search(label):
                continue
            seen.add(label.lower())
            category, topic = topic_of(q["text"])
            if (category, topic) not in taxonomy:
                category, topic = "other", "unclassified"
            n += 1
            qid = f"{form_id}:q{n:02d}"
            new_q.append({
                "question_id": qid, "form_id": form_id, "order": str(n), "section": "", "label_paraphrased": label,
                "category": category, "topic": topic, "required": "yes" if q["required"] else "unknown",
                "input_type": q["input_type"], "type_inferred": "no", "conditional_on": "", "hint_paraphrased": "",
                "observed": "direct_fetch", "date_checked": date,
            })
            for k, option in enumerate(q["options"][:20], start=1):
                if EMAIL.search(option) or PHONE.search(option):
                    continue
                new_o.append({"option_id": f"{qid}:o{k:02d}", "question_id": qid, "order": str(k),
                              "option_label": option, "option_guidance": ""})
            if (category, topic) == ("consent", "marketing"):
                if q["required"]:
                    marketing = "required_checkbox_ambiguous" if q["input_type"] == "checkbox" else "required_choice"
                elif q["checked"]:
                    marketing = "pre_ticked"
                else:
                    marketing = "separate_unticked"
        g = 0

        def add(kind, present, summary, value=""):
            nonlocal g
            g += 1
            new_g.append({"guidance_id": f"{form_id}:g{g:02d}", "form_id": form_id, "guidance_type": kind,
                          "present": present, "summary_paraphrased": summary, "value": value, "source_url": url,
                          "observed": "direct_fetch", "date_checked": date})

        promise = ""
        for r in [best_rec] + [x for x in recs if x is not best_rec and x.get("status") == 200]:
            for raw in r.get("promises", []):
                sentence = clean_promise(raw)
                if sentence and not EMAIL.search(sentence) and not PHONE.search(sentence):
                    promise = sentence
                    break
            if promise:
                break
        if promise and reply_value(promise):
            add("response_time", "yes", f"Says it will make contact within {reply_value(promise)}.", reply_value(promise))
        else:
            add("response_time", "no", "No reply time found on the form page or the front-door page.")
        links = " ".join(f"{h} {t}" for h, t in best_rec.get("links", [])).lower()
        privacy = bool(re.search(r"privacy|confidentialit|collection notice", links))
        add("privacy_notice_link", "yes" if privacy else "no",
            "Links to a privacy notice." if privacy else "No privacy notice link found on the form page.")
        if marketing:
            add("marketing_consent", "yes", "The form has a newsletter or marketing opt-in.", marketing)
        else:
            add("marketing_consent", "no", "No newsletter or marketing opt-in found on the form.", "none")

    # Replace only this run's crawler rows, so one country's run leaves the others alone.
    run_ids = {re.sub(r"[^a-z0-9-]+", "-", d["front_door_id"].lower()).strip("-") + "-enquiry" for d in doors}
    old_crawler = {f["form_id"] for f in forms if f["notes"].startswith(MARK) and f["form_id"] in run_ids}
    forms = [f for f in forms if f["form_id"] not in old_crawler | new_ids] + new_forms
    questions = [q for q in questions if q["form_id"] not in old_crawler | new_ids] + new_q
    kept_q = {q["question_id"] for q in questions}
    options = [o for o in options if o["question_id"] in kept_q and o not in new_o] + new_o
    options = list({o["option_id"]: o for o in options}.values())
    guidance = [x for x in guidance if x["form_id"] not in old_crawler | new_ids] + new_g
    write("forms.csv", fh, forms)
    write("questions.csv", qh, questions)
    write("answer_options.csv", oh, options)
    write("guidance.csv", gh, guidance)
    print(f"forms: {len(new_forms)}, questions: {len(new_q)}, options: {len(new_o)}, guidance: {len(new_g)}")
    unclassified = sum(q["topic"] == "unclassified" for q in new_q)
    print(f"unclassified questions: {unclassified} of {len(new_q)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
