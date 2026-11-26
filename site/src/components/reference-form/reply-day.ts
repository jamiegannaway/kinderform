// An illustrative calendar for the demo, not an operational service deadline.
// It respects chosen call days, but has no service hours or public-holiday data.
export function nextReplyDay(from: Date, data: Record<string, unknown>): Date {
  const times = data.contact_method === "phone_call" && Array.isArray(data.best_times)
    ? data.best_times.filter((time) => ["weekday_morning", "weekday_afternoon", "weekday_evening", "saturday"].includes(String(time)))
    : []
  const weekdays = !times.length || times.some((time) => String(time).startsWith("weekday_"))
  const saturday = times.includes("saturday")
  const day = new Date(from)
  do day.setDate(day.getDate() + 1)
  while (!((weekdays && day.getDay() >= 1 && day.getDay() <= 5) || (saturday && day.getDay() === 6)))
  return day
}
