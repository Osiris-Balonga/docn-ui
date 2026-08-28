"use client";

import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProjectLink() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              className="w-fit"
              size="lg"
              nativeButton={false}
              render={
                <a
                  href="https://github.com/Osiris-Balonga/docn-ui"
                  role="link"
                />
              }
            />
          }
        >
          Follow the project{" "}
          <ArrowUpRightIcon aria-hidden="true" data-icon="inline-end" />
        </TooltipTrigger>
        <TooltipContent>
          Source code and implementation progress on GitHub
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
