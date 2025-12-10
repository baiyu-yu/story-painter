import type { FC } from "react";

import { ParagraphPlugin, createNodesWithHOC } from "@udecode/plate-common/react";
// Implement local withDraggable HOC to avoid version export differences

import { Draggable, type DraggableProps } from "./draggable";

export const withDraggable = (
  Component: FC,
  options?: { draggableProps?: Partial<Omit<DraggableProps, "children" | "editor" | "element">> },
) => {
  const Wrapped: FC<any> = (props) => (
    <Draggable {...(options?.draggableProps as any)} {...props}>
      <Component {...props} />
    </Draggable>
  );
  return Wrapped;
};

export const withDraggablesPrimitive = createNodesWithHOC(withDraggable);

export const withDraggables = (components: any) => {
  return withDraggablesPrimitive(components, [
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "px-0 pb-1 text-[1.875em]",
        },
      },
      key: "h1",
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "px-0 pb-1 text-[1.5em]",
        },
      },
      key: "h2",
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "pt-[2px] px-0 pb-1 text-[1.25em]",
        },
      },
      key: "h3",
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "pt-[3px] px-0 pb-0 text-[1.1em]",
        },
      },
      keys: ["h4", "h5"],
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: "pt-[3px] px-0 pb-0",
        },
      },
      keys: [ParagraphPlugin.key],
    },
  ]);
};
