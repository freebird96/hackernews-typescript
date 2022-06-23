import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

export const Link = objectType({
    name: "Link", // 1 
    definition(t) {  // 2
        t.nonNull.int("id"); // 3 
        t.nonNull.string("description"); // 4
        t.nonNull.string("url"); // 5
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {  // 1
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        });
    },
});



export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {   // 3
            type: "Link",
            resolve(parent, args, context, info) {    // 4
                console.log("Fetching the results from the DB");
                return context.prisma.link.findMany();
            },
        });
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },
            resolve(parent, args, context) {
                const { description, url } = args;  // 4
                const { userId } = context;
                console.log(userId)

                if (!userId) {  // 1
                    throw new Error("Cannot post without logging in.");
                }

                const newLink = context.prisma.link.create({
                    data: { url, description }
                })
                return newLink
            },
        });
    }
});

export const linkUpdate = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("update", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
                id: nonNull(intArg())
            },
            resolve(parent, args, context) {
                const { description, url, id } = args;  // 4
                const link = context.prisma.link.update({
                    where: {
                        id
                    },
                    data: { url, description }
                })

                console.log('Update successfull...')
                return link;
            },
        });
    }
});

export const linkDelete = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("delete", {
            type: "Link",
            args: {
                id: nonNull(intArg())
            },
            resolve(parent, args, context) {
                const { id } = args
                const link = context.prisma.link.delete({
                    where: {
                        id
                    }
                })
                console.log('Deletion successfull')
                return link
            }
        });
    }
});