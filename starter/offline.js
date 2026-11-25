"use strict";
(() => {
  const {variant, pages, schema, labels} = /*CONFIG*/ {};
  const byId = (id) => document.getElementById(id);
  const controls = (field) => [...document.querySelectorAll(`input[name="${field}"]`)];
  let active = null;
  let changing = false;

  function answer(field) {
    const inputs = controls(field);
    const input = inputs[0];
    if (field === "updates_opt_in") return input.checked || input.dataset.changed ? input.checked : undefined;
    if (input.type === "checkbox") {
      const selected = inputs.filter((item) => item.checked).map((item) => item.value);
      return selected.length ? selected : undefined;
    }
    if (input.type === "radio") {
      const value = inputs.find((item) => item.checked)?.value;
      return value === undefined ? undefined : field === "knows_child" ? value === "true" : value;
    }
    return input.value.trim() || undefined;
  }
  function shown() {
    return pages.filter((page) => Object.entries(page.when).every(([key, values]) => values.includes(answer(key))));
  }
  function payload() {
    const record = {};
    for (const page of shown()) {
      for (const {field} of page.fields) {
        const value = answer(field);
        if (value !== undefined) record[field] = value;
      }
    }
    return record;
  }
  function clearScreens() {
    for (const id of ["intro", "actions", "progress", "review", "done"]) byId(id).hidden = true;
    for (const page of pages) byId("page-" + page.id).hidden = true;
    for (const item of document.querySelectorAll(".error")) item.hidden = true;
    for (const input of document.querySelectorAll("[aria-invalid]")) input.removeAttribute("aria-invalid");
  }
  function show(page) {
    clearScreens();
    active = page;
    byId("page-" + page.id).hidden = false;
    byId("actions").hidden = byId("progress").hidden = false;
    byId("progress").textContent = `${labels.question} ${shown().indexOf(page) + 1} ${labels.of} ${shown().length}`;
    byId("next").textContent = changing ? labels.review : labels.continue;
    byId("title-" + page.id).focus();
  }
  // Apply the same location transformations as the website before building a record.
  function normalizeLocation(field) {
    const input = byId(field);
    const value = input.value.trim();
    if (field === "postcode_area") {
      const upper = value.toUpperCase().replace(/\s+/g, " ");
      if (upper.includes(" ")) input.value = upper.split(" ")[0];
      else input.value = /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/.test(upper) ? upper.slice(0, -3) : upper;
    } else if (field === "zip_prefix") {
      input.value = value.replace(/\D/g, "").slice(0, 3);
    } else if (field === "postal_code_fsa") {
      const upper = value.toUpperCase().replace(/\s/g, "");
      input.value = upper.length === 6 ? upper.slice(0, 3) : upper;
    } else if (field === "eircode_routing_key") {
      const upper = value.toUpperCase().replace(/\s/g, "");
      input.value = upper.length === 7 ? upper.slice(0, 3) : upper;
    } else if (field === "nl_postcode") {
      const upper = value.toUpperCase().replace(/\s/g, "");
      input.value = /^[0-9]{4}[A-Z]{2}$/.test(upper) ? upper.slice(0, 4) : upper;
    } else {
      input.value = value.replace(/^[A-Za-z]{1,2}-/, "").replace(/\s+/g, "");
      if (field === "au_postcode") input.value = value.replace(/\s+/g, "");
    }
  }
  const locationFields = pages.flatMap((p) => p.fields.filter((f) => f.transform).map((f) => f.field));
  // Only offer fields and options in this variant. The complete schema also covers
  // data from other sources, which the kit's Python validator can check.
  function problems() {
    const record = payload();
    const errors = new Map();
    const required = new Set(schema.required);
    for (const rule of schema.allOf || []) {
      if (!rule.if || !rule.then?.required) continue;
      const applies = Object.entries(rule.if.properties).every(([key, condition]) =>
        condition.enum ? condition.enum.includes(record[key]) : record[key] === condition.const);
      if (applies) for (const key of rule.then.required) required.add(key);
    }
    for (const key of required) if (!(key in record)) errors.set(key, "required");
    for (const [key, value] of Object.entries(record)) {
      const rules = schema.properties[key];
      if (rules.type === "string") {
        const length = [...value].length;
        if (length > rules.maxLength) errors.set(key, "maxLength");
        else if (length < rules.minLength) errors.set(key, "minLength");
        else if (rules.pattern && !new RegExp(rules.pattern, "u").test(value)) errors.set(key, "pattern");
        else if (rules.enum && !rules.enum.includes(value)) errors.set(key, "enum");
      } else if (rules.type === "array" && value.some((option) => !rules.items.enum.includes(option))) {
        errors.set(key, "enum");
      }
    }
    return errors;
  }
  function markErrors(page, errors) {
    let first;
    for (const item of page.fields) {
      const el = byId("error-" + item.field);
      const keyword = errors.get(item.field);
      el.hidden = !keyword;
      for (const control of controls(item.field)) {
        if (keyword) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
      }
      if (!keyword) continue;
      el.textContent = item.errors[keyword] || labels.issue;
      first ||= controls(item.field)[0];
    }
    if (first) first.focus();
    return Boolean(first);
  }
  function displayAnswer(item) {
    const value = answer(item.field);
    const yesNo = pages.flatMap((p) => p.fields).find((f) => f.field === "knows_child").choices;
    if (value === undefined) return item.field === "updates_opt_in" ? yesNo.false : labels.skipped;
    if (Array.isArray(value)) return value.map((entry) => item.choices[entry]).join(", ");
    if (item.field === "updates_opt_in") return yesNo[String(value)];
    return item.choices[String(value)] || String(value);
  }
  function review() {
    const errors = problems();
    const invalid = shown().find((page) => page.fields.some((item) => errors.has(item.field)));
    if (invalid) { show(invalid); markErrors(invalid, errors); return; }
    clearScreens();
    changing = false;
    const summary = byId("summary");
    summary.replaceChildren();
    for (const page of shown()) {
      for (const item of page.fields) {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        const edit = document.createElement("button");
        term.textContent = item.label;
        description.textContent = displayAnswer(item);
        edit.type = "button";
        edit.className = "edit";
        edit.textContent = labels.change;
        edit.setAttribute("aria-label", labels.change + " · " + item.label);
        edit.addEventListener("click", () => { changing = true; show(page); });
        row.append(term, description, edit);
        summary.append(row);
      }
    }
    byId("review").hidden = false;
    byId("review").querySelector("h2").focus();
  }
  function reset(focus) {
    clearScreens();
    changing = false;
    active = null;
    for (const item of document.querySelectorAll("input")) {
      if (item.type === "radio" || item.type === "checkbox") item.checked = false;
      else item.value = "";
      delete item.dataset.changed;
    }
    byId("summary").replaceChildren();
    byId("record").textContent = "";
    byId("intro").hidden = false;
    if (focus) byId("intro").querySelector("h1").focus();
  }
  byId("updates_opt_in").addEventListener("change", (event) => { event.target.dataset.changed = "true"; });
  for (const field of locationFields) byId(field).addEventListener("blur", () => normalizeLocation(field));
  byId("start").addEventListener("click", () => show(shown()[0]));
  byId("next").addEventListener("click", () => {
    for (const field of locationFields) normalizeLocation(field);
    if (!active || markErrors(active, problems())) return;
    const sequence = shown();
    const next = sequence[sequence.indexOf(active) + 1];
    if (changing || !next) review(); else show(next);
  });
  byId("back").addEventListener("click", () => {
    const seq = shown();
    const previous = seq[seq.indexOf(active) - 1];
    if (previous) show(previous);
    else { clearScreens(); byId("intro").hidden = false; byId("start").focus(); }
  });
  byId("questions").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && ["text", "email", "tel"].includes(event.target.type)) {
      event.preventDefault(); byId("next").click();
    }
  });
  byId("finish").addEventListener("click", () => {
    const record = payload();
    if (problems().size) { review(); return; }
    clearScreens();
    byId("record").textContent = JSON.stringify(record, null, 2);
    byId("done").hidden = false;
    byId("done").querySelector("h2").focus();
  });
  byId("download").addEventListener("click", () => {
    if (byId("done").hidden || problems().size) return;
    const json = JSON.stringify(payload(), null, 2) + "\n";
    const url = URL.createObjectURL(new Blob([json], {type: "application/json"}));
    const link = document.createElement("a");
    link.href = url;
    link.download = `kinderform-${variant}-example.json`;
    document.body.append(link);
    link.click();
    link.remove();
    // Give the browser time to accept the user-initiated download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  byId("restart").addEventListener("click", () => reset(true));
  reset(false);
  byId("start").disabled = false;
})();
