import { defineField, defineType } from "sanity";

export const subredditType = defineType({
  name: 'subreddit',
  title: 'Subreddit',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({
      name: 'title',
      title: 'Subreddit Title',
      type: 'string',
      description: 'The name of the subreddit',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',

      description: 'Brief description of what this subreddit is about'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',

      },
      validation: (Rule) => Rule.required(),
      description: 'Url friendly identifier for the subreddit',
    }),
    defineField({
      name: 'image',
      title: 'Subreddit Image',
      type: 'image',

      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for the image'
        }
      ],
      description: 'Main image/logo for the subreddit'
    }),
    defineField({
      name: 'moderator',
      title: 'Moderator',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
      description: 'The main moderator of this subreddit'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
      description: 'When this subreddit was created'
    }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this subreddit has been deleted'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'image',
      moderator: 'moderator.username'
    },
    prepare({ title, subtitle, moderator }) {
      return {
        title: `r/${title}`,
        subtitle: `${subtitle?.substring(0, 50)}${subtitle?.length > 50 ? '...' : ''} • Mod: ${moderator || 'Unknown'}`,
      }
    }
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [
        { field: 'createdAt', direction: 'desc' }
      ]
    },
    {
      title: 'Created Date, Old',
      name: 'createdAtAsc',
      by: [
        { field: 'createdAt', direction: 'asc' }
      ]
    }
  ]
})
