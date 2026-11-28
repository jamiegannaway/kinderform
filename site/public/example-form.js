// The country pages at /example-form/<country>. Runs before the page is drawn: when the address
// asks for the neutral design (?design=neutral), mark <html data-design="neutral">, so the design
// switch and the frame around the form show the right choice straight away. The form itself loads
// later (src/components/reference-form/mount-page.tsx). Stores nothing.
if (new URLSearchParams(location.search).get("design") === "neutral") {
  document.documentElement.dataset.design = "neutral";
}
