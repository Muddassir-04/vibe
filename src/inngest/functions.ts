import { Sandbox } from "@e2b/code-interpreter";
import { openai, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxID = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-first");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert Next.js developer.  You write readable, maintainable code. you write simple Next.js and React snippets",
      model: openai({ model: "gpt-4o",}),
    });

    const { output } = await codeAgent.run(
      `write the following snippet: ${event.data.value}`,
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxID);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    })

    return { output, sandboxUrl };
  },
);