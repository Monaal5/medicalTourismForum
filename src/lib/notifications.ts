
import { supabaseAdmin as supabase } from "@/lib/supabase";

type NotificationType = 'follow' | 'answer' | 'comment' | 'reply' | 'vote';

interface CreateNotificationParams {
    recipientId: string;
    senderId: string;
    type: NotificationType;
    questionId?: string;
    postId?: string;
    answerId?: string;
    commentId?: string;
    link?: string; // Optional direct link if structure differs
}

export async function createNotification({
    recipientId,
    senderId,
    type,
    questionId,
    postId,
    answerId,
    commentId
}: CreateNotificationParams) {
    if (recipientId === senderId) return; // Don't notify self

    try {
        console.log(`Creating notification: ${type} from ${senderId} to ${recipientId}`);
        const { error } = await supabase
            .from('notifications')
            .insert({
                recipient_id: recipientId,
                sender_id: senderId,
                type,
                question_id: questionId,
                post_id: postId,
                answer_id: answerId,
                comment_id: commentId,
                read: false
            });

        if (error) {
            console.error("Error creating notification:", error);
        }
    } catch (error) {
        console.error("Exception creating notification:", error);
    }
}
