import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { ErrorBoundary } from "react-error-boundary";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
    params: {
        projectId: string;
    };
}

const Page = async ({ params }: Props) => {
    const { projectId } = params;

    // Create a query client
    const queryClient = getQueryClient();

    // Prefetch the necessary queries
    await queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }));
    await queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId,
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<p>Error</p>}>
            <Suspense fallback={<p>Loading...</p>}>
                <ProjectView projectId={projectId} />
            </Suspense>
            </ErrorBoundary> 
        </HydrationBoundary>
    );
};

export default Page;
