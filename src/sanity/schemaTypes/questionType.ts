import { defineType, defineField } from "sanity";

export const questionType = defineType({
  name: "question",
  title: "Question",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Question Title",
      type: "string",
      validation: (Rule) => Rule.required().min(10).max(200),
    }),
    defineField({
      name: "description",
      title: "Question Description",
      type: "text",
      rows: 4,
      description: "Optional additional details about the question",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Optional category for organizing questions",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "isAnswered",
      title: "Is Answered",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isDeleted",
      title: "Is Deleted",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isClosed",
      title: "Is Closed",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "viewCount",
      title: "View Count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.username",
      category: "category.name",
    },
    prepare(selection) {
      const { title, author, category } = selection;
      return {
        title: title,
        subtitle: `by ${author}${category ? ` in ${category}` : ''}`,
      };
    },
  },
});
