# Browser and delivery verification record

## Status and evidence scope

The compiled application has a working observed measurement path, SVG fallback interaction, exported observations, and persistence across an ordinary reload and an explicit service-worker update. A cached reload also worked while the local origin server was stopped. A quarter-speed timing trial, bob keyboard controls, and narrow CSS layouts through normal browser zoom were checked. **The complete release gates have not passed.** Actual GPU-rendered 3D, a full network-disabled browser restart, and comprehensive keyboard/accessibility coverage remain unverified.

This report records the browser observations from the primary QA session and directly inspected CSV bytes. It does not invent screenshots, frame-time measurements, device tests or learner participants. Build and artifact fingerprints are maintained in `project-contract.json`; refresh bindings and rerun affected checks if the production output changes.

Environment: managed browser using the current compiled production build on the local preview at `http://127.0.0.1:4173/`. Browser GPU diagnostics reported `GL_VENDOR: Disabled` and `GL_RENDERER: Disabled`; the observed instrument was the application's SVG fallback. That fallback evidence is separate from 3D evidence.

## Observed experimental path

The browser completed three single-cycle trials with gravity 9.81 m/s², mass 0.5 kg, a 5° release, and zero damping. Each result was recorded in the notebook, and the resulting gravity fit displayed **9.80 m/s²**.

| Trial | Length / m | Release / ° | Damping / s⁻¹ | Cycles | Elapsed simulated time / s | Period / s | Exported T² / s² |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.500 | 5.00 | 0.000 | 1 | 1.419179 | 1.419179 | 2.014069 |
| 2 | 1.000 | 5.00 | 0.000 | 1 | 2.007022 | 2.007022 | 4.028137 |
| 3 | 1.500 | 5.00 | 0.000 | 1 | 2.458090 | 2.458090 | 6.042205 |

The exported file was inspected at `/workspace/shared/time-in-motion-qa-observations.csv`. Its SHA-256 is `5429f311d0ff87e68ee24fe89cf22d74f3a74c7547b5490318b597169d91b8ba`. It contains the explicit SI-unit header and exactly these three data rows:

```csv
trial,length_m,gravity_m_s2,damping_s-1,mass_kg,release_angle_deg,cycles,elapsed_simulated_s,period_s,period_squared_s2
1,0.500,9.810,0.000,0.500,5.00,1,1.419179,1.419179,2.014069
2,1.000,9.810,0.000,0.500,5.00,1,2.007022,2.007022,4.028137
3,1.500,9.810,0.000,0.500,5.00,1,2.458090,2.458090,6.042205
```

An independent calculation from the exported, rounded T² column gives a least-squares slope of 4.028136 s²/m, an intercept of approximately 0.000001 s², and `4π²/slope = 9.8006665 m/s²`. This agrees with the browser's two-decimal display. The slight difference from 9.81 is consistent with using the small-angle inference on a finite 5° nonlinear swing; it is not evidence of an exact recovery of the configured gravity.

These trials demonstrate a single-cycle end-to-end path and three-length inference. They do not by themselves verify five-/ten-cycle browser timing, every excluded-row condition, all replay routes or a physical-lab uncertainty model.

### Quarter-speed measurement

The browser selected **0.25×** playback, with the control's `aria-pressed` state confirmed true, and completed one measured cycle at L = 0.50 m, release = 5° and zero damping. The measurement card displayed **MEASURED AVERAGE PERIOD: 1.419 s** and `T = 1.419 ÷ 1 = 1.419`. This matches the normal-playback measurement at the displayed three-decimal precision. The observation supports playback-rate independence for this tested run; it does not assert bit-for-bit equality of unexported values or complete coverage of every rate and condition. A screenshot was saved at `/workspace/shared/time-in-motion-slow-motion.jpg`.

## Interaction and feedback observations

- The SVG apparatus was visually inspected and the bob was dragged through the UI.
- Force arrows were displayed. This confirms the visible toggle path; it is not an independent audit of every force-vector state.
- Leaving a parameter field without changing its value preserved the running experiment.
- Entering length `0.255 m` was rejected as an off-step UI value. This is a control-resolution check, not a claim that 0.255 m is physically impossible or outside the model's length interval.
- An incorrect prediction choice produced corrective feedback, and a correct choice produced the corresponding explanation. Complete all-card keyboard/live-region coverage remains a separate pending check.
- Normal browser zoom produced a 454 CSS-pixel viewport with a 449-pixel document width; editing the numeric Length field to 0.50 m worked. At a 340 CSS-pixel viewport, document width was 337 pixels and the stacked control panel, headings, input and slider visually fit. A full-page capture was saved at `/workspace/shared/time-in-motion-narrow-layout.jpg`. This is responsive CSS/zoom evidence, not a phone or touch-hardware test.
- With the bob paused, **Enter** held it at its displayed current angle of 0.1°; displayed speed and time became 0.00. **ArrowRight** moved the displayed angle to 1.1° while speed remained zero. **Enter** then released it from rest, and the status confirmed the release. This checks the actual bob's hold/adjust/release keyboard route, not the entire application focus order or an accessibility conformance audit.

Pointer-cancel recovery, a complete keyboard-only notebook/measurement workflow, reduced-motion behavior, actual mobile hardware, and the most extreme apparatus geometries are not certified by these observations.

## Records and service-worker update

All three notebook rows remained after an ordinary page reload. They also remained after the application's explicit **Update & reload** service-worker action. Following the final singular/plural wording patch, the new worker's **Update & reload** action was exercised again successfully, retaining the same three rows. The CSV export was downloaded and checked against the displayed experimental conditions and recorded values.

A cache-key mismatch involving `Vary: Origin` was repaired during the session: validated, exact manifest assets now use a consistent request key for caching and retrieval. The post-repair reload and explicit update checks above succeeded without discarding observations. SHA-256 validation of cached release assets remains enabled.

### Cached reload with the origin unavailable

The local preview server was explicitly stopped, and the preview control returned `stopped`. The existing service-worker-controlled tab was then reloaded at `http://127.0.0.1:4173/#laboratory`. The application rendered, its footer displayed **Ready for offline use**, the Moon preset changed the gravity input to **1.62**, and the notebook still contained **three** rows. The server was restarted after the check.

This verifies an existing controlled tab's cached reload and a working interaction while its local origin server was unavailable. It is distinct from disabling all network access, closing/restarting the browser, or starting with an empty/evicted cache. Full browser restart, cache eviction recovery, interrupted precaching, and behavior when a host modifies asset bytes remain unverified. Clearing/undoing the notebook and malformed-storage behavior were not separately observed in the browser in this report.

## Automated checks and publication

The primary verification session reported **31 tests passing**, including a final rerun: the 21 scientific-domain tests and 10 record/persistence/CSV tests currently in `tests/physics.test.ts` and `tests/records.test.ts`. The detailed numerical-domain result is recorded separately in `physics-notes.md`; those tests include analytic and independent quadrature references, energy balance, convergence and same-direction event timing. Storage test doubles cover domain/schema validation, scope isolation, corrupt records, blocked/quota-limited storage and numeric CSV output. A passing test-double case is not a claim that every corresponding browser failure path was exercised.

Static preflight of the compiled production output at `/time-in-motion/`, with `offline-manifest.json` and branch-publishing checks enabled, returned `errors: []`. The checked build fingerprint was `246d0429f8a3ec5e8429a0d131943b8c0078a88c9edc29e92e5d38b2243fad6a`. This establishes the checked static entry paths, resource inventory and hashes, including `.nojekyll`; the preflight does not execute browser JavaScript or certify the full worker lifecycle.

The native Sites operation reported a successful private deployment. Visiting the hosted URL in the available browser encountered a sign-in gate. Therefore publication success is recorded separately from authenticated hosted-page interaction. The local compiled preview supplied the interaction evidence above.

## Remaining verification

| Scope | Current status | Required next evidence |
| --- | --- | --- |
| Actual Three.js/WebGL apparatus | Blocked in this browser | A browser with enabled WebGL: materials, lighting, picking, dimensions and context recovery |
| SVG fallback desktop path | Observed | Extend only for untested edge states or regressions |
| Origin-unavailable cached reload | Observed | Existing controlled tab reloaded and Moon preset worked with the preview server stopped; three records retained |
| Full offline lifecycle | Not fully tested | Full network-disabled browser restart, failed cache preparation and eviction recovery |
| Narrow CSS layout | Observed at 454 px and 340 px through browser zoom | Actual phone/touch-device validation remains separate |
| Bob keyboard operation | Observed | Enter hold, ArrowRight adjustment and Enter release worked |
| Comprehensive keyboard and reduced motion | Pending | Complete the remaining experiment/notebook workflow by keyboard and review motion preference behavior |
| Comprehensive 3D/graph geometry | Pending | Independent rendered endpoint/axis checks across domain extremes |
| Authenticated hosted application | Blocked by sign-in gate here | Review the deployed page in the owner's authenticated browser |
| Target-device performance | No claim | Measure on a stated browser/device before claiming frame rates or latency |
| Classroom effectiveness | No claim | A separately designed learner pilot with recorded outcomes |

The project contract deliberately retains incomplete critical gates. Its draft validation checks structure and evidence hashes; it must not be presented as a full-release certification.
