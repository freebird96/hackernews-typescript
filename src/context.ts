import { PrismaClient } from "@prisma/client";
import { Request } from "express"
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";


export const prisma = new PrismaClient();

export interface Context {    // 1
    prisma: PrismaClient;
    userId?: number;
}

export const context = ({ req }: { req: Request }): Context => {   // 2
    const token = req && req.headers.authorization ? decodeAuthHeader(req.headers.authorization) : null;
    console.log(`Token: ${token}`)
    return {
        prisma,
        userId: token?.userId,
    };
};