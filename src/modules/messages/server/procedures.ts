import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const messages = await prisma.message.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return messages;
  }),

  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required " })
        .min(1, { message: "value is required " })
        .max(10000, { message: "value is too long"}),
        projectId: z.string().min(1, { message: "Project ID is required " }), // ✅ added
      }),
    )
    .mutation(async ({ input }) => {
      const createdMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",          // Make sure these match your enums
          type: "RESULT",
          projectId: input.projectId, // ✅ added
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createdMessage;
    }),
});
