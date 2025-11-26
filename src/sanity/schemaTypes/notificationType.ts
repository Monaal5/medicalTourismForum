import { defineField, defineType } from "sanity";

export const notificationType = defineType({
    name: "notification",
    title: "Notification",
    type: "document",
    fields: [
        defineField({
            name: "recipient",
            title: "Recipient",
            type: "reference",
            to: [{ type: "user" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "sender",
            title: "Sender",
            type: "reference",
            to: [{ type: "user" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "type",
            title: "Type",
            type: "string",
            options: {
                list: [
                    { title: "Answer", value: "answer" },
                    { title: "Follow", value: "follow" },
                    { title: "Vote", value: "vote" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "question",
            title: "Question",
            type: "reference",
            to: [{ type: "question" }],
            hidden: ({ document }) => document?.type !== "answer" && document?.type !== "vote",
        }),
        defineField({
            name: "read",
            title: "Read",
            type: "boolean",
            initialValue: false,
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
            senderName: "sender.username",
            type: "type",
        },
        prepare({ senderName, type }) {
            return {
                title: `New ${type} from ${senderName}`,
            };
        },
    },
});
