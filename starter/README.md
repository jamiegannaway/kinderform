# Use Kinderform in your own form builder

[Choose a starter](https://www.kinderform.org/build) or [start with the shared questions for any country](https://www.kinderform.org/build/global). Each kit works with any tool that lets you create questions manually. It also offers a standalone HTML example, an AI prompt, and optional setup notes for Tally and Typeform.

Unzip a kit and open **START-HERE.html**. A service can keep its existing system, change a copy of its form, try the three reply methods with fictional data, then check the receiving team's handoff. The CSV field map gives the display labels, stored answer values and rules together. Scoped wording also describes errors, hints and when follow-up questions apply.

## Maintaining downloads

`VERSION` identifies the current kit release. The country-specific kits take their wording from `schema/ui/`. The shared starter uses the common English questions and omits country-specific fields and commitments. Exported answers follow the existing submission schema. Its version is separate from a kit release.

To prepare a new release, set a new value in `starter/VERSION` and update the changelog. Generate the snapshot on a branch:

```sh
python3 starter/pack.py snapshot
python3 tests/validate_starter_kits.py
npm ci --prefix site
npm run build --prefix site
```

Commit the new snapshot under `starter/releases/<version>/` with the source changes. Attach the same combined ZIP to the GitHub release. Each archived release is preserved. The site build expands the saved files into individual downloads and one ZIP per version of the form. A future change to today's wording does not alter an older archive.

The offline HTML file creates a preview and a local JSON download. The service that adopts it supplies real routing, privacy information, handling of submissions and reply times. Validate adapted code with synthetic records before connecting it to the service.
