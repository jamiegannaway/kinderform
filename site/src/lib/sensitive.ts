// One definition of a sensitive question, for every page and chart (see the word list in
// docs/plain-language.md): date of birth or age, ID numbers, past partners, health, a criminal
// record, past contact with child protection, ethnicity, gender, sexuality or faith, immigration
// status, and the person's own childhood. Our draft checklist says these should wait until after
// a conversation.
import type { Row } from "@/lib/census"

const TOPICS = new Set(["date_of_birth", "age", "id_number", "previous_partners", "citizenship", "residency", "life_story"])
const CATEGORIES = new Set(["health", "criminal_record", "prior_involvement", "equality"])

export const isSensitive = (q: Row) => TOPICS.has(q.topic) || CATEGORIES.has(q.category)
