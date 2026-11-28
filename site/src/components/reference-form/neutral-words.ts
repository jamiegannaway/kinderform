// The few phrases the neutral design's last page needs that are not in the wording files: what
// happens next, and the label that shows the record. They are the same words as each country's own
// design (govuk.tsx, uswds.tsx, kern.tsx and so on), so both versions of a form read the same.
//
// A language that is not here still works: the last page then shows only what the wording file
// has (the title, the reference, the example reply and the record). Add a language with its own
// entry, and a country that words things differently with an entry for its locale ("en-US").
export type DoneWords = {
  ack: { email: string; text: string }
  now: string
  nowBody: (ack: string) => string
  by: (day: string) => string
  how: Record<string, string>
  who: (team: string, how: string) => string
  times: string
  talk: string
  talkBody: string
  notSure: string
  plans: string
  record: string
}

const en: DoneWords = {
  ack: { email: "an email", text: "a text message" },
  now: "Now.",
  nowBody: (ack) => `We have sent you ${ack} to confirm we have your message. It says who will contact you and when.`,
  by: (day) => `By the end of ${day}.`,
  how: { email: "email you", text_message: "text you", phone_call: "call you" },
  who: (team, how) => `A named person from ${team} will ${how}`,
  times: ", at one of the times you chose",
  talk: "When you talk.",
  talkBody: "You can ask questions without committing to an application.",
  notSure: " We will talk you through fostering, adoption and other ways to help.",
  plans: "If your plans change, that's fine. You can tell us at any time.",
  record: "Show the record",
}

const enquiry = (ack: string) => `We have sent you ${ack} to confirm we have your enquiry. It says who will contact you and when.`

const WORDS: Record<string, DoneWords> = {
  en,
  "en-US": {
    ...en,
    nowBody: (ack) => `We sent you ${ack} to confirm we have your question. It says who will contact you and when.`,
    notSure: " We'll talk you through foster care, adoption and other ways to help.",
  },
  "en-CA": { ...en, nowBody: enquiry },
  "en-SG": { ...en, nowBody: enquiry },
  "en-NZ": { ...en, notSure: " We will talk you through caregiving, adoption and other ways to help." },
  fr: {
    ack: { email: "un e-mail", text: "un SMS" },
    now: "Maintenant.",
    nowBody: (ack) =>
      `Nous vous avons envoyé ${ack} pour confirmer que nous avons bien reçu votre demande. Il indique qui va vous contacter et quand.`,
    by: (day) => `D'ici la fin de la journée du ${day}.`,
    how: { email: "vous écrire par e-mail", text_message: "vous envoyer un SMS", phone_call: "vous appeler" },
    who: (team, how) => `Une personne de ${team} va ${how}`,
    times: ", à l'un des moments que vous avez choisis",
    talk: "Pendant l'échange.",
    talkBody: "Vous pouvez poser des questions sans vous engager à déposer une candidature.",
    notSure: " Nous vous parlerons de l'accueil familial, de l'adoption et d'autres façons d'aider.",
    plans: "Si vos projets changent, ce n'est pas grave. Vous pouvez nous le dire à tout moment.",
    record: "Afficher les données",
  },
  "fr-CA": {
    ack: { email: "un courriel", text: "un message texte" },
    now: "Maintenant.",
    nowBody: (ack) =>
      `Nous vous avons envoyé ${ack} pour confirmer que nous avons reçu votre demande. Il indique qui communiquera avec vous et quand.`,
    by: (day) => `D'ici la fin de la journée du ${day}.`,
    how: { email: "vous écrire par courriel", text_message: "vous envoyer un message texte", phone_call: "vous appeler" },
    who: (team, how) => `Une personne de ${team} va ${how}`,
    times: ", à l'un des moments que vous avez choisis",
    talk: "Pendant la conversation.",
    talkBody: "Vous pouvez poser des questions sans vous engager à déposer une candidature.",
    notSure: " Nous vous parlerons de la famille d'accueil, de l'adoption et d'autres façons d'aider.",
    plans: "Si vos projets changent, ce n'est pas grave. Vous pouvez nous le dire en tout temps.",
    record: "Afficher le dossier",
  },
  de: {
    ack: { email: "eine E-Mail", text: "eine SMS" },
    now: "Jetzt.",
    nowBody: (ack) =>
      `Wir haben Ihnen ${ack} geschickt. Darin bestätigen wir, dass Ihre Anfrage angekommen ist. Dort steht auch, wer sich wann bei Ihnen meldet.`,
    by: (day) => `Spätestens am ${day}.`,
    how: { email: "Ihnen eine E-Mail schreiben", text_message: "Ihnen eine SMS schicken", phone_call: "Sie anrufen" },
    who: (team, how) => `Eine feste Ansprechperson von ${team} wird ${how}`,
    times: ", zu einer der Zeiten, die Sie gewählt haben",
    talk: "Im Gespräch.",
    talkBody: "Sie können Fragen stellen, ohne sich zu einer Bewerbung zu verpflichten.",
    notSure: " Wir erklären Ihnen Pflegefamilie, Adoption und andere Wege, wie Sie helfen können.",
    plans: "Wenn sich Ihre Pläne ändern, ist das in Ordnung. Sie können es uns jederzeit sagen.",
    record: "Datensatz anzeigen",
  },
  es: {
    ack: { email: "un correo electrónico", text: "un SMS" },
    now: "Ahora.",
    nowBody: (ack) =>
      `Le hemos enviado ${ack} para confirmar que hemos recibido su consulta. En él le decimos quién se pondrá en contacto con usted y cuándo.`,
    by: (day) => `Antes del final del ${day}.`,
    how: { email: "le escribirá un correo electrónico", text_message: "le enviará un SMS", phone_call: "le llamará" },
    who: (team, how) => `Una persona de ${team} ${how}`,
    times: ", en uno de los momentos que ha elegido",
    talk: "Cuando hablemos.",
    talkBody: "Puede hacer preguntas sin comprometerse a presentar una solicitud.",
    notSure: " Le explicaremos el acogimiento familiar, la adopción y otras formas de ayudar.",
    plans: "Si sus planes cambian, no pasa nada. Puede decírnoslo en cualquier momento.",
    record: "Mostrar los datos",
  },
  nl: {
    ack: { email: "een e-mail", text: "een sms" },
    now: "Nu.",
    nowBody: (ack) =>
      `We hebben je ${ack} gestuurd. Daarin staat dat we je vraag hebben gekregen. Je leest er ook in wie contact met je opneemt, en wanneer.`,
    by: (day) => `Uiterlijk op ${day}.`,
    how: { email: "je een e-mail sturen", text_message: "je een sms sturen", phone_call: "je bellen" },
    who: (team, how) => `Een vaste contactpersoon van ${team} gaat ${how}`,
    times: ", op een van de momenten die je hebt gekozen",
    talk: "In het gesprek.",
    talkBody: "Je kunt vragen stellen zonder dat je je vastlegt op een aanvraag.",
    notSure: " We vertellen je over pleegzorg, adoptie en andere manieren om te helpen.",
    plans: "Veranderen je plannen? Dat is goed. Je kunt het ons altijd laten weten.",
    record: "Gegevens bekijken",
  },
  // Norwegian Bokmål, Danish and Finnish: the same words as designsystemet.tsx, dkfds.tsx and suomifi.tsx.
  nb: {
    ack: { email: "en e-post", text: "en SMS" },
    now: "Nå.",
    nowBody: (ack) =>
      `Vi har sendt deg ${ack} som bekrefter at vi har fått spørsmålet ditt. Der står det hvem som tar kontakt med deg, og når.`,
    by: (day) => `Senest ${day}.`,
    how: { email: "sende deg en e-post", text_message: "sende deg en SMS", phone_call: "ringe deg" },
    who: (team, how) => `En fast kontaktperson fra ${team} skal ${how}`,
    times: ", på et av tidspunktene du valgte",
    talk: "Når dere snakker sammen.",
    talkBody: "Du kan stille spørsmål uten å forplikte deg til å søke.",
    notSure: " Vi forteller deg om fosterhjem, adopsjon og andre måter å hjelpe på.",
    plans: "Endrer planene dine seg? Det går fint. Du kan si fra når som helst.",
    record: "Vis opplysningene",
  },
  da: {
    ack: { email: "en e-mail", text: "en sms" },
    now: "Nu.",
    nowBody: (ack) =>
      `Vi har sendt dig ${ack}. Den bekræfter, at vi har fået din henvendelse. Der står også, hvem der kontakter dig, og hvornår.`,
    by: (day) => `Senest ${day}.`,
    how: { email: "skriver til dig", text_message: "sender dig en sms", phone_call: "ringer til dig" },
    who: (team, how) => `En fast kontaktperson fra ${team} ${how}`,
    times: " på et af de tidspunkter, du har valgt",
    talk: "Når I taler sammen.",
    talkBody: "Du kan stille spørgsmål uden at forpligte dig til at søge.",
    notSure: " Vi fortæller dig om at blive plejefamilie, om adoption og om andre måder at hjælpe på.",
    plans: "Ændrer dine planer sig? Det er helt i orden. Du kan altid give os besked.",
    record: "Vis oplysningerne",
  },
  // The team names in the Finnish wording are in the elative case ("perhehoidon tiimistä"), and
  // every weekday takes -na: "maanantaina 30. marraskuuta".
  fi: {
    ack: { email: "sähköpostin", text: "tekstiviestin" },
    now: "Nyt.",
    nowBody: (ack) =>
      `Lähetimme sinulle ${ack}. Siinä kerrotaan, että saimme kysymyksesi. Siinä kerrotaan myös, kuka ottaa sinuun yhteyttä ja milloin.`,
    by: (day) => `Viimeistään ${day.replace(/^(\S+)/, "$1na")}.`,
    how: { email: "lähettää sinulle sähköpostia", text_message: "lähettää sinulle tekstiviestin", phone_call: "soittaa sinulle" },
    who: (team, how) => `Oma yhteyshenkilösi ${team} ${how}`,
    times: " jonakin valitsemanasi aikana",
    talk: "Kun puhumme.",
    talkBody: "Voit kysyä mitä haluat. Kysyminen ei sido sinua mihinkään.",
    notSure: " Kerromme sinulle sijaisperheistä, adoptiosta ja muista tavoista auttaa.",
    plans: "Jos suunnitelmasi muuttuvat, se ei haittaa. Voit kertoa siitä meille milloin tahansa.",
    record: "Näytä tiedot",
  },
  // Swedish, addressing the reader as "du", in the words of the engine's Swedish example reply.
  // Sweden's form comes only in the neutral design, so these words are not in any other file.
  sv: {
    ack: { email: "ett mejl", text: "ett sms" },
    now: "Nu.",
    nowBody: (ack) =>
      `Vi har skickat ${ack} till dig. Där står det att vi har fått din fråga. Där står det också vem som kontaktar dig och när.`,
    by: (day) => `Senast ${day}.`,
    how: { email: "mejlar dig", text_message: "skickar ett sms till dig", phone_call: "ringer dig" },
    who: (team, how) => `En fast kontaktperson från ${team} ${how}`,
    times: ", vid en av de tider som du har valt",
    talk: "När ni pratar.",
    talkBody: "Du kan ställa frågor utan att binda dig för något.",
    notSure: " Vi berättar om familjehem, adoption och andra sätt att hjälpa till.",
    plans: "Ändras dina planer? Det gör ingenting. Du kan säga till när som helst.",
    record: "Visa uppgifterna",
  },
}

/** The words for a locale ("en-CA"), else for its language ("en"), else none. */
export const doneWords = (locale: string): DoneWords | undefined =>
  WORDS[locale] ?? WORDS[locale.split("-")[0].toLowerCase()]

export const hasDoneWords = (locale: string) => doneWords(locale) !== undefined
