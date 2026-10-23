"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import GradientDescentLab from "@/components/labs/GradientDescentLab";
import GradientDescentQuiz from "@/components/learning/GradientDescentQuiz";
import "./gradient-descent-workbench.css";

type ResourceTab = "guide" | "quiz" | "summary";
const TABS: { key: ResourceTab; label: string; short: string }[] = [
  { key: "guide", label: "Lab guide", short: "01" },
  { key: "quiz", label: "Quiz", short: "02" },
  { key: "summary", label: "Summary", short: "03" },
];

/** Lesson-specific companion to the existing workbench layout.
 *  The original GradientDescentLab is rendered once, without altering its internals.
 *  All textbook theory lives in gradient-descent.mdx above this component.
 */
export default function GradientDescentWorkbench() {
  const [active, setActive] = useState<ResourceTab>("guide");
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  function handleTabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setActive(TABS[next].key);
    tabsRef.current[next]?.focus();
  }

  return (
    <section className="javs-workbench jml10-workbench" id="workbench" aria-label="Gradient descent interactive workbench">
      <div className="javs-workbench-head">
        <div><span className="javs-workbench-small-index">10</span> / INTERACTIVE WORKBENCH</div>
        <div className="javs-workbench-head-right"><span className="javs-workbench-live" /> LAB + PRACTICE</div>
      </div>
      <div className="javs-workbench-grid">
        <aside className="javs-workbench-reading" id="javs-workbench-reading" tabIndex={0} aria-label="Lab guide, quiz, key takeaways and references">
          <div className="javs-workbench-reading-inner">
            <div className="javs-pane-eyebrow"><span>01</span> PRACTICE / RECAP <span aria-hidden="true">↕</span></div>
            <div className="jml10-tablist" role="tablist" aria-label="Learning resources">
              {TABS.map((item, index) => (
                <button
                  type="button"
                  key={item.key}
                  id={`jml10-tab-${item.key}`}
                  role="tab"
                  ref={el => { tabsRef.current[index] = el; }}
                  aria-selected={active === item.key}
                  aria-controls={`jml10-panel-${item.key}`}
                  tabIndex={active === item.key ? 0 : -1}
                  className={active === item.key ? "jml10-tab is-active" : "jml10-tab"}
                  onClick={() => setActive(item.key)}
                  onKeyDown={event => handleTabKeys(event, index)}
                >
                  <span>{item.short}</span> {item.label}
                </button>
              ))}
            </div>

            <div id="jml10-panel-guide" role="tabpanel" aria-labelledby="jml10-tab-guide" hidden={active !== "guide"} className="jml10-panel">
              <h3 className="jml10-panel-title">Six quick experiments<span className="jml10-accent">.</span></h3>
              <p className="jml10-intro">Use the original playground on the right. Each mission tests one idea from the chapter above.</p>
              <ol className="jml10-missions">
                <li><strong>Verify an update</strong><span>Choose <code>x^2</code>, start at <code>3</code>, set the rate to <code>0.20</code>, and step three times. Compare with the worked table.</span></li>
                <li><strong>Change the learning rate</strong><span>Try <code>0.05</code>, <code>0.20</code>, <code>0.75</code>, <code>1.00</code>, and <code>1.20</code>. Which settings converge or diverge?</span></li>
                <li><strong>Change the starting point</strong><span>Use Double well at <code>-0.5</code>, <code>0</code>, and <code>0.5</code>. Why do the outcomes differ?</span></li>
                <li><strong>Read the derivative</strong><span>Enable the tangent. Predict the next direction from the sign of the slope before taking a step.</span></li>
                <li><strong>Explore a nonconvex function</strong><span>Use Wave with a small rate, change the starting point, and compare the path.</span></li>
                <li><strong>Design your own</strong><span>Enter <code>x^2 + 2*x + 3</code>. Predict the minimizing x, then check by stepping.</span></li>
              </ol>
              <p className="jml10-help">Tip: <strong>Undo</strong> revisits a step; <strong>Reset</strong> starts again without losing the lesson.</p>
            </div>

            <div id="jml10-panel-quiz" role="tabpanel" aria-labelledby="jml10-tab-quiz" hidden={active !== "quiz"} className="jml10-panel">
              <h3 className="jml10-panel-title">Knowledge check<span className="jml10-accent">.</span></h3>
              <p className="jml10-intro">Seven short questions. Submit to see explanations, then try again if needed.</p>
              <GradientDescentQuiz />
            </div>

            <div id="jml10-panel-summary" role="tabpanel" aria-labelledby="jml10-tab-summary" hidden={active !== "summary"} className="jml10-panel">
              <h3 className="jml10-panel-title">Key takeaways<span className="jml10-accent">.</span></h3>
              <ul className="jml10-takeaways">
                <li>Gradient descent adjusts <strong>parameters</strong> to lower an objective.</li>
                <li>A step moves in the <strong>opposite direction</strong> of the gradient.</li>
                <li>The <strong>learning rate</strong> controls stability and speed.</li>
                <li>A zero gradient means <strong>stationary</strong>, not necessarily optimal.</li>
                <li>Batch, stochastic and mini-batch methods use <strong>different numbers of samples</strong> per update.</li>
                <li>Scaling features and checking validation performance matter in real training.</li>
              </ul>
              <div className="jml10-reference">
                <h4>Textbook reference</h4>
                <p>Aurélien Géron, <em>Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow</em>, 3rd edition, O'Reilly, Chapter 4, pp. 138–149.</p>
                <p>Sections: Gradient Descent, Batch Gradient Descent, Stochastic Gradient Descent, Mini-Batch Gradient Descent.</p>
                <p className="jml10-reference-note">Original Jav's Lab explanations and experiments; no textbook figures or text reproduced.</p>
              </div>
            </div>
          </div>
        </aside>
        <div className="javs-workbench-lab" id="javs-workbench-lab" tabIndex={0} aria-label="Original interactive gradient descent playground">
          <div className="javs-workbench-lab-inner">
            <div className="javs-pane-eyebrow"><span>02</span> LIVE / GRADIENT DESCENT LAB <span className="javs-panel-live-dot" /></div>
            <GradientDescentLab />
          </div>
        </div>
      </div>
      <div className="javs-workbench-footer">
        <span>LAB GUIDE · QUIZ · SUMMARY</span>
        <span>READ ABOVE &nbsp; ↔ &nbsp; EXPERIMENT BELOW</span>
      </div>
    </section>
  );
}
