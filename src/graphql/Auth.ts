import { extendType, nonNull, objectType, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../utils/auth";


export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string("token");
        t.field("user", {
            type: "User"
        });
    } 
});

export const AuthMutatation  = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("signup", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                name: nonNull(stringArg())
            },
            async resolve(parent, args, context) {
                const {email, name} = args;
                const password = await bcrypt.hash(args.password, 10);
                const user = await context.prisma.user.create({
                    data: { email, name, password},
                })

                const token = jwt.sign({userId: user.id}, APP_SECRET);
                return {
                    token, user
                }

            }
        });
        t.nonNull.field("login", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            async resolve(parent, args, context) {
                const {email} = args
                const user = await context.prisma.user.findUnique({
                    where: {email}
                });
                if (!user) {
                    throw new Error("No such user found");
                }
                const valid = await bcrypt.compare(
                    args.password,
                    user.password
                );
                if (!valid) {
                    throw new Error("Invalid Password");
                }

                const token = jwt.sign({userId: user.id}, APP_SECRET);
                return {
                    token, user
                }
            }
        })
    }
});