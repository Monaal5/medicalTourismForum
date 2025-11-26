import { defineType, defineField } from "sanity";
export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: () => "👤",
  fields: [
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Unique username for the user",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "User email address",
    }),
    defineField({
      name: "imageUrl",
      title: " Image URL",
      type: "string",

      description: "users clerk user profile image",
    }),
    defineField({
      name: "clerkId",
      title: "Clerk ID",
      type: "string",
      description: "Clerk authentication user ID",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      description: "User biography",
    }),
    defineField({
      name: "joinedAt",
      title: "Joined At",
      type: "datetime",
      initialValue: new Date().toISOString(),
      description: "Date and time the user joined the platform",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isReported",
      title: "Is Reported",
      type: "boolean",
      initialValue: false,
      description: "Whether this user has been reported",
    }),
    defineField({
      name: "bookmarks",
      title: "Bookmarks",
      type: "array",
      of: [{ type: "reference", to: [{ type: "question" }] }],
      description: "Questions bookmarked by the user",
    }),
    defineField({
      name: "followers",
      title: "Followers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "user" }] }],
      description: "Users following this user",
    }),
    defineField({
      name: "following",
      title: "Following",
      type: "array",
      of: [{ type: "reference", to: [{ type: "user" }] }],
      description: "Users this user is following",
    }),
  ],
  preview: {
    select: {
      title: "username",
      subtitle: "email",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle,
        media: () => "👤",
      };
    },
  },
});
