// Named results require an explicit local development opt-in. A preview deployment
// is not necessarily private. No static build may contain this draft review page,
// even when the opt-in is set or VERCEL_ENV is absent/misconfigured.
// The Astro config hook defines this from its actual command. NODE_ENV and
// VERCEL_ENV must never turn a build into a local review server.
declare const __KINDERFORM_LOCAL_NAMED_REVIEW__: boolean
export const showNamedResults = __KINDERFORM_LOCAL_NAMED_REVIEW__
export const builtOn = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
