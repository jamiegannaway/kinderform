"""Check the front-door registers for Canada, Australia, Germany, France and Spain
(register/ca, register/au, register/de, register/fr, register/es).

Same rules as the US register: allowed values, sources, dates, unique IDs, and no
phone numbers or email addresses. Standard library only.

Run from the repository root:  python tests/validate_world_register.py
"""

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

HEADER = ["front_door_id", "name", "region", "operator_type", "service_type", "coverage", "website", "form_url",
          "first_step", "stated_response_time", "form_fields_observed", "source_url", "date_checked",
          "evidence_level", "verification", "notes"]

COUNTRIES = {
    "ca": {"Ontario": "on", "Quebec": "qc", "British Columbia": "bc", "Alberta": "ab", "Manitoba": "mb",
           "Saskatchewan": "sk", "Nova Scotia": "ns", "New Brunswick": "nb", "Newfoundland and Labrador": "nl",
           "Prince Edward Island": "pe", "Yukon": "yt", "Northwest Territories": "nt", "Nunavut": "nu",
           "Canada": "ca"},
    "au": {"New South Wales": "nsw", "Victoria": "vic", "Queensland": "qld", "Western Australia": "wa",
           "South Australia": "sa", "Tasmania": "tas", "Australian Capital Territory": "act",
           "Northern Territory": "nt", "Australia": "au"},
    # Germany: the 16 Länder, in English.
    "de": {"Baden-Württemberg": "bw", "Bavaria": "by", "Berlin": "be", "Brandenburg": "bb", "Bremen": "hb",
           "Hamburg": "hh", "Hesse": "he", "Mecklenburg-Western Pomerania": "mv", "Lower Saxony": "ni",
           "North Rhine-Westphalia": "nw", "Rhineland-Palatinate": "rp", "Saarland": "sl", "Saxony": "sn",
           "Saxony-Anhalt": "st", "Schleswig-Holstein": "sh", "Thuringia": "th", "Germany": "de"},
    # France: the 18 regions. Each département's service is one row, named in coverage.
    "fr": {"Auvergne-Rhône-Alpes": "ara", "Bourgogne-Franche-Comté": "bfc", "Brittany": "bre",
           "Centre-Val de Loire": "cvl", "Corsica": "cor", "Grand Est": "ges", "Hauts-de-France": "hdf",
           "Île-de-France": "idf", "Normandy": "nor", "Nouvelle-Aquitaine": "naq", "Occitanie": "occ",
           "Pays de la Loire": "pdl", "Provence-Alpes-Côte d'Azur": "pac", "Guadeloupe": "gp", "Martinique": "mq",
           "French Guiana": "gf", "Réunion": "re", "Mayotte": "yt", "France": "fr"},
    # Spain: the 17 autonomous communities and the 2 autonomous cities, in English.
    "es": {"Andalusia": "an", "Aragon": "ar", "Asturias": "as", "Balearic Islands": "ib", "Basque Country": "pv",
           "Canary Islands": "cn", "Cantabria": "cb", "Castile and León": "cl", "Castilla-La Mancha": "cm",
           "Catalonia": "ct", "Extremadura": "ex", "Galicia": "ga", "La Rioja": "ri", "Madrid": "md", "Murcia": "mc",
           "Navarre": "nc", "Valencian Community": "vc", "Ceuta": "ce", "Melilla": "ml", "Spain": "es"},
    # Ireland: the four provinces (Ulster means its three counties in the Republic).
    "ie": {"Connacht": "c", "Leinster": "l", "Munster": "m", "Ulster": "u", "Ireland": "ie"},
    # The Netherlands: the 12 provinces, in English.
    "nl": {"Drenthe": "dr", "Flevoland": "fl", "Friesland": "fr", "Gelderland": "ge", "Groningen": "gr",
           "Limburg": "li", "North Brabant": "nb", "North Holland": "nh", "Overijssel": "ov", "Utrecht": "ut",
           "Zeeland": "ze", "South Holland": "zh", "Netherlands": "nl"},
    # New Zealand: the 16 regions.
    "nz": {"Northland": "ntl", "Auckland": "auk", "Waikato": "wko", "Bay of Plenty": "bop", "Gisborne": "gis",
           "Hawke's Bay": "hkb", "Taranaki": "tki", "Manawatū-Whanganui": "mwt", "Wellington": "wgn",
           "Tasman": "tas", "Nelson": "nsn", "Marlborough": "mbh", "West Coast": "wtc", "Canterbury": "can",
           "Otago": "ota", "Southland": "stl", "New Zealand": "nz"},
    # Singapore: one city-state.
    "sg": {"Singapore": "sg"},
    # Denmark: the 5 regions, in English. Municipalities sit in their region.
    "dk": {"Capital Region of Denmark": "h", "Region Zealand": "s", "Region of Southern Denmark": "sd",
           "Central Denmark Region": "m", "North Denmark Region": "n", "Denmark": "dk"},
}

ENUMS = {
    "operator_type": {"state_agency", "child_welfare_agency", "indigenous_agency", "private_agency",
                      "local_authority", "voluntary_agency"},
    "service_type": {"fostering", "adoption", "fostering_and_adoption"},
    "first_step": {"web_form", "phone_or_email", "info_session", "online_portal", "not_recorded"},
    "form_fields_observed": {"yes", "no"},
    "evidence_level": {"search_result", "page_read", "form_read"},
    "verification": {"unverified", "verified"},
}
REQUIRED = ["front_door_id", "name", "region", "operator_type", "service_type", "first_step",
            "form_fields_observed", "source_url", "date_checked", "evidence_level", "verification"]
URLS = {"website", "form_url", "source_url"}
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
URL = re.compile(r"^https?://[^\s/]+\.[^\s]+$")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(r"(?<![\d/])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)"
                   r"|(?<![\d/])(?:\+61\s?|0)[2-478](?:[\s-]?\d){8}(?!\d)|\b1[38]00[\s-]?\d{3}[\s-]?\d{3}\b"
                   # Germany, France and Spain
                   r"|\+(?:49|33|34)[\s\d/.()-]{7,}"
                   r"|(?<![\d/.])0[1-9](?:[\s.]\d{2}){4}(?!\d)"
                   r"|(?<![\d/.,])0[1-9]\d{1,4}[\s/-]\d{4,8}(?!\d)"
                   r"|(?<![\d/.,])[6789]\d{2}[\s.]\d{2,3}[\s.]\d{2,3}(?:[\s.]\d{2})?(?!\d)"
                   r"|(?<![\d/.,])[6789]\d[\s.]\d{3}[\s.]\d{2}[\s.]\d{2}(?!\d)"
                   # Ireland, the Netherlands, New Zealand and Singapore
                   r"|\+(?:353|31|64|65)[\s\d()-]{7,}"
                   r"|(?<![\d/.,])0800[\s-]?\d{3}[\s-]?\d{3,4}(?!\d)"
                   r"|(?<![\d/.,])[689]\d{3}[\s-]\d{4}(?!\d)")


def main() -> int:
    errors = []
    checked = []
    for country, regions in COUNTRIES.items():
        path = ROOT / "register" / country / "front-doors.csv"
        if not path.exists():
            print(f"{country}: no register yet")
            continue
        with path.open(encoding="utf-8", newline="") as fh:
            reader = csv.DictReader(fh)
            if reader.fieldnames != HEADER:
                errors.append(f"{path.relative_to(ROOT)}: header does not match")
                continue
            rows = list(reader)
        ids = [r["front_door_id"] for r in rows]
        for dup in sorted({i for i in ids if ids.count(i) > 1}):
            errors.append(f"{country}: {dup} appears more than once")
        for n, r in enumerate(rows, start=2):
            where = f"{country}/front-doors.csv:{n}"
            for col in REQUIRED:
                if not r[col].strip():
                    errors.append(f"{where}: {col} is empty")
            for col, allowed in ENUMS.items():
                if r[col] and r[col] not in allowed:
                    errors.append(f"{where}: {col} '{r[col]}' not allowed")
            for col in URLS:
                if r[col] and not URL.match(r[col]):
                    errors.append(f"{where}: {col} is not a URL")
            if r["region"] not in regions:
                errors.append(f"{where}: unknown region '{r['region']}'")
            elif not r["front_door_id"].startswith(f"{country}-{regions[r['region']]}-"):
                errors.append(f"{where}: {r['front_door_id']} should start with {country}-{regions[r['region']]}-")
            if r["date_checked"] and not DATE.match(r["date_checked"]):
                errors.append(f"{where}: date_checked must be YYYY-MM-DD")
            if r["verification"] == "verified" and r["evidence_level"] == "search_result":
                errors.append(f"{where}: a verified row needs page_read or form_read")
            for col, val in r.items():
                if EMAIL.search(val):
                    errors.append(f"{where}: {col} looks like it holds an email address")
                if col not in URLS and PHONE.search(val):
                    errors.append(f"{where}: {col} looks like it holds a phone number")
        print(f"{country}: {len(rows)} front doors")
        checked.append(country.upper())
    if errors:
        for e in errors:
            print("FAIL", e)
        return 1
    print(f"Register checks passed for {', '.join(checked)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
