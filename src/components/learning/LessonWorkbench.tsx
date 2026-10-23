import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  lab: ReactNode;
  name?: string;
};

/**
 * Desktop: two independently-scrollable panels: short lab guide, and the original lab.
 * Mobile/tablet: normal document scrolling, with lab guide followed by the lab.
 * The lab is mounted exactly once; its state, math, and pointer interactions are unchanged.
 */
export default function LessonWorkbench({ children, lab, name = "Live experiment" }: Props) {
  return (
    <section className="javs-workbench" id="workbench" aria-label={`${name} workbench`}>
      <div className="javs-workbench-head">
        <div><span className="javs-workbench-small-index">02</span> / INTERACTIVE WORKBENCH</div>
        <div className="javs-workbench-head-right"><span className="javs-workbench-live" /> LAB GUIDE + LIVE EXPERIMENT</div>
      </div>
      <div className="javs-workbench-grid">
        <div className="javs-workbench-reading" id="javs-workbench-reading" tabIndex={0} aria-label="Lab guide; scroll independently">
          <div className="javs-workbench-reading-inner">
            <div className="javs-pane-eyebrow"><span>01</span> LAB GUIDE / PRACTICE MISSIONS <span aria-hidden="true">↕</span></div>
            {children}
            <div className="javs-reading-end">END OF LAB GUIDE <span>✦</span></div>
          </div>
        </div>
        <div className="javs-workbench-lab" id="javs-workbench-lab" tabIndex={0} aria-label="Live experiment; scroll independently">
          <div className="javs-workbench-lab-inner">
            <div className="javs-pane-eyebrow"><span>02</span> LIVE / EXPERIMENT <span className="javs-panel-live-dot" /></div>
            {lab}
          </div>
        </div>
      </div>
      <div className="javs-workbench-footer">
        <span>SCROLL EACH PANEL INDEPENDENTLY ↕</span>
        <span>FOLLOW GUIDE &nbsp; ↔ &nbsp; EXPERIMENT</span>
      </div>
    </section>
  );
}
