import React from "react";
import QuestionDetailPage from "@/components/QuestionDetailPage";
import { getQuestionById } from "@/lib/db/queries";

export const revalidate = 0; // Disable caching for this page
export const dynamic = 'force-dynamic'; // Always fetch fresh data

interface QuestionPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    answer?: string;
  }>;
}

export default async function QuestionPage({
  params,
  searchParams,
}: QuestionPageProps) {
  const { id: questionId } = await params;
  const { answer } = await searchParams;
  const shouldAutoFocusAnswer = answer === "true";

  let question: any | null = null;

  try {
    question = await getQuestionById(questionId);

    // Adapting fields if necessary to match component expectations
    if (question) {
      question.answerCount = question.answers?.length || 0;
      // Ensure answers is an array
      question.answers = question.answers || [];
      // Maps fields if missing (Supabase mapQuestion handles most)
    }

  } catch (error) {
    console.error("Error fetching question:", error);
  }

  return (
    <QuestionDetailPage
      questionId={questionId}
      initialQuestion={question ?? undefined}
      autoFocusAnswer={shouldAutoFocusAnswer}
    />
  );
}
