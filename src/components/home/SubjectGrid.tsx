import Image from "next/image";
import Link from "next/link";
import { subjects } from "@/lib/subject-catalog";
import Reveal from "./Reveal";

export default function SubjectGrid() {
  return (
    <section className="jav-topics" id="subjects" aria-labelledby="topics-heading">
      <div className="jav-shell">
        <Reveal>
          <div className="jav-section-topline">
            <span><span className="jav-muted-index">01</span> / THE DISCIPLINES</span>
            <span>FOUR WAYS TO SEE THE WORLD</span>
          </div>
          <div className="jav-section-intro">
            <h2 id="topics-heading">Fields of <em>curiosity.</em></h2>
            <p>Select a subject, follow an idea, and see what happens when you experiment with it.</p>
          </div>
        </Reveal>
        <div className="jav-subject-grid">
          {subjects.map((subject, index) => (
            <Reveal key={subject.slug} className="jav-subject-reveal">
              <Link href={`/subjects/${subject.slug}`} className="jav-subject-card" aria-label={`Explore ${subject.title}`}>
                <div className="jav-subject-art">
                  <Image src={subject.artwork} alt={`Abstract mathematical artwork for ${subject.title}`} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw" className="jav-subject-image" />
                  <span className="jav-art-number">{subject.number} / 04</span>
                  <span className="jav-art-arrow" aria-hidden="true">↗</span>
                </div>
                <div className="jav-subject-meta">
                  <div className="jav-subject-heading">
                    <h3>{subject.title}</h3>
                    <span aria-hidden="true">↗</span>
                  </div>
                  <p>{subject.description}</p>
                  <div className="jav-card-footer">
                    <span>{subject.category}</span>
                    <span>{index === 1 ? "01 LESSON" : "COMING SOON"}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
