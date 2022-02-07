import "@remirror/styles/all.css";

import { FC, useCallback } from "react";
import jsx from "refractor/lang/jsx";
import typescript from "refractor/lang/typescript";
import { ExtensionPriority, RemirrorEventListener } from "remirror";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
  IframeExtension,
} from "remirror/extensions";
import {
  ComponentItem,
  EditorComponent,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
} from "@remirror/react";
import { CoreStyledComponent } from "@remirror/styles/emotion";
import { ImageExtension } from "./ImageExtension";

import React from "react";
import { pinFileToIpfs } from "../AddLore/addLoreHelpers";
import type { ImageAttributes } from "./ImageExtension";
import { BehaviorExtension } from "./BehaviourExtension";

type UploadHandler = (file: File) => Promise<ImageAttributes>;

async function uploadImageHandler(file: File): Promise<ImageAttributes> {
  try {
    const res = await pinFileToIpfs(file, 1, "1");
    const src = `ipfs://${res.IpfsHash}`;
    // if (!firstImageUrl) {
    //   // setFirstImageUrl(url);
    // }
    return { src };
  } catch (e: any) {
    console.error(e);
    return { error: "Problem uploading, please try again...", src: "" };
  }
}

export interface MarkdownEditorProps {
  placeholder?: string;
  initialContent?: string;
  onChangeMarkdown?(markdown: string): void;
}

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
export const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
  const { placeholder, initialContent, children, onChangeMarkdown } = props;
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new LinkExtension({ autoLink: true }),
      new BoldExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      new LinkExtension(),
      new BlockquoteExtension(),
      new BulletListExtension({ enableSpine: true }),
      new OrderedListExtension(),
      new ListItemExtension({
        priority: ExtensionPriority.High,
        enableCollapsible: true,
      }),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),
      new TableExtension(),
      new MarkdownExtension({ copyAsMarkdown: false }),
      new IframeExtension(),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
      new ImageExtension({ enableResizing: false, uploadImageHandler }),
      new BehaviorExtension(),
    ],
    [placeholder]
  );

  const {
    manager,
    state,
    onChange: onStateChange,
  } = useRemirror({
    extensions,
    stringHandler: "markdown",
    content: initialContent,
  });

  const onChange: RemirrorEventListener<MarkdownExtension> = useCallback(
    (params) => {
      onChangeMarkdown?.(params.helpers.getMarkdown());
      onStateChange(params);
    },
    [onStateChange, onChangeMarkdown]
  );

  return (
    <CoreStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} autoFocus onChange={onChange} state={state}>
          <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
          <EditorComponent />
          {children}
        </Remirror>
      </ThemeProvider>
    </CoreStyledComponent>
  );
};

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBold",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleItalic",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleStrike",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleCode",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Heading Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarMenu,

        items: [
          {
            type: ComponentItem.MenuGroup,
            role: "radio",
            items: [
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 3 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 4 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 5 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 6 },
              },
            ],
          },
        ],
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBlockquote",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleCodeBlock",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "History",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "undo",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "redo",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleColumns",
        display: "icon",
        attrs: { count: 2 },
      },
    ],
    separator: "none",
  },
];
