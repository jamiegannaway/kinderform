// Vercel sets VERCEL_ENV to "production", "preview" or "development" at build time.
// Named results are built everywhere except production.
export const isProduction = process.env.VERCEL_ENV === "production"
export const builtOn = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
