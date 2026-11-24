# Security and privacy

## Report a problem privately

Email [jamie.gannaway@gmail.com](mailto:jamie.gannaway@gmail.com) if you find:

- **real personal data** in this repository or on kinderform.org, such as a real person's name, contact details or case information
- **a named member of staff** in a register, census or report
- **a security problem** with the site or the example forms

Please do not open a public issue for these. We will reply as soon as we can, remove personal data straight away, and tell you what we did.

## What this project keeps

- The registers and the census describe services, published rules and public web pages. They hold no data about people who enquire, and no data about children.
- Every example in the repository is made up, and looks made up (for example, `example.org` addresses).
- The example forms send nothing and store nothing. What you type stays in your browser until you close the page.
- The site sets no cookies, does no tracking and loads nothing from other sites. Its Content-Security-Policy is in `vercel.json`.
- The polite crawler in `tools/` reads public pages only, follows robots.txt, waits between requests to the same site and never submits a form.
