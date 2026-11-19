// Light or dark theme for kinderform.org.
//
// Light is the default. A reader who picks dark with the switch in the header keeps it on
// this device: the choice is stored in localStorage on their own device. It is not a
// cookie, and it is never sent anywhere. This file runs in <head>, before the page is
// drawn, so a dark page never flashes light.
(function () {
  var KEY = "kf-theme"
  var root = document.documentElement
  var saved = null
  try {
    saved = localStorage.getItem(KEY)
  } catch (e) {}
  root.setAttribute("data-theme", saved === "dark" ? "dark" : "light")
  root.setAttribute("data-js", "")

  function sync() {
    var dark = root.getAttribute("data-theme") === "dark"
    var buttons = document.querySelectorAll("[data-theme-choice]")
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute("data-theme-choice") === (dark ? "dark" : "light")
      buttons[i].setAttribute("aria-pressed", on ? "true" : "false")
    }
  }

  document.addEventListener("click", function (e) {
    var button = e.target && e.target.closest && e.target.closest("[data-theme-choice]")
    if (!button) return
    var choice = button.getAttribute("data-theme-choice") === "dark" ? "dark" : "light"
    root.setAttribute("data-theme", choice)
    try {
      if (choice === "dark") localStorage.setItem(KEY, "dark")
      else localStorage.removeItem(KEY)
    } catch (e) {}
    sync()
  })
  document.addEventListener("DOMContentLoaded", sync)
})()
