import { defineField, defineType } from "sanity";

export const commentType = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  icon: () => '💬',
  fields: [
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      
      validation: (Rule) => Rule.required().min(1),
      description: 'The comment content',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
      description: 'The user who wrote this comment'
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      description: 'The post this comment belongs to'
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'reference',
      to: [{ type: 'answer' }],
      description: 'The answer this comment belongs to (for question answers)'
    }),
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'The parent comment if this is a reply (for nested comments)'
    }),
    defineField({
      name: 'isReported',
      title: 'Is Reported',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this comment has been reported'
    }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this comment has been deleted'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
      description: 'When this comment was created'
    })
  ],
  validation: (Rule) => 
    Rule.custom((fields: any) => {
      const hasPost = fields?.post?._ref;
      const hasAnswer = fields?.answer?._ref;
      
      if (!hasPost && !hasAnswer) {
        return 'Comment must be associated with either a post or an answer';
      }
      
      if (hasPost && hasAnswer) {
        return 'Comment cannot be associated with both a post and an answer';
      }
      
      return true;
    }),
  preview: {
    select: {
      title: 'comment',
      subtitle: 'author.username',
    },
    prepare({ title, subtitle }) {
      // Extract text from the block content
      return {
        title: title,
        subtitle: subtitle
      }
    }
  },
 
})