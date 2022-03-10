import styled from "@emotion/styled";
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from "@remirror/react";
import "@remirror/styles/all.css";
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
  DropCursorExtension,
  GapCursorExtension,
} from "remirror/extensions";
import { BehaviorExtension } from "./BehaviourExtension";
import { EditorMenu } from "./EditorMenu";
import { htmlToMarkdown } from "./htmlToMarkdown";
import { createImageExtension, ImageUploader } from "./ImageExtension";
import { createLinkExtension } from "./createLinkExtension";
import { markdownToHtml } from "./markdowToHtml";
import { createMentionExtension } from "./createMentionExtension";
import { Tagging } from "./tagging";

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
  min-height: 500px;

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
    max-height: 500px;
  }

  .ProseMirror:active,
  .ProseMirror:focus {
    box-shadow: none;
  }

  .remirror-collapsible-list-item-button {
    background-color: #ddd;
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
      new DropCursorExtension({ color: "white" }),
      new GapCursorExtension(),
      new PlaceholderExtension({ placeholder }),
      createLinkExtension(),
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
      new IframeExtension({}),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
      new BehaviorExtension(),
      createMentionExtension(),
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
        <EditorMenu />
        <EditorComponent />
        <Tagging />
        {children}
      </Remirror>
    </ThemeProvider>
  );
};
