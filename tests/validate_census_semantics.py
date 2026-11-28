"""Regressions for observed classifier collisions and lost branch information."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
from crawl_to_census import branching_of, topic_of  # noqa: E402

cases = [
    ("Select all that apply. 0–5 years 6–11 years 12–17 years Open to discussing different age groups",
     ("interest", "child_preferences")),
    ("What age groups of children could you foster?", ("interest", "child_preferences")),
    ("Are you aged over 21?", ("eligibility", "age")),
    ("Date of birth", ("contact_identity", "date_of_birth")),
    ("Do you practice/follow any religion or belief in your household?", ("equality", "religion")),
    ("Choice of: Phone, Email, Text", ("contact_preference", "method")),
]
for label, expected in cases:
    assert topic_of(label) == expected, (label, topic_of(label), expected)
for label in ["If other, please specify", "If yes, please specify", "Other - please specify"]:
    assert branching_of(label) == "conditional", label
assert branching_of("Name") == "unknown", "an untested page cannot prove a question is always shown"
assert branching_of("Details", "q02=yes") == "conditional"
print("OK: child/applicant age, household/religion, contact preference and unknown branching")
