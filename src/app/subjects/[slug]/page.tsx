import MLCourseCatalog from "@/components/learning/MLCourseCatalog";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { subjects, findSubject } from "@/lib/subject-catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return subjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const subject = findSubject(slug);
  return subject ? { title: subject.title, description: subject.description } : {};
}

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const subject = findSubject(slug);
  if (!subject) notFound();

  return (
    <main className="jav-catalog-page">
      <div className="jav-shell">
        <Link href="/#subjects" className="jav-back-link">← ALL SUBJECTS</Link>
        <div className="jav-catalog-head">
          <div>
            <span className="jav-catalog-kicker">{subject.number} / {subject.category}</span>
            <h1>{subject.title}<span>.</span></h1>
            <p>{subject.description}</p>
          </div>
          <div className="jav-catalog-art"><Image src={subject.artwork} alt="" fill sizes="300px" /></div>
        </div>
        <div className="jav-catalog-section-title"><span>LESSONS & EXPERIMENTS</span><span>{String(subject.lessons.length).padStart(2,"0")} AVAILABLE</span></div>
        {subject.slug === "ml" ? (
          <MLCourseCatalog />
        ) : subject.lessons.length > 0 ? (
          <div className="jav-catalog-lessons">
            {subject.lessons.map((lesson, index) => (
              <Link key={lesson.href} href={lesson.href} className="jav-catalog-lesson">
                <span className="jav-lesson-index">{String(index + 1).padStart(2,"0")}</span>
                <div><h2>{lesson.title}</h2><p>{lesson.description}</p></div>
                <span className="jav-catalog-arrow">↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="jav-empty-state">
            <span>IN PREPARATION / {subject.slug.toUpperCase()}</span>
            <h2>Something interesting is taking shape.</h2>
            <p>Lessons for this subject are coming. In the meantime, explore our first interactive experiment.</p>
            <Link href="/learn/ml/gradient-descent">Open Gradient Descent ↗</Link>
          </div>
        )}
        <div className="jav-catalog-foot"><Link href="/#subjects">← Explore more subjects</Link></div>
      </div>
    </main>
  );
}
