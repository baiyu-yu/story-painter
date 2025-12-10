import React from "react";

import { cn } from "@udecode/cn";
import { ParagraphPlugin } from "@udecode/plate-common/react";
import {
  type PlaceholderProps,
  createNodeHOC,
  createNodesHOC,
  usePlaceholderState,
} from "@udecode/plate-common/react";
// Use string keys for heading when constants are unavailable

export const Placeholder = (props: PlaceholderProps) => {
  const { children, nodeProps, placeholder } = props;

  const { enabled } = usePlaceholderState(props);

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        className: cn(
          enabled &&
            "before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]",
        ),
        placeholder,
      },
    });
  });
};

export const withPlaceholder = createNodeHOC(Placeholder);

export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

export const withPlaceholders = (components: any) =>
  withPlaceholdersPrimitive(components, [
    {
      hideOnBlur: true,
      key: ParagraphPlugin.key,
      placeholder: "请输入对白",
      query: {
        maxLevel: 1,
      },
    },
    {
      hideOnBlur: false,
      key: "h1",
      placeholder: "Untitled",
    },
  ]);
