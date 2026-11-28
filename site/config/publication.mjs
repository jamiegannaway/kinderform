// Use Astro's actual command, not NODE_ENV: a build can run with NODE_ENV=development.
export function allowLocalNamedReview(command, env) {
  return command === "dev" && env.KINDERFORM_PRIVATE_NAMED_RESULTS === "true" && !env.VERCEL && !env.VERCEL_ENV
}

export function publicationBoundary() {
  return {
    name: "kinderform-publication-boundary",
    hooks: {
      "astro:config:setup": ({ command, updateConfig }) => {
        const enabled = allowLocalNamedReview(command, process.env)
        updateConfig({
          ...(enabled ? { server: { host: "127.0.0.1" } } : {}),
          vite: { define: { __KINDERFORM_LOCAL_NAMED_REVIEW__: JSON.stringify(enabled) } },
        })
      },
    },
  }
}
