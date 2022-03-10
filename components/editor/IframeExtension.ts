import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  cx,
  extension,
  ExtensionTag,
  LiteralUnion,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  omitExtraAttributes,
  ProsemirrorAttributes,
  Static,
  getMatchString,
  keyBinding,
  KeyBindingProps,
  isTextSelection,
  Transaction,
  isNodeSelection,
} from "remirror";
import { PasteRule } from "@remirror/pm/paste-rules";
import { TextSelection } from "@remirror/pm/state";
import { YOUTUBE_REGEX, createYouTubeUrl } from "./editorUtils";

interface IframeOptions {
  /**
   * The default source to use for the iframe.
   */
  defaultSource?: Static<string>;

  /**
   * The class to add to the iframe.
   *
   * @default 'remirror-iframe'
   */
  class?: Static<string>;

  /**
   * Enable resizing.
   *
   * If true, the iframe node will be rendered by `nodeView` instead of `toDOM`.
   *
   * @default false
   */
  enableResizing: boolean;
}

type IframeAttributes = ProsemirrorAttributes<{
  src: string;
  frameBorder?: number | string;
  allowFullScreen?: "true";
  width?: string | number;
  height?: string | number;
  type?: LiteralUnion<"youtube", string>;
}>;

/**
 * An extension for the remirror editor.
 */
@extension<IframeOptions>({
  defaultOptions: {
    defaultSource: "",
    class: "remirror-iframe",
    enableResizing: false,
  },
  staticKeys: ["defaultSource", "class"],
})
export class IframeExtension extends NodeExtension<IframeOptions> {
  get name() {
    return "iframe" as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(
    extra: ApplySchemaAttributes,
    override: NodeSpecOverride
  ): NodeExtensionSpec {
    const { defaultSource } = this.options;

    return {
      selectable: true,
      ...override,
      attrs: {
        ...extra.defaults(),
        src: defaultSource ? { default: defaultSource } : {},
        allowFullScreen: { default: true },
        frameBorder: { default: 0 },
        type: { default: "custom" },
        width: { default: null },
        height: { default: null },
      },
      parseDOM: [
        {
          tag: "iframe",
          getAttrs: (dom) => {
            const frameBorder = (dom as HTMLElement).getAttribute(
              "frameborder"
            );
            return {
              ...extra.parse(dom),
              type: (dom as HTMLElement).getAttribute("data-embed-type"),
              height: (dom as HTMLElement).getAttribute("height"),
              width: (dom as HTMLElement).getAttribute("width"),
              allowFullScreen:
                (dom as HTMLElement).getAttribute("allowfullscreen") === "false"
                  ? false
                  : true,
              frameBorder: frameBorder ? Number.parseInt(frameBorder, 10) : 0,
              src: (dom as HTMLElement).getAttribute("src"),
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { frameBorder, allowFullScreen, src, type, ...rest } =
          omitExtraAttributes(node.attrs, extra);
        const { class: className } = this.options;

        return [
          "div",
          {
            class: "remirror-iframe-wrapper",
          },
          [
            "iframe",
            {
              style: "pointer-events: none;",
              ...extra.dom(node),
              ...rest,
              class: cx(className, `${className}-${type as string}`),
              src,
              "data-embed-type": type,
              allowfullscreen: allowFullScreen ? "true" : "false",
              frameBorder: frameBorder?.toString(),
            },
          ],
        ];
      },
    };
  }

  /**
   * Add a custom iFrame to the editor.
   */
  @command()
  addIframe(attributes: IframeAttributes): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.replaceSelectionWith(this.type.create(attributes)));

      return true;
    };
  }

  createPasteRules(): PasteRule[] {
    return [
      {
        type: "node",
        nodeType: this.store.schema.nodes.iframe,
        getContent: () => {},
        regexp: new RegExp(`${YOUTUBE_REGEX.source}$`),
        startOfTextBlock: true,
        getAttributes: (match) => {
          return {
            src: createYouTubeUrl(getMatchString(match, 1)),
            frameBorder: 0,
            type: "youtube",
          };
        },
      },
    ];
  }

  @keyBinding({ shortcut: "Enter" })
  enterKey({ dispatch, tr }: KeyBindingProps): boolean {
    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    const { nodeBefore, parent } = tr.selection.$anchor;

    if (!nodeBefore || !nodeBefore.isText || !parent.type.isTextblock) {
      return false;
    }

    const regexp = new RegExp(`${YOUTUBE_REGEX.source}$`);
    const { text, nodeSize } = nodeBefore;
    const { textContent } = parent;

    if (!text) {
      return false;
    }

    const matchesNodeBefore = text.match(regexp);
    const matchesParent = textContent.match(regexp);

    if (!matchesNodeBefore || !matchesParent) {
      return false;
    }

    const [, id] = matchesNodeBefore;

    const src = createYouTubeUrl(id);

    const pos = tr.selection.$from.before();
    const end = pos + nodeSize + 1; // +1 to account for the extra pos a node takes up
    tr.replaceWith(
      pos,
      end,
      this.type.create({
        src,
        frameBorder: 0,
        type: "youtube",
        allowFullScreen: "false",
      })
    );

    // Set the selection to after the iframe.
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  }

  /**
   * Updates the transaction after an `iframe` has been inserted to make
   * sure the currently selected node isn't a Horizontal Rule.
   *
   * This should only be called for empty selections.
   */
  private updateFromNodeSelection(tr: Transaction): void {
    // Make sure  the `iframe` that is selected. Otherwise do nothing.
    if (
      !isNodeSelection(tr.selection) ||
      tr.selection.node.type.name !== this.name
    ) {
      return;
    }

    // Get the position right after the current selection for inserting the
    // node.
    const pos = tr.selection.$from.pos + 1;

    const type = this.store.schema.nodes.paragraph;

    // Insert the new node
    const node = type.create();
    tr.insert(pos, node);

    // Set the new selection to be inside the inserted node.
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));
  }

  @keyBinding({ shortcut: "Space" })
  spaceKey({ dispatch, tr }: KeyBindingProps): boolean {
    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    const { parent } = tr.selection.$anchor;

    if (!parent.type.isTextblock) {
      return false;
    }

    const regexp = new RegExp(`^${YOUTUBE_REGEX.source}$`);
    const { textContent, nodeSize } = parent;

    if (!textContent) {
      return false;
    }

    const matchesParent = textContent.match(regexp);

    if (!matchesParent) {
      return false;
    }

    const [fullMatch, id] = matchesParent;

    const src = createYouTubeUrl(id);

    const pos = tr.selection.$from.before();
    const end = fullMatch.length + pos + 1;
    tr.replaceWith(
      pos,
      end,
      this.store.schema.nodes.iframe.create({
        src,
        frameBorder: 0,
        type: "youtube",
        allowFullScreen: "false",
      })
    );

    // Set the selection to after the iframe.
    tr.setSelection(TextSelection.create(tr.doc, pos + 1));

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  }
}
