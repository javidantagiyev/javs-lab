import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLesson, lessons } from "@/lib/lessons";
import LessonLayout from "@/components/learning/LessonLayout";

type Props = { params: Promise<{ subject: string; topic: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return lessons.map(({ subject, topic }) => ({ subject, topic }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject, topic } = await params;
  const lesson = getLesson(subject, topic);
  return lesson ? { title: `${lesson.title} | Jav's Lab`, description: lesson.description } : {};
}

export default async function LessonPage({ params }: Props) {
  const { subject, topic } = await params;
  const lesson = getLesson(subject, topic);
  if (!lesson) notFound();
  const { default: Content } = await lesson.content();
  return (
    <LessonLayout title={lesson.title} description={lesson.description} subject={lesson.subject} difficulty={lesson.difficulty}>
      <Content />
    </LessonLayout>
  );
}
