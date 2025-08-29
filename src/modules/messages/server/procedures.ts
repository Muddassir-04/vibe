import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { Input } from "@/components/ui/input";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
  .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required " }), // ✅ added
      }),
    )
    .query(async ({ input, ctx }) => {
    const messages = await prisma.message.findMany({
      where: {
        projectId: input.projectId,
        project: {
          userId: ctx.auth.userId,
        },
      },
      include: {
        fragment: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });
  
  

    return messages;
  }),

  create: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required " })
        .min(1, { message: "value is required " })
        .max(10000, { message: "value is too long"}),
        projectId: z.string().min(1, { message: "Project ID is required " }), // ✅ added
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where:{
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found"});
      }

      const createdMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",          // Make sure these match your enums
          type: "RESULT",
          projectId: existingProject.id, // ✅ added
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
