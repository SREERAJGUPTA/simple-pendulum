# Pendulum model and independent checks

## Model contract

The simulated bob is a point mass on a massless, inextensible suspension, moving in one vertical plane about a fixed pivot under uniform gravity. Length means **pivot to bob centre**, regardless of the visible bob radius. Angle is measured from the downward vertical and is positive to the viewer's right. A release sets angular velocity to zero. SI units are used internally; only the release-angle interface uses degrees.

The nonlinear equation is θ̈ = −(g/L) sin θ − γθ̇. The coefficient γ is the angular-velocity damping rate in s⁻¹; it is **not** the half-rate used in some books. A fixed γ gives mass-independent angular motion in this model. Holding a physical drag coefficient fixed while changing mass would be a different experiment.

The model covers L = 0.25–2.5 m, g = 0.5–25 m/s², mass = 0.1–2 kg, γ = 0–1 s⁻¹ and release angles −80° to +80°. It excludes string stretch/mass, finite-size bob rotation, pivot motion, quadratic air drag, dry friction, out-of-plane motion, Earth rotation and measurement noise. A finite rendered bob is an apparatus illustration; its mass remains concentrated at its centre in the dynamics.

## Numerical and measurement methods

- Fourth-order Runge–Kutta, normally at a fixed step of 1/240 s, integrates θ, angular velocity and dissipated energy together. No display-refresh or playback-rate parameter enters the solver.
- Kinetic energy = ½mL²ω²; potential energy = mgL(1 − cos θ), calculated as 2mgL sin²(θ/2) to avoid cancellation near zero. The potential reference is the lowest bob position.
- Energy transferred to the surroundings is integrated from Q̇ = γmL²ω². It is not inferred by subtracting the current mechanical energy from its initial value. Therefore the E + Q balance is an independent numerical check rather than a constructed identity.
- Period observations use successive centre crossings in the same positive-going direction with within-step linear event-time interpolation. The first crossing arms the measurement; only a subsequent same-direction crossing completes a period. A resting bob has no measured period.
- The theoretical small-angle period is 2π√(L/g). The finite-amplitude comparison is the **undamped** period 4√(L/g) K(sin(|θ₀|/2)), evaluated with the arithmetic–geometric mean. At zero release amplitude the theoretical value is a limiting period, not an observed oscillation.
- Changing a physical parameter or placing/dragging the bob must reset the current period tracker and energy experiment. Existing completed observations may be retained with their original configurations. Camera changes and playback-rate changes must not reset physical state.
- Gravity estimation fits measured T² against L by ordinary least squares with a free intercept, then calculates g = 4π²/slope. Interpretation requires zero damping, small and consistently controlled release amplitude, and the same gravity across the fitted trials. The numerical helper cannot enforce those UI-level grouping rules.

## Independent checks supplied

`tests/physics.test.ts` checks finite/domain validation, restoring-force sign, equilibrium, a hand-derived 1 m Earth period, four finite-amplitude periods against independent Simpson quadrature, mass independence, square-root scaling, undamped energy drift, damped energy balance, RK4 timestep convergence against the analytic small-angle limit, the damped analytic limit, simulated-time batching, crossing direction/interpolation and least-squares gravity inference. Test outcomes must be obtained by executing the suite; this file alone is not a passed report. The checks do not certify rendered geometry, interaction, performance on classroom devices, accessibility or learning outcomes.

### Executed domain verification

On 14 November 2026, `npm test -- --reporter=verbose` executed successfully with **21 of 21 tests passing** in the managed Linux workspace, Node 24.22.1 and Vitest 3.2.4 (reported suite duration 1.06 s). This includes the allowed low-gravity overdamped case, which produces no false complete cycles.

Additional deterministic Node probes of the same core measured:

| Probe | Conditions | Result |
| --- | --- | --- |
| Maximum relative undamped energy drift | L = 0.25 m; g = 25 m/s²; release 80°; 120 simulated s | 1.272115 × 10⁻⁶ |
| Maximum relative E + Q balance error | Same apparatus; γ = 0.45 s⁻¹; 30 simulated s | 3.162464 × 10⁻⁸ |
| First observed full-cycle period | L = 1 m; g = 9.81 m/s²; release 80°; γ = 0 | 2.2818859413 s |
| Undamped finite-amplitude reference | Same 80° conditions; AGM evaluation | 2.2818859240 s |

Source SHA-256 at this check:

- `src/physics.ts`: `cc6374bd7f1b9342cb3f7d2bdb9af568655f441c6d553084d49a7b29ab574fe2`
- `tests/physics.test.ts`: `3bf40f43f18d52de8f69b6d1ea00b7f384e88a71c21cdd4e08e438b0d862d485`

These are domain-only results. Full application/browser verification belongs to the final assembled build. A small-angle gravity fit still carries amplitude bias: about 0.38% low at a fixed 10° release, or about 0.095% low at 5°, before timing/length rounding. This is physical approximation error, not integrator drift.

## Sources inspected on 14 November 2026

1. **OpenStax, University Physics Volume 1, §15.4 “Pendulums.”** Nonlinear restoring equation, assumptions, small-angle approximation and g = 4π²L/T². <https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums>
2. **Russ Tedrake, MIT, Underactuated Robotics, “The Simple Pendulum.”** Generalized torque equation mL²θ̈ + mgL sin θ = −bθ̇ + u. Our γ = b/(mL²). <https://underactuated.mit.edu/pend.html>
3. **National University of Singapore, “Asking difficult questions with a numerical model.”** Nonlinear linear-damping convention θ̈ = −(g/L) sin θ − γθ̇, γ in s⁻¹, and limitations relative to dry friction and nonlinear drag. <https://sps.nus.edu.sg/sp3176.reloaded/docs/activity-01/week-03/is-modelling.html>
4. **NIST Digital Library of Mathematical Functions, §19.8(i), equations 19.8.1 and 19.8.5.** Arithmetic–geometric mean iteration and K(k) = π/[2 AGM(1,k′)]. <https://dlmf.nist.gov/19.8>
5. **MIT OpenCourseWare, M. Williams, Lecture 4 “Damped Oscillations,” Summer 2017.** Pendulum kinetic/potential energy and loss power; its convention uses 2γ, unlike the app's γ. <https://ocw.mit.edu/courses/res-8-009-introduction-to-oscillations-and-waves-summer-2017/mitres_8_009su17_lec4.pdf>

The finite-amplitude period follows by conservation of energy for γ = 0 and the substitution sin(θ/2) = sin(θ₀/2) sin φ. No formula for an undamped period is presented as a damped measurement.
