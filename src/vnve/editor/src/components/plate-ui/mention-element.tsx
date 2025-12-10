import React from "react";

// Avoid importing non-exported types; use runtime element shape

import { cn, withRef } from "@udecode/cn";
// getHandler may not be exported; use local wrapper
import { PlateElement, useElement } from "@udecode/plate-common/react";
import { useFocused, useSelected } from "slate-react";

export const MentionElement = withRef<
  typeof PlateElement,
  {
    onClick?: (mentionNode: any) => void;
    prefix?: string;
    renderLabel?: (mentionable: any) => string;
  }
>(({ children, className, onClick, prefix, renderLabel, ...props }, ref) => {
  const element = useElement() as any;
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      className={cn(
        "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium",
        selected && focused && "ring-2 ring-ring",
        (element as any)?.children?.[0]?.bold === true && "font-bold",
        (element as any)?.children?.[0]?.italic === true && "italic",
        (element as any)?.children?.[0]?.underline === true && "underline",
        className,
      )}
      contentEditable={false}
      data-slate-value={element.value}
      onClick={onClick ? () => onClick(element) : undefined}
      ref={ref}
      {...props}
    >
      {prefix}
      {renderLabel ? renderLabel(element) : element.value}
      {children}
    </PlateElement>
  );
});
