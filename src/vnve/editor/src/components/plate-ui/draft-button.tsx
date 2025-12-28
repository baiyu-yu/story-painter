import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { DraftManager } from "./draft-manager";
import { cn } from "@/lib/utils";
import { useMedia } from "@/components/hooks/useMedia";

interface DraftButtonProps<T> {
  content: T;
  type: "dialogue" | "script";
  onLoad: (content: T) => void;
  className?: string;
}

export function DraftButton<T>({ content, type, onLoad, className }: DraftButtonProps<T>) {
  const isSm = useMedia("(min-width: 640px)");
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("px-2 gap-2", className)} title="草稿箱">
          <Icons.bookmark className="size-4" />
          草稿箱
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", !isSm && "w-screen")} align="start">
        <DraftManager content={content} type={type} onLoad={onLoad} />
      </PopoverContent>
    </Popover>
  );
}
