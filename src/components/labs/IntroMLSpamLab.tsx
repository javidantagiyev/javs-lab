"use client";

import { useMemo, useState, type FormEvent } from "react";
import "./intro-ml-lab.css";

type Label = "spam" | "normal";
type Sample = { id: number; text: string; label: Label };
type Model = {
  labels: Record<Label, number>;
  counts: Record<Label, Map<string, number>>;
  totals: Record<Label, number>;
  vocabulary: Set<string>;
};

const INITIAL_SAMPLES: Sample[] = [
  { id: 1, text: "Claim your free prize today", label: "spam" },
  { id: 7, text: "Team meeting moved to Monday", label: "normal" },
  { id: 2, text: "Limited offer win cash now", label: "spam" },
  { id: 8, text: "Can we meet after class", label: "normal" },
  { id: 3, text: "Congratulations claim your cash reward", label: "spam" },
  { id: 9, text: "Project report is ready for review", label: "normal" },
  { id: 4, text: "Win a free gift card today", label: "spam" },
  { id: 10, text: "Please send the meeting notes", label: "normal" },
  { id: 5, text: "Exclusive offer prize waiting", label: "spam" },
  { id: 11, text: "Family dinner tonight at seven", label: "normal" },
  { id: 6, text: "Urgent claim your reward now", label: "spam" },
  { id: 12, text: "Your appointment is confirmed tomorrow", label: "normal" },
];

// These examples are NEVER used for fitting the model.
const TEST_SAMPLES: Sample[] = [
  { id: 101, text: "Claim your free reward now", label: "spam" },
  { id: 102, text: "Exclusive cash offer just for you", label: "spam" },
  { id: 103, text: "Please review the project notes tomorrow", label: "normal" },
  { id: 104, text: "Meeting confirmed for Monday", label: "normal" },
];

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "at", "be", "by", "can", "for", "from", "in", "is", "it", "of", "on",
  "our", "the", "this", "to", "we", "you", "your", "after", "just",
]);

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(word => !STOP_WORDS.has(word));
}

// A tiny, real multinomial Naive Bayes text classifier with add-one smoothing.
// No external model, API request, or precomputed classification answers.
function fit(samples: Sample[]): Model | null {
  const labels: Record<Label, number> = { spam: 0, normal: 0 };
  const counts: Record<Label, Map<string, number>> = { spam: new Map(), normal: new Map() };
  const totals: Record<Label, number> = { spam: 0, normal: 0 };
  const vocabulary = new Set<string>();

  for (const sample of samples) {
    labels[sample.label]++;
    for (const word of tokens(sample.text)) {
      vocabulary.add(word);
      counts[sample.label].set(word, (counts[sample.label].get(word) ?? 0) + 1);
      totals[sample.label]++;
    }
  }
  if (labels.spam === 0 || labels.normal === 0 || vocabulary.size === 0) return null;
  return { labels, counts, totals, vocabulary };
}

function predict(model: Model, text: string): { label: Label; probability: number; recognized: string[] } {
  const all = model.labels.spam + model.labels.normal;
  const recognized = tokens(text).filter(word => model.vocabulary.has(word));
  const scores = (["spam", "normal"] as const).map(label => {
    // Class prior and word likelihoods are Laplace-smoothed.
    let score = Math.log((model.labels[label] + 1) / (all + 2));
    const denominator = model.totals[label] + model.vocabulary.size;
    for (const word of recognized) {
      score += Math.log(((model.counts[label].get(word) ?? 0) + 1) / denominator);
    }
    return score;
  });
  const maxScore = Math.max(...scores);
  const spam = Math.exp(scores[0] - maxScore);
  const normal = Math.exp(scores[1] - maxScore);
  const probability = spam / (spam + normal);
  return { label: probability >= .5 ? "spam" : "normal", probability, recognized };
}

// An intentionally rigid traditional program: it has no training step.
function rulePrediction(text: string): Label {
  return /\b(free|win)\b/i.test(text) ? "spam" : "normal";
}

function accuracy(model: Model, samples: Sample[], method: "model" | "rules") {
  const correct = samples.filter(sample =>
    (method === "model" ? predict(model, sample.text).label : rulePrediction(sample.text)) === sample.label,
  ).length;
  return { correct, total: samples.length };
}

function learnedWords(model: Model, label: Label) {
  const vocabSize = model.vocabulary.size;
  const words = Array.from(model.vocabulary, word => {
    const spamP = ((model.counts.spam.get(word) ?? 0) + 1) / (model.totals.spam + vocabSize);
    const normalP = ((model.counts.normal.get(word) ?? 0) + 1) / (model.totals.normal + vocabSize);
    return { word, score: Math.log(spamP / normalP) };
  });
  words.sort((a, b) => label === "spam" ? b.score - a.score : a.score - b.score);
  return words.filter(item => label === "spam" ? item.score > 0 : item.score < 0).slice(0, 4);
}

const EXAMPLES = [
  "Claim your free reward now",
  "Meeting confirmed for Monday",
  "Exclusive cash offer just for you",
];

export default function IntroMLSpamLab() {
  const [samples, setSamples] = useState<Sample[]>(INITIAL_SAMPLES);
  const [model, setModel] = useState<Model | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState(EXAMPLES[0]);
  const [newMessage, setNewMessage] = useState("");
  const [newLabel, setNewLabel] = useState<Label>("spam");
  const [showAdd, setShowAdd] = useState(false);
  const [trainedOnce, setTrainedOnce] = useState(false);

  const hasBothLabels = samples.some(sample => sample.label === "spam") && samples.some(sample => sample.label === "normal");
  const result = useMemo(() => model ? predict(model, message) : null, [model, message]);
  const heldOut = useMemo(() => model ? accuracy(model, TEST_SAMPLES, "model") : null, [model]);
  const ruleResult = rulePrediction(message);
  const rulesAccuracy = model ? accuracy(model, TEST_SAMPLES, "rules") : null;

  function changeLabel(id: number) {
    setSamples(previous => previous.map(sample => sample.id === id
      ? { ...sample, label: sample.label === "spam" ? "normal" : "spam" } : sample));
    setModel(null);
  }

  function addSample(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newMessage.trim();
    if (text.length < 3 || text.length > 200) return;
    setSamples(previous => [...previous, { id: Math.max(...previous.map(s => s.id)) + 1, text, label: newLabel }]);
    setNewMessage("");
    setShowAdd(false);
    setExpanded(true);
    setModel(null);
  }

  function reset() {
    setSamples(INITIAL_SAMPLES);
    setModel(null);
    setTrainedOnce(false);
    setExpanded(false);
    setMessage(EXAMPLES[0]);
    setNewMessage("");
    setShowAdd(false);
  }

  return (
    <div className="intro-ml-lab" aria-label="Train your own spam detector">
      <header className="intro-ml-lab-top">
        <div>
          <p className="intro-ml-eyebrow">01 / LEARNING FROM EXAMPLES</p>
          <h3>Teach the machine<span>.</span></h3>
          <p className="intro-ml-lab-subtitle">A miniature spam filter you can actually train.</p>
        </div>
        <div className="intro-ml-live-tag"><span /> LOCAL SIMULATION</div>
      </header>

      <div className="intro-ml-flow" aria-label="Machine learning workflow">
        <span><b>01</b> LABEL DATA</span><i aria-hidden="true">→</i><span><b>02</b> TRAIN MODEL</span><i aria-hidden="true">→</i><span><b>03</b> TEST UNSEEN EMAIL</span>
      </div>

      <div className="intro-ml-lab-columns">
        <section className="intro-ml-lab-card intro-ml-training" aria-labelledby="intro-train-heading">
          <div className="intro-ml-card-heading">
            <div><span className="intro-ml-index">TRAINING SET</span><h4 id="intro-train-heading">Labeled emails</h4></div>
            <span className="intro-ml-mini-count">{samples.length} samples</span>
          </div>
          <p className="intro-ml-help">Change a label to teach the model something different.</p>
          <div className="intro-ml-sample-list">
            {(expanded ? samples : samples.slice(0, 6)).map(sample => (
              <div className="intro-ml-sample" key={sample.id}>
                <span title={sample.text} className="intro-ml-sample-text">{sample.text}</span>
                <button type="button" onClick={() => changeLabel(sample.id)}
                  aria-label={`Change label of ${sample.text}; currently ${sample.label}`}
                  className={`intro-ml-label intro-ml-label-${sample.label}`}>
                  {sample.label === "spam" ? "SPAM" : "NORMAL"}<span aria-hidden="true"> ↕</span>
                </button>
              </div>
            ))}
          </div>
          <div className="intro-ml-row-controls">
            <button type="button" className="intro-ml-quiet" onClick={() => setExpanded(old => !old)}>
              {expanded ? "Show fewer" : `Show all ${samples.length}`}
            </button>
            <button type="button" className="intro-ml-quiet" onClick={() => setShowAdd(old => !old)} aria-expanded={showAdd}>
              {showAdd ? "Close" : "+ Add example"}
            </button>
          </div>
          {showAdd && (
            <form className="intro-ml-add" onSubmit={addSample}>
              <label htmlFor="intro-add-email">New labeled training email</label>
              <input id="intro-add-email" value={newMessage} onChange={event => setNewMessage(event.target.value)} maxLength={200} placeholder="Write an email..." required minLength={3} />
              <div className="intro-ml-add-row">
                <select value={newLabel} onChange={event => setNewLabel(event.target.value as Label)} aria-label="New example label">
                  <option value="spam">Spam</option><option value="normal">Normal</option>
                </select>
                <button type="submit">Add to training set</button>
              </div>
            </form>
          )}
          <button type="button" className="intro-ml-train-btn" disabled={!hasBothLabels} onClick={() => { setModel(fit(samples)); setTrainedOnce(true); }}>
            {model ? "↻  RETRAIN MODEL" : "▶  TRAIN MODEL"}
          </button>
          <div className="intro-ml-training-bottom">
            <span className={model ? "intro-ml-state-ready" : ""}>{model ? "● Model trained" : !hasBothLabels ? "○ Need both spam and normal labels" : trainedOnce ? "○ Labels changed — retrain" : "○ Not trained yet"}</span>
            <button type="button" onClick={reset} className="intro-ml-quiet">Reset data</button>
          </div>
        </section>

        <section className="intro-ml-lab-card intro-ml-predict" aria-labelledby="intro-test-heading">
          <div className="intro-ml-card-heading">
            <div><span className="intro-ml-index">INFERENCE</span><h4 id="intro-test-heading">Unseen email</h4></div>
            <span className="intro-ml-mini-count">Try a new message</span>
          </div>
          <label className="intro-ml-field-label" htmlFor="intro-ml-message">What should the classifier predict?</label>
          <textarea id="intro-ml-message" rows={3} spellCheck={false} maxLength={260}
            value={message} onChange={event => setMessage(event.target.value)} />
          <div className="intro-ml-presets" aria-label="Example emails">
            {EXAMPLES.map((item, index) => <button type="button" key={item} onClick={() => setMessage(item)} className={message === item ? "is-active" : ""}>
              EXAMPLE {index + 1}
            </button>)}
          </div>
          <div className="intro-ml-predictions" aria-live="polite">
            <div className="intro-ml-prediction-row">
              <div><span className="intro-ml-prediction-title">FIXED RULES</span><span className="intro-ml-rule-description">Contains “free” or “win”</span></div>
              <span className={`intro-ml-answer intro-ml-answer-${ruleResult}`}>{ruleResult.toUpperCase()}</span>
            </div>
            <div className="intro-ml-prediction-row intro-ml-model-row">
              <div><span className="intro-ml-prediction-title">LEARNED MODEL</span><span className="intro-ml-rule-description">Learned from your labels</span></div>
              {result ? <span className={`intro-ml-answer intro-ml-answer-${result.label}`}>{result.label.toUpperCase()}</span>
                : <span className="intro-ml-untrained">TRAIN FIRST ↗</span>}
            </div>
            {result && <>
              <div className="intro-ml-meter-label"><span>Model spam probability</span><strong>{Math.round(result.probability * 100)}%</strong></div>
              <div className="intro-ml-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(result.probability * 100)} aria-label="Estimated spam probability">
                <div style={{ width: `${result.probability * 100}%` }} />
              </div>
              <p className="intro-ml-model-footnote">Recognized {result.recognized.length} word{result.recognized.length === 1 ? "" : "s"} from training. Probabilities are illustrative, not calibrated.</p>
            </>}
          </div>
        </section>
      </div>

      <div className="intro-ml-results">
        <div className="intro-ml-eval-stat">
          <span>RULES · HELD-OUT ACCURACY</span>
          <strong>{rulesAccuracy ? `${rulesAccuracy.correct}/${rulesAccuracy.total}` : "—"}</strong>
        </div>
        <div className="intro-ml-eval-stat">
          <span>MODEL · HELD-OUT ACCURACY</span>
          <strong className="intro-ml-gold">{heldOut ? `${heldOut.correct}/${heldOut.total}` : "TRAIN TO SEE"}</strong>
        </div>
        <p>The same four untouched test emails are used to score both approaches.</p>
      </div>

      {model && <details className="intro-ml-learned-details">
        <summary>INSPECT WHAT THE MODEL LEARNED <span>+</span></summary>
        <div className="intro-ml-learned-grid">
          <div><h5>Spam-leaning words</h5><div className="intro-ml-word-cloud">{learnedWords(model, "spam").map(item => <span key={item.word} className="intro-ml-spam-word">{item.word}</span>)}</div></div>
          <div><h5>Normal-leaning words</h5><div className="intro-ml-word-cloud">{learnedWords(model, "normal").map(item => <span key={item.word} className="intro-ml-normal-word">{item.word}</span>)}</div></div>
        </div>
        <p>Words are ranked by their relative likelihood under each class. The model uses all recognized words, not just the displayed examples.</p>
      </details>}
      <div className="intro-ml-method-note">METHOD / Multinomial Naive Bayes · add-one smoothing · trained entirely in your browser. Four separate hold-out messages. No data is transmitted.</div>
    </div>
  );
}
