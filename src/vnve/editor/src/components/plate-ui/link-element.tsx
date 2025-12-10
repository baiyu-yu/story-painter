import React from "react";

// Avoid importing internal types from plate-link; use runtime element shape

import { cn, withRef } from "@udecode/cn";
import { PlateElement, useElement } from "@udecode/plate-common/react";
import { useLink } from "@udecode/plate-link/react";

export const LinkElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement() as any;
    const { props: linkProps } = useLink({ element });

    return (
      <PlateElement
        asChild
        className={cn(
          "font-medium text-primary underline decoration-primary underline-offset-4",
          className,
        )}
        ref={ref}
        {...(linkProps as any)}
        {...props}
      >
        <a>{children}</a>
      </PlateElement>
    );
  },
);
