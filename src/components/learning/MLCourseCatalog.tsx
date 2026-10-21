import Link from "next/link";
import { mlAvailableCount, mlCourse, mlLessonCount } from "@/lib/ml-course";
import "./ml-course-catalog.css";

export default function MLCourseCatalog() {
  return (
    <section className="javs-course" aria-label="Machine Learning course curriculum">
      <div className="javs-course-intro">
        <div>
          <span className="javs-course-overline">THE LEARNING PATH / VOLUME 01</span>
          <h2>One concept <em>at a time.</em></h2>
          <p>Five connected modules. Read the theory, run an experiment, and build the intuition behind the mathematics.</p>
        </div>
        <div className="javs-course-stats" aria-label={`${mlAvailableCount} of ${mlLessonCount} lessons available`}>
          <div><strong>05</strong><span>MODULES</span></div>
          <div><strong>{String(mlLessonCount).padStart(2, "0")}</strong><span>LESSONS</span></div>
          <div><strong>{String(mlAvailableCount).padStart(2, "0")}</strong><span>LIVE NOW</span></div>
        </div>
      </div>
      <div className="javs-course-index" aria-label="Jump to module">
        {mlCourse.map((module) => <a key={module.number} href={`#ml-module-${module.number}`}>
          <span>{String(module.number).padStart(2, "0")}</span><span>{module.title}</span><span aria-hidden="true">↘</span>
        </a>)}
      </div>
      <div className="javs-course-modules">
        {mlCourse.map((module) => {
          const available = module.lessons.filter(lesson => lesson.href).length;
          return <details key={module.number} id={`ml-module-${module.number}`} className="javs-course-module" open={module.number === 1}>
            <summary className="javs-course-module-head">
              <span className="javs-course-module-num">{String(module.number).padStart(2, "0")}</span>
              <span className="javs-course-module-name"><strong>{module.title}</strong><small>{module.subtitle}</small></span>
              <span className="javs-course-module-extra"><span>{available}/{module.lessons.length} LIVE</span><span className="javs-course-module-chapters">{module.chapters}</span></span>
              <span className="javs-course-chevron" aria-hidden="true">+</span>
            </summary>
            <div className="javs-course-progress" aria-label={`${available} of ${module.lessons.length} published`}><span style={{width: `${100 * available / module.lessons.length}%`}} /></div>
            <div className="javs-course-module-lessons">
              {module.lessons.map(lesson => {
                const inner = <>
                  <span className="javs-course-lesson-index">{String(lesson.number).padStart(2, "0")}</span>
                  <span className="javs-course-lesson-main"><strong>{lesson.title}</strong><small>{lesson.description}</small></span>
                  <span className={`javs-course-lesson-status ${lesson.href ? "is-live" : ""}`}>{lesson.href ? "EXPLORE ↗" : "PLANNED"}</span>
                </>;
                return lesson.href ? <Link key={lesson.number} href={lesson.href} className="javs-course-lesson javs-course-lesson-live">{inner}</Link>
                  : <div key={lesson.number} className="javs-course-lesson javs-course-lesson-planned">{inner}</div>;
              })}
            </div>
          </details>;
        })}
      </div>
      <div className="javs-course-final">
        <span>CAPSTONE / AFTER MODULE 05</span>
        <h3>Build your first <em>complete ML system.</em></h3>
        <p>A guided end-to-end project, grounded in Géron’s Chapter 2. Arriving later in this course.</p>
      </div>
      <div className="javs-course-reference">
        <span>ACADEMIC FOUNDATION</span>
        <p>Based on the topics in Aurélien Géron, <em>Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow</em>, 3rd ed. (O’Reilly). Jav’s Lab lessons, diagrams, examples and experiments are independently written.</p>
      </div>
    </section>
  );
}
