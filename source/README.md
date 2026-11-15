# Simple Pendulum — Time in Motion

A browser-based mechanics laboratory with a draggable pendulum, adjustable physical parameters, live energy and angle graphs, period measurements, slow-motion playback, and a local observation notebook. Its kinetic-observatory visual direction pairs a brass pendulum with a deep-blue stage and a readable experimental workspace.

The application is implemented in React, TypeScript, and Three.js. All simulation calculations run locally. The production build bundles its runtime dependencies; no CDN, external API, account, or analytics service is required for the simulation itself. Access controls on a hosting service are separate from the application.

## Run and build

Use Node.js 22 or later and npm. From this project's root directory, build and serve the production app:

```bash
npm ci
npm run build
npm run dev
```

Open the local URL printed by Vite. In this project, `npm run dev` serves the **compiled production build** for managed preview and QA; it does not start source hot-reloading. Both serving scripts bind to all network interfaces for managed preview compatibility. For loopback-only production preview:

```bash
npm run dev -- --host 127.0.0.1
```

For source development with Vite hot-reloading instead:

```bash
npm run develop -- --host 127.0.0.1
```

The reproducible production and verification commands are:

```bash
npm run check
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

`npm run build` runs the TypeScript checker, builds `dist/`, and generates its service worker and resource inventory. `npm run dev` and `npm run preview` both serve the compiled `dist/` directory. `npm run develop` serves source files. The development entry at the project root is not the deployable site.

If a complete download includes `dist/`, it can be served without rebuilding or installing Node dependencies. With Python 3 available:

```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Then open `http://127.0.0.1:8080/`. Serve the files over HTTP or HTTPS; double-clicking `index.html` is not a supported module-app launch method. No Windows-specific launcher is included or claimed to have been tested.

## A first experiment

1. Enter the laboratory. Drag the bob to a starting angle and release it, or use the labelled angle control.
2. Change one variable at a time. Compare length, gravity, and damping while watching the motion and graphs.
3. Slow playback to inspect a turning point or the lowest position. The simulation clock still measures physical model time.
4. Measure several complete cycles, then record an observation. Check the recorded length, gravity, release angle, damping, number of cycles, and measured period.
5. For a gravity experiment, use the practical setup: a 5° release and zero damping. Keep gravity unchanged, record at least three distinct lengths, and inspect the `T²–L` graph.
6. Export the notebook as CSV for your own spreadsheet or practical record. Use the field notes to explain your result and compare it with a real experiment.

One complete oscillation returns to the same position with the same direction of motion. Moving from one extreme to the other is half an oscillation. The automatic period measurement detects successive centre crossings in the same direction, interpolating crossing times between integration steps. The first matching crossing establishes a reference; the next completes the first measured period. It does not obtain an “observed” period by copying a theoretical formula.

Restarting a run starts a new trace and new timing sequence while preserving the notebook. Physical-parameter changes start new experimental conditions so measurements from incompatible runs are not silently combined. Clearing the notebook has an undo action. Camera or rendering changes do not change the physics.

## Scientific model

The authoritative state is angle `θ` in radians, angular velocity `ω` in radians per second, simulated time in seconds, and cumulative dissipated energy in joules. The angle is measured from the downward vertical. Positive and negative release angles select opposite sides.

The model solves:

```text
dθ/dt = ω
dω/dt = −(g/L) sin(θ) − γω
dQ/dt = γmL²ω²
```

Here `L` is the distance from pivot to the bob's centre, `g` is gravitational acceleration, `m` is the bob mass, `γ` is the normalized angular damping rate, and `Q` is accumulated energy transferred out of the moving pendulum. A fourth-order Runge–Kutta solver uses a fixed step of `1/240 s`; playback speed and display refresh rate do not alter this integration step. Graphs sample this same model state every `1/30 s`, retain a bounded history of 600 samples, and show a 12-second window of simulated time. They do not drive or smooth the underlying physics.

| Parameter | Supported domain | Unit |
| --- | --- | --- |
| Pivot-to-centre length | 0.25–2.50 | m |
| Gravitational acceleration | 0.50–25.00 | m/s² |
| Damping rate `γ` | 0–1 | s⁻¹ |
| Bob mass | 0.10–2.00 | kg |
| Release angle | −80 to +80 | degrees |

The model's default mass is 0.5 kg. The domain core supports the mass range above; the visible controls determine which parameters a learner can adjust in this edition. Nonfinite and out-of-domain inputs are rejected at the model boundary.

Energy is calculated as `K = ½mL²ω²` and `U = mgL(1 − cos θ)`, with zero gravitational potential energy at the lowest position. Mechanical energy is `K + U`. For an unchanged free run, `K + U + Q` should remain constant within numerical error. The graph's dissipated-energy series is a model calculation, not a real temperature measurement.

The suspension is massless and inextensible, the pivot is fixed, gravity is uniform, and motion stays in one vertical plane. The visual bob has a finite radius, but its modeled mass is concentrated at its centre. String elasticity, bob rotational inertia, forcing, moving supports, and Earth rotation are omitted. The damping slider is a simplified linear angular-resistance model, not an air-density or calibrated friction setting. With sufficiently weak gravity and high damping, the motion can be overdamped: the bob returns without completing cycles, so there is no repeating oscillation period to record.

### Approximate and nonlinear periods

`T₀ = 2π√(L/g)` is the undamped small-angle approximation. The simulation retains `sin θ`, so large-amplitude periods exceed this value. The undamped finite-amplitude reference uses the complete elliptic integral, evaluated through the arithmetic–geometric mean. A theoretical undamped reference is not a prediction for every damped run.

The gravity fit uses eligible records with the same gravity, zero damping, and release magnitude no greater than 10°. The recommended practical release is 5°, which reduces amplitude bias. At least three distinct lengths are needed for the displayed experiment fit. Fitting `T² = aL + b` gives `g_est ≈ 4π²/a`. Even at a small finite angle, the nonlinear period produces a small systematic bias in the small-angle inference. A neat line is not proof that reaction time, length error, or other physical uncertainties have been modeled.

## Local records and time

The notebook is stored in the browser on this device and can be exported as CSV. It is not an online account or a cloud backup. Browser storage restrictions, private sessions, manual site-data deletion, and eviction can prevent or remove persistence; keep exported copies of important observations. No student name or personal identifier is needed.

The simulation clock is separate from wall-clock time. Slow motion stretches the presentation of a simulated second; it does not change gravity or the measured period. Background-tab or interrupted-frame gaps do not trigger a large, unstable physics jump. Record a fresh timing sequence after changing physical conditions.

## Static hosting and offline operation

The build uses relative asset paths. Publish the **contents of `dist/`** at a static host's root or a repository subpath. Sites uses the tracked `.openai/hosting.json` configuration. If you later choose GitHub Pages branch publishing, copy the complete `dist/` contents into a repository's `/docs` folder and select that same `/docs` publishing source. Preserve `.nojekyll`, the asset subdirectory, `sw.js`, `manifest.webmanifest`, and the other generated files. No GitHub repository or Pages settings are changed by this project package.

For a **new repository with no existing `docs/` content**, these commands prepare the branch-publishing folder from a completed build:

```bash
mkdir -p docs
cp -a dist/. docs/
```

Keep the editable source beside `docs/`; do not replace the source entry with the compiled one. In GitHub, select **Settings → Pages → Deploy from a branch → main → /docs**, using the actual branch name if different. Use the exact published URL shown by GitHub. If the download already contains a prepared `docs/` folder, retain that folder and its complete contents. For an existing repository, inspect any existing `docs/` files before copying over them.

The generated service worker requires HTTPS or a supported localhost secure context. The first successful visit must download and validate the entire release before offline readiness can be reported. A site that has never been loaded cannot be opened offline merely because it includes a service worker. The downloadable local-server route is separate from browser-cache offline operation.

The worker precaches the complete asset inventory, including split JavaScript chunks, CSS, the icon, and the app manifest. Each fetched asset is checked against the build's SHA-256 digest. Failure removes the incomplete new cache and leaves any active previous release intact. A host that changes served file bytes may prevent this strict cache preparation; the application should then report that offline preparation failed, rather than claim readiness.

Cache names include the application, registration scope, and release fingerprint. Cleanup targets only older caches for this app and scope. External reference links are never intercepted or cached. A new worker waits while an older version is in use; the explicit update action sends `ACTIVATE_UPDATE`, and the application reloads after activation. Ordinary first installation claims clients only after the coherent cache is complete. Observation data is separate from the release caches.

`dist/offline-manifest.json` is a machine-readable inventory for static path and hash checks. Its existence does not certify offline lifecycle behavior. Complete browser verification should include an online first install, a network-disabled reload/restart, an update while observations exist, and incomplete-cache recovery.

## Source map and verification scope

| File | Responsibility |
| --- | --- |
| `src/physics.ts` | Parameter validation, ODE integration, energy, theoretical periods, measured crossing events, regression |
| `src/usePendulum.ts` | Simulation timing, playback, run control, model snapshots |
| `src/PendulumScene.tsx` | WebGL apparatus and same-state fallback rendering |
| `src/Graphs.tsx` | Sampled energy/angle traces and measured `T²–L` graph |
| `src/LearningNotes.tsx` | Explanations and prediction feedback |
| `src/records.ts` | Local observation schema and persistence helpers |
| `scripts/package-offline.mjs` | Coherent static-release inventory and service worker |
| `tests/physics.test.ts` | Independent numerical and scientific checks |

Build success, numerical checks, rendered interaction checks, offline tests, and classroom evaluation are separate evidence. Consult the release's `verification/` records for the checks actually executed and remaining limits. No classroom learning improvement, target-device frame rate, comprehensive accessibility conformance, or Windows-specific validation is claimed by this README.

### Current validation limits

The current QA session completed three measured trials, exported their CSV, retained the notebook through normal reload and explicit service-worker updates, and exercised dragging in the SVG fallback. A 0.25× playback trial produced the same displayed period as normal playback; the bob's keyboard hold, arrow-key adjustment and release route also worked. An existing controlled tab reloaded successfully with the local origin server stopped: the Moon preset worked and all three records remained. The final automated rerun passed 31 tests, and static subpath/offline-inventory preflight returned no errors. Narrow layouts were reviewed at 454 and 340 CSS pixels using normal browser zoom; these are not phone/touch-hardware tests. The available browser disabled GPU rendering, so the actual Three.js appearance and interaction have not been visually certified. A complete network-disabled browser restart remains unverified; the server-stopped reload is a narrower check. The private publication succeeded, while this browser's visit to the hosted URL encountered its sign-in gate. Comprehensive keyboard/accessibility coverage remains pending. See `verification/browser-report.md` for exact observations and limits.

## References and rights

- [OpenStax, University Physics Volume 1, §15.4: Pendulums](https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums): ideal pendulum equation, small-angle approximation, period and gravity relationship.
- [OpenStax, §15.5: Damped Oscillations](https://openstax.org/books/university-physics-volume-1/pages/15-5-damped-oscillations): damping and energy transfer.
- [Russ Tedrake, MIT, The Simple Pendulum](https://underactuated.mit.edu/pend.html): nonlinear pendulum and viscous damping torque.
- [MDN, Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API): service-worker scope, secure contexts, and offline lifecycle.

The original application code and artwork have not been assigned an open-source license in this package. The owner can choose a license before public redistribution. Third-party components retain their own licenses; see `THIRD_PARTY_NOTICES.md`, also included in the production build as `third-party-notices.txt`.
