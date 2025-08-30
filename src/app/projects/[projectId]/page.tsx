import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { ErrorBoundary } from "react-error-boundary";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

// ✅ Use Next.js provided type instead of custom
export default async function Page({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );
  await queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}
