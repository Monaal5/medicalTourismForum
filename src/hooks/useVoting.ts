import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface VoteData {
  voteCount: number;
  userVote: 'upvote' | 'downvote' | null;
  upvotes: number;
  downvotes: number;
}

export function useVoting(targetId: string, targetType: 'post' | 'comment' | 'answer') {
  const { user } = useUser();
  const [voteData, setVoteData] = useState<VoteData>({
    voteCount: 0,
    userVote: null,
    upvotes: 0,
    downvotes: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetId && user) {
      fetchVotes();
    }
  }, [targetId, user]);

  const fetchVotes = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/votes?targetId=${targetId}&targetType=${targetType}&userId=${user.id}`
      );
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching votes:', data.error);
      } else {
        setVoteData(data);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const vote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          voteType,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userFullName: user.fullName,
          userImageUrl: user.imageUrl,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error voting:', data.error);
      } else {
        // Update local state optimistically
        const newVoteData = { ...voteData };
        
        if (data.action === 'removed') {
          newVoteData.userVote = null;
          newVoteData.voteCount = voteData.voteCount + (voteData.userVote === 'upvote' ? -1 : 1);
        } else if (data.action === 'updated') {
          newVoteData.userVote = voteType;
          newVoteData.voteCount = voteData.voteCount + (voteData.userVote === 'upvote' ? -2 : 2);
        } else if (data.action === 'created') {
          newVoteData.userVote = voteType;
          newVoteData.voteCount = voteData.voteCount + (voteType === 'upvote' ? 1 : -1);
        }

        setVoteData(newVoteData);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...voteData,
    loading,
    vote,
    canVote: !!user,
  };
}