import { defineType, defineField } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Category Name",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(50)
          .custom(async (name, context) => {
            if (!name) return true;

            const { document, getClient } = context;
            const client = getClient({ apiVersion: '2023-01-01' });

            // Check if another category with the same name exists
            const query = `count(*[_type == "category" && lower(name) == lower($name) && _id != $id])`;
            const count = await client.fetch(query, {
              name,
              id: document?._id || '',
            });

            return count === 0 || 'A category with this name already exists';
          }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
        isUnique: async (slug, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion: '2023-01-01' });

          // Check if another category with the same slug exists
          const query = `count(*[_type == "category" && slug.current == $slug && _id != $id])`;
          const count = await client.fetch(query, {
            slug,
            id: document?._id || '',
          });

          return count === 0;
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Icon name from Lucide React (e.g., 'book', 'code', 'heart')",
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Green", value: "green" },
          { title: "Red", value: "red" },
          { title: "Purple", value: "purple" },
          { title: "Orange", value: "orange" },
          { title: "Pink", value: "pink" },
          { title: "Gray", value: "gray" },
        ],
      },
      initialValue: "blue",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "questionCount",
      title: "Question Count",
      type: "number",
      initialValue: 0,
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
      title: "name",
      subtitle: "description",
    },
  },
});
