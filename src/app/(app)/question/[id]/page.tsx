import React from "react";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import QuestionDetailPage from "@/components/QuestionDetailPage";

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

const questionQuery = defineQuery(`
  *[_type == "question" && _id == $id && !isDeleted][0] {
    _id,
    title,
    description,
    author->{
      _id,
      username,
      imageUrl,
      bio,
      clerkId
    },
    category->{
      name,
      color,
      slug
    },
    tags,
    createdAt,
    updatedAt,
    "answerCount": count(*[_type == "answer" && references(^._id) && !isDeleted]),
    "viewCount": 0,
    "followerCount": 0,
    "isFollowing": false,
    "isBookmarked": false,
    "answers": *[_type == "answer" && references(^._id) && !isDeleted] | order(createdAt desc) {
      _id,
      content,
      author->{
        _id,
        username,
        imageUrl,
        bio,
        clerkId
      },
      createdAt,
      updatedAt,
      "voteCount": coalesce(count(votes[].voteType == "upvote") - count(votes[].voteType == "downvote"), 0),
      "userVote": null,
      "isAccepted": false,
      "commentCount": 0,
      "comments": []
    }
  }
`);

export default async function QuestionPage({
  params,
  searchParams,
}: QuestionPageProps) {
  const { id: questionId } = await params;
  const { answer } = await searchParams;
  const shouldAutoFocusAnswer = answer === "true";

  let question = null;

  try {
    const result = await sanityFetch({
      query: questionQuery,
      params: { id: questionId },
    });
    question = result.data;
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
