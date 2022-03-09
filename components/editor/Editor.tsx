import {
  ComponentItem,
  EditorComponent,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
} from "@remirror/react";
import "@remirror/styles/all.css";
import { CoreStyledComponent } from "@remirror/styles/emotion";
import React, { FC, useCallback } from "react";
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
  IframeExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  MentionAtomExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
  UnderlineExtension,
} from "remirror/extensions";
import { BehaviorExtension } from "./BehaviourExtension";
import { htmlToMarkdown } from "./html-to-markdown";
import { createImageExtension, ImageUploader } from "./image-extension";
import { markdownToHtml } from "./markdown-to-html";
import { Tagging } from "./tagging";
import styled from "@emotion/styled";
import { EditorMenu } from "./EditorMenu";

export interface MarkdownEditorProps {
  placeholder?: string;
  initialContent?: string;
  onChangeMarkdown?: (markdown: string) => void;
  imageUploader?: ImageUploader;
}

const Wrapper = styled.div`
  font-size: 16px;
  font-family: "Alagard", serif;
  background-color: #3a110f;
  height: 500px;

  h1,
  h2,
  h3,
  h4,
  h5 {
    margin-top: 0.5em;
    font-family: "Alagard", serif;
    color: white;
  }

  h1 {
    font-size: 32px;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 18px;
  }
  h4 {
    font-size: 16px;
  }

  .remirror-editor.ProseMirror blockquote {
    background-color: #ffffff14;
    margin: 0;
    padding: 1em;
    border-radius: 2px;
    border-left: none;
    font-style: normal;
    p {
      color: white;
    }
  }

  .ProseMirror p {
    color: white;
  }

  .remirror-mention-atom {
    color: #a983ff;
    background: none;
    text-decoration: underline;
    padding: 0;
  }

  .remirror-iframe {
    aspect-ratio: 16 / 9;
    width: 100%;
    /* height: 360px; */
  }

  .ProseMirror:active,
  .ProseMirror:focus {
    box-shadow: none;
  }
`;

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
export const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
  const {
    placeholder,
    initialContent,
    children,
    onChangeMarkdown,
    imageUploader,
  } = props;

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
      new UnderlineExtension(),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),
      new TableExtension(),
      new MarkdownExtension({
        copyAsMarkdown: false,
        htmlToMarkdown,
        markdownToHtml,
      }),
      new IframeExtension(),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
      new BehaviorExtension(),
      new MentionAtomExtension({
        matchers: [{ name: "at", char: "@", appendText: " ", matchOffset: 0 }],
      }),
      createImageExtension({ imageUploader }),
    ],
    [placeholder]
  );

  const { manager, state } = useRemirror({
    extensions,
    stringHandler: "markdown",
  });

  const onChange: RemirrorEventListener<MarkdownExtension> = useCallback(
    (params) => {
      onChangeMarkdown?.(params.helpers.getMarkdown());
    },
    [onChangeMarkdown]
  );

  return (
    <ThemeProvider as={Wrapper as any}>
      <Remirror
        manager={manager}
        initialContent={initialContent}
        autoFocus
        onChange={onChange}
      >
        <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
        <EditorMenu />
        <EditorComponent />
        <Tagging />
        {children}
      </Remirror>
    </ThemeProvider>
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
