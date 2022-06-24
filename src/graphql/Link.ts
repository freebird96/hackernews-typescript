import { enumType, extendType, inputObjectType, intArg, nonNull, objectType, stringArg, arg, list } from "nexus";
import { Prisma } from "@prisma/client"


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



export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
            },
            async resolve(parent, args, context) {
                const where = args.filter
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } },
                        ],
                    }
                    : {};
                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined,
                });

                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`;

                return {  // 4
                    links,
                    count,
                    id,
                };

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


export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link });
        t.nonNull.int("count");
        t.id("id");
    },
});