import styled from "@emotion/styled";
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from "@remirror/react";
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
  DropCursorExtension,
  EmojiExtension,
  GapCursorExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  MentionAtomNodeAttributes,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  TrailingNodeExtension,
} from "remirror/extensions";
import emojiData from "svgmoji/emoji.json";
import { createLinkExtension } from "./createLinkExtension";
import { createMentionExtension } from "./createMentionExtension";
import { EditorMenu } from "./EditorMenu";
import { EmojiPopupComponent } from "./Emoji";
import { htmlToMarkdown } from "./htmlToMarkdown";
import { IframeExtension } from "./IframeExtension";
import { createImageExtension, ImageUploader } from "./ImageExtension";
import { markdownToHtmlFunctionGenerator } from "./markdowToHtml";
import { Tagging } from "./Mentions";

export interface MarkdownEditorProps {
  placeholder?: string;
  initialContent?: string;
  onChangeMarkdown?: (markdown: string) => void;
  imageUploader?: ImageUploader;
  mentionableTokens?: MentionAtomNodeAttributes[];
}

const Wrapper = styled.div`
  font-size: 16px;
  font-family: "Alagard", serif;
  background-color: black;
  border: 1px dimgrey solid;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .remirror-editor-wrapper {
    padding-top: 0;
    flex: 1;
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .remirror-toolbar > *:not(:first-child) {
    margin: 0 0 0 0;
  }

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

  img {
    max-width: 100%;
  }

  .remirror-editor {
    height: 100%;
    overflow-y: scroll;
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
    height: 100%;
    max-width: 1024px;
    /* max-height: 450px; */
    pointer-events: none;
  }

  .remirror-iframe-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-top: 20px;
    padding-bottom: 20px;
    /* padding-top: 56.25%; */
  }

  .ProseMirror:active,
  .ProseMirror:focus {
    box-shadow: none;
  }

  .remirror-collapsible-list-item-button {
    background-color: #ddd;
  }

  .remirror-editor {
    caret-color: white;

    .ProseMirror-gapcursor:after {
      border-top: 1px solid white;
    }

    pre[class*="language-"] {
      background: initial;
      padding-left: 0;
      padding-right: 0;
    }

    p {
      margin-block: 16px;
    }
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
    mentionableTokens,
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
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),

      new MarkdownExtension({
        copyAsMarkdown: false,
        htmlToMarkdown,
        markdownToHtml: markdownToHtmlFunctionGenerator(
          mentionableTokens ?? []
        ),
      }),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
      new IframeExtension(),
      createMentionExtension(),
      new EmojiExtension({ data: emojiData, plainText: true }),
      createImageExtension({ imageUploader }),
    ],
    [placeholder]
  );

  const { manager } = useRemirror({
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
        autoFocus={"start"}
        onChange={onChange}
      >
        <EditorMenu />
        <EditorComponent />
        <Tagging mentionableTokens={mentionableTokens ?? []} />
        <EmojiPopupComponent />
        {children}
      </Remirror>
    </ThemeProvider>
  );
};
