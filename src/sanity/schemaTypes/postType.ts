import { defineType, defineField } from "sanity";

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: () => '📝',
  fields: [
    defineField({
      name: 'postTitle',
      title: 'Post Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(300),
      description: 'The main title of the post'
    }),
      defineField({
        name: 'originalTitle',
        title: 'Original Title',
        type: 'string',
        description: 'Original title if this post was imported or modified or deleted',
        hidden: true,
      }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
      description: 'The user who created this post'
    }),
      defineField({
        name: 'subreddit',
        title: 'Subreddit',
        type: 'reference',
        to: [{ type: 'subreddit' }],
        validation: (Rule) => Rule.required(),
        description: 'The subreddit this post belongs to'
      }),
      defineField({
        name: 'body',
        title: 'Post Body',
        type: 'array',
        of: [{ type: 'block' }],
        validation: (Rule) => Rule.required().min(1),
        description: 'The main content of the post'
      }),
    
      defineField({
        name: 'image',
        title: 'Post Image',
        type: 'image',
        options: {
          hotspot: true
        },
        fields: [
          {
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
            description: 'Alternative text for the image'
          }
        ],
        description: 'Main image for the post'
      }),
   
    defineField({
      name: 'isReported',
      title: 'Is Reported',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this post has been reported'
    }),
      defineField({
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
        initialValue: () => new Date().toISOString(),
        validation: (Rule) => Rule.required(),
        description: 'When this post was published'
      }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this post has been deleted'
    }),
    
  ],
  preview: {
    select: {
      title: 'postTitle',
      subtitle: 'subreddit',
      author: 'author.username',
      media: 'image'
    },
    prepare({ title, subtitle, author }) {
      return {
        title: title,
        subtitle: `r/${subtitle} • by ${author || 'Unknown'}`,
      }
    }
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [
        { field: 'publishedAt', direction: 'asc' }
      ]
    }
  ]
})