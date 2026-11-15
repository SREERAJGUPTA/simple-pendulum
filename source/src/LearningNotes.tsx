import { useState } from 'react';

type Question = {
  number: string;
  title: string;
  prompt: string;
  options: string[];
  correct: number;
  correctText: string;
  retryText: string;
};

const questions: Question[] = [
  {
    number: '01',
    title: 'Twice as long. Twice as slow?',
    prompt: 'Keep gravity the same, use a small release angle and no damping. Double the length. What happens to the period?',
    options: ['It stays the same', 'It becomes √2 times as long', 'It becomes twice as long'],
    correct: 1,
    correctText: 'Yes. T grows with √L. Doubling the length multiplies the period by √2 ≈ 1.41; quadrupling the length doubles it.',
    retryText: 'Compare two lengths in the lab. The period depends on the square root of length, so a twofold change in length is not a twofold change in period. Try again.',
  },
  {
    number: '02',
    title: 'Take your pendulum to the Moon.',
    prompt: 'Keep its length and release angle unchanged. With weaker gravity, will it complete a swing sooner or later?',
    options: ['Sooner', 'Later', 'At the same time'],
    correct: 1,
    correctText: 'Later. Weaker gravity produces a smaller restoring acceleration. At small angles, T is proportional to 1/√g.',
    retryText: 'Gravity pulls the bob back toward equilibrium. A weaker gravitational field makes that return slower. Choose again, then test the Moon preset.',
  },
  {
    number: '03',
    title: 'A pause in speed. A pause in force?',
    prompt: 'At a turning point away from the bottom, the bob is momentarily at rest. Is its acceleration also zero?',
    options: ['Yes, both are zero', 'No, it accelerates toward the bottom'],
    correct: 1,
    correctText: 'Correct. Speed is zero for an instant, but the tangential component of gravity is not. That acceleration starts the return swing.',
    retryText: 'If acceleration were also zero, what would start the bob moving back? At a nonzero angle, gravity still has a component along the arc. Try again.',
  },
];

function PredictionCard({ question }: { question: Question }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const correct = answer === question.correct;
  return (
    <article className="question-card">
      <span className="card-number" aria-hidden="true">{question.number}</span>
      <h3>{question.title}</h3>
      <fieldset>
        <legend>{question.prompt}</legend>
        <div className="choice-row">
          {question.options.map((option, index) => (
            <button
              type="button"
              key={option}
              className={answer === index ? 'choice-button selected' : 'choice-button'}
              aria-pressed={answer === index}
              onClick={() => setAnswer(index)}
            >{option}</button>
          ))}
        </div>
      </fieldset>
      <div className={`feedback${answer === null ? ' feedback-idle' : correct ? ' feedback-correct' : ' feedback-retry'}`} aria-live="polite" aria-atomic="true">
        {answer === null ? 'Make a prediction. Then take it to the lab.' : correct ? question.correctText : question.retryText}
      </div>
    </article>
  );
}

function LengthDiagram() {
  return (
    <svg className="note-diagram" viewBox="0 0 220 135" role="img" aria-label="Pendulum length runs from the fixed pivot to the centre of the bob, including the bob's radius.">
      <defs><marker id="length-arrow-notes" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0 0 L5 2.5 L0 5" fill="currentColor" /></marker></defs>
      <line x1="53" y1="16" x2="108" y2="16" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      <line x1="80" y1="18" x2="123" y2="108" stroke="currentColor" strokeWidth="1.6" />
      <line x1="80" y1="18" x2="80" y2="121" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.25" />
      <circle cx="80" cy="18" r="3.5" fill="currentColor" />
      <circle cx="123" cy="108" r="14" fill="#c3a05a" fillOpacity="0.25" stroke="#a38145" strokeWidth="1.5" />
      <circle cx="123" cy="108" r="2.5" fill="#a38145" />
      <line x1="98" y1="15" x2="141" y2="105" stroke="currentColor" strokeWidth="1" markerStart="url(#length-arrow-notes)" markerEnd="url(#length-arrow-notes)" opacity="0.6" />
      <text x="131" y="58" fontSize="13" fontStyle="italic" fill="currentColor">L</text>
      <line x1="135" y1="108" x2="163" y2="108" stroke="currentColor" opacity="0.3" />
      <text x="168" y="111" fontSize="10" fill="currentColor">centre</text>
    </svg>
  );
}

export function LearningNotes() {
  return (
    <section className="notes-section" id="field-notes" aria-labelledby="notes-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">03 / FIELD NOTES</p>
          <h2 className="section-title" id="notes-title">The science inside a swing.</h2>
        </div>
        <p className="section-intro">A few careful observations turn a familiar motion into a way of measuring the world.</p>
      </div>

      <div className="notes-grid">
        <article className="note-card">
          <span className="note-eyebrow">THE RIGHT LENGTH</span>
          <LengthDiagram />
          <h3>Pivot to centre.</h3>
          <p>Measure <em>L</em> from the suspension point to the bob’s centre. The string alone is too short.</p>
        </article>
        <article className="note-card">
          <span className="note-eyebrow">THE RIGHT COUNT</span>
          <div className="cycle-illustration" aria-hidden="true"><span>A</span><span>→</span><span>B</span><span>→</span><span>A</span></div>
          <h3>There and back.</h3>
          <p>One oscillation returns to the same position moving in the same direction. From one extreme to the other is only half a cycle.</p>
        </article>
        <article className="note-card">
          <span className="note-eyebrow">THE ENERGY STORY</span>
          <div className="energy-illustration" aria-hidden="true"><span className="potential-label">Height</span><span>⇄</span><span className="kinetic-label">Speed</span></div>
          <h3>Energy changes form.</h3>
          <p>As the bob descends, gravitational potential energy becomes kinetic energy. Damping transfers mechanical energy to the surroundings.</p>
        </article>
      </div>

      <div className="principle-strip">
        <div>
          <p className="section-kicker">THE SMALL-ANGLE CONNECTION</p>
          <p className="formula" aria-label="Period is approximately two pi times the square root of length divided by gravitational acceleration">T ≈ 2π √(L/g)</p>
          <p className="formula-caption"><strong>T</strong> in seconds · <strong>L</strong> in metres · <strong>g</strong> in metres per second squared</p>
        </div>
        <div className="principle-copy">
          <h3>A longer pendulum takes longer.</h3>
          <p>Stronger gravity shortens the period. Changing the bob’s mass alone leaves the ideal undamped period unchanged.</p>
          <p>The formula is an approximation for small swings. This simulator keeps the full sin θ term: larger release angles take longer, even without damping. For a gravity experiment, start at 5° and set damping to zero.</p>
        </div>
      </div>

      <div className="prediction-heading">
        <p className="section-kicker">PREDICT / TEST / EXPLAIN</p>
        <h3>Before you move the slider…</h3>
      </div>
      <div className="prediction-grid">
        {questions.map((question) => <PredictionCard key={question.number} question={question} />)}
      </div>

      <details className="model-details">
        <summary><span>Inside the model</span><span className="details-tag">For the curious</span></summary>
        <div className="model-detail-content">
          <div>
            <h3>Motion, without the small-angle shortcut.</h3>
            <p className="formula formula-small" aria-label="Angular acceleration equals minus gravity divided by length times sine theta, minus gamma times angular velocity">θ̈ = −(g/L) sin θ − γθ̇</p>
            <p>θ is measured from the downward vertical. The damping control γ is an angular damping rate in s⁻¹: it slows motion in proportion to angular velocity. It is a simplified resistance model, not a direct setting for air density.</p>
            <p>The model treats the bob’s mass as concentrated at its centre, with a fixed pivot and a massless, inextensible suspension. Motion stays in one vertical plane. There is no driving force, pivot vibration, string stretch, or Earth-rotation effect.</p>
          </div>
          <div>
            <h3>Keep track of the whole energy account.</h3>
            <p className="formula formula-small">K = ½mL²θ̇² &nbsp; · &nbsp; U = mgL(1 − cos θ)</p>
            <p>Potential energy is zero at the lowest position. During an unchanged free run, mechanical energy plus the accumulated dissipated energy stays constant within numerical accuracy. “Dissipated” is a model calculation of energy transferred out of the moving pendulum.</p>
            <p>Slow motion changes playback speed. The plotted time and measured period remain in simulated seconds; gravity and the equations stay the same.</p>
          </div>
          <div>
            <h3>A virtual result is a starting point.</h3>
            <p>For a real practical, measure to the bob’s centre, release without a push, and time several complete oscillations. Repeat trials and compare the spread. This model adds no artificial stopwatch noise; real measurements also include reaction time, length uncertainty, air resistance, and pivot friction.</p>
            <p>To estimate gravity, plot T² against L under the same small-angle, low-damping conditions. The ideal slope is 4π²/g. A large release angle biases this small-angle estimate.</p>
          </div>
        </div>
      </details>

      <p className="source-links">Model references: <a href="https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums" target="_blank" rel="noopener noreferrer">OpenStax · Pendulums ↗</a><span aria-hidden="true"> / </span><a href="https://openstax.org/books/university-physics-volume-1/pages/15-5-damped-oscillations" target="_blank" rel="noopener noreferrer">Damped oscillations ↗</a><span aria-hidden="true"> / </span><a href="https://underactuated.mit.edu/pend.html" target="_blank" rel="noopener noreferrer">MIT · Nonlinear model ↗</a></p>
    </section>
  );
}
