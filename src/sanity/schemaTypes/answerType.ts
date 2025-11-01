import { defineType, defineField } from "sanity";

export const answerType = defineType({
  name: "answer",
  title: "Answer",
  type: "document",
  fields: [
    defineField({
      name: "content",
      title: "Answer Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H1", value: "h1" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Number", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "question",
      title: "Question",
      type: "reference",
      to: [{ type: "question" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isAccepted",
      title: "Is Accepted Answer",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isEdited",
      title: "Is Edited",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "editedAt",
      title: "Edited At",
      type: "datetime",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "content",
      author: "author.username",
      question: "question.title",
    },
    prepare(selection) {
      const { title, author, question } = selection;
      const content = title?.[0]?.children?.[0]?.text || "No content";
      return {
        title: content.length > 50 ? content.substring(0, 50) + "..." : content,
        subtitle: `by ${author} to "${question}"`,
      };
    },
  },
});
