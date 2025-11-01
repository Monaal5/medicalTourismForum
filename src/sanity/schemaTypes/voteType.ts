import { defineField, defineType } from "sanity";

export const voteType = defineType({
  name: 'vote',
  title: 'Vote',
  type: 'document',
  icon: () => '👍',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
      description: 'The user who cast this vote'
    }),
    defineField({
      name: 'voteType',
      title: 'Vote Type',
      type: 'string',
      options: {
        list: [
          { title: 'Upvote', value: 'upvote' },
          { title: 'Downvote', value: 'downvote' }
        ]
      },
      validation: (Rule) => Rule.required(),
      description: 'Whether this is a vote on a post or comment'
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
    
      description: 'The post being voted on (only for post votes)'
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'reference',
      to: [{ type: 'comment' }],
     
      description: 'The comment being voted on (only for comment votes)'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
      description: 'When this vote was cast'
    })
  ],
  preview: {
    select: {
      voteType: 'voteType',
      postTitle: 'post.postTitle',
      commentTitle: 'comment.comment',
      username: 'user.username',
    },
    prepare({ voteType, postTitle, commentTitle, username }) {
      return {
        title: `${voteType === 'upvote' ? '↑' : '↓'} by ${username || 'Unknown'}`,
        subtitle: postTitle || commentTitle || 'No target',
      }
    }
  },
  validation: (Rule) => Rule.custom((doc) => {
    if(doc?.post && doc?.comment) {
      return 'Only one of post or comment should be selected';
    }
    if(!doc?.post && !doc?.comment) {
      return 'Must vote on a post or comment';
    }
    return true;
  }),
})
