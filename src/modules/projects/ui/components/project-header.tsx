import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from "lucide-react";

interface Props {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render dropdown after mounting (client-side)
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Prevent SSR mismatch

  return (
    <header className="p-2 flex justify-between items-center border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!"
          >
            <Image src="/logo.svg" alt="Vibe" width={18} height={18} />
            <span className="text-sm font-medium">{project.name}</span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start">
          <DropdownMenuItem asChild>
            <Link href="/">
              <ChevronLeftIcon />
              <span>Go to dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <SunMoonIcon className="size-4 text-muted-foreground" />
              <span>Appearance</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
