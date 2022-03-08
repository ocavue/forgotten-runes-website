import { parse, stringify } from "querystringify";
import {
  extension,
  PlainExtension,
  getMatchString,
  keyBinding,
  KeyBindingProps,
  isTextSelection,
  nodeInputRule,
  InputRule,
  Transaction,
  isNodeSelection,
  ExtensionPriority,
} from "remirror";
import { PasteRule } from "@remirror/pm/paste-rules";
import { TextSelection } from "@remirror/pm/state";
import { YOUTUBE_REGEX, createYouTubeUrl } from "./editor-utils";

@extension({ defaultPriority: ExtensionPriority.Highest })
export class BehaviorExtension extends PlainExtension {
  name = "behaviour";

  /**
   * Create an input rule that listens converts the code fence into a code block
   * when typing triple back tick followed by a space.
   */
  // createInputRules(): InputRule[] {
  //   //https://www.youtube.com/watch?v=

  //   return [
  //     nodeInputRule({
  //       regexp: new RegExp(`${YOUTUBE_REGEX.source}$`),
  //       type: this.store.schema.nodes.iframe,
  //       // beforeDispatch: ({ tr, start }) => {
  //       //   const $pos = tr.doc.resolve(start);
  //       //   tr.setSelection(new TextSelection($pos));
  //       // },
  //       beforeDispatch: ({ tr }) => {
  //         this.updateFromNodeSelection(tr);
  //       },
  //       getAttributes: (match) => {
  //         return {
  //           src: createYouTubeUrl(getMatchString(match, 1)),
  //           frameBorder: 0,
  //           type: "youtube",
  //         };
  //       },
  //     }),
  //   ];
  // }

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
    console.log("space key pressed!!!");
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
