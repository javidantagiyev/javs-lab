import Link from "next/link";
import DigitalRain from "@/components/home/DigitalRain";
import SubjectGrid from "@/components/home/SubjectGrid";
import Reveal from "@/components/home/Reveal";

export default function HomePage() {
  return (
    <main className="jav-home">
      <section className="jav-hero" aria-labelledby="jav-hero-title">
        <DigitalRain />
        <div className="jav-hero-glass" aria-hidden="true" />
        <div className="jav-shell jav-hero-content">
          <div className="jav-eyebrow"><span className="jav-live-dot" /> A LIVING LIBRARY OF IDEAS</div>
          <div className="jav-hero-copy">
            <h1 id="jav-hero-title">Jav&apos;s Lab<span className="jav-period">.</span></h1>
            <p className="jav-hero-lead">Learn the theory.<br /><span>Touch the mathematics.</span></p>
            <p className="jav-hero-description">
              An interactive space for artificial intelligence, machine learning, and mathematics.
              Less memorization. More understanding.
            </p>
            <div className="jav-hero-actions">
              <Link className="jav-primary-button" href="#subjects">Explore the lab <span aria-hidden="true">↘</span></Link>
              <Link className="jav-secondary-link" href="/learn/ml/gradient-descent">Try Gradient Descent <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <div className="jav-hero-footerline">
            <span>IDEAS / VISUALIZATION / EXPERIMENT</span>
            <a href="#subjects" className="jav-scroll-cue" aria-label="Scroll down to subjects">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a>
            <span className="jav-hero-index">001—004</span>
          </div>
        </div>
      </section>

      <SubjectGrid />

      <section id="about" className="jav-manifesto" aria-labelledby="jav-about-heading">
        <div className="jav-shell">
          <Reveal>
            <div className="jav-section-topline"><span><span className="jav-muted-index">02</span> / WHY JAV&apos;S LAB</span><span>BUILT TO BE EXPLORED</span></div>
            <div className="jav-manifesto-content">
              <h2 id="jav-about-heading">Understanding starts<br />when ideas <em>move.</em></h2>
              <p>Read the concept. Manipulate the variables. Watch the result change. Every lesson is a place to discover, not just a page to finish.</p>
            </div>
            <div className="jav-principles">
              <div><span>01</span><strong>Read</strong><p>Clear explanations, one concept at a time.</p></div>
              <div><span>02</span><strong>Interact</strong><p>Real experiments with controls you can change.</p></div>
              <div><span>03</span><strong>Understand</strong><p>Build intuition by seeing what happens.</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="jav-footer">
        <div className="jav-shell">
          <div className="jav-footer-top">
            <div><span className="jav-footer-kicker">AN OPEN LABORATORY FOR CURIOUS MINDS</span><h2>Keep exploring<span>.</span></h2></div>
            <Link href="#subjects" className="jav-footer-button">Back to subjects <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="jav-footer-bottom">
            <span>© {new Date().getFullYear()} JAV&apos;S LAB</span>
            <span>LEARN / EXPERIMENT / UNDERSTAND</span>
            <Link href="#top">BACK TO TOP ↑</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
