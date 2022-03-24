import {
  Coords,
  EditorState,
  getSelectedWord,
  isTextSelection,
} from "remirror";
import {
  hasStateChanged,
  // isPositionVisible,
  Positioner,
} from "remirror/extensions";

function createSelectionPositioner(isActive: (state: EditorState) => boolean) {
  return Positioner.create<{
    from: Coords;
    to: Coords;
  }>({
    hasChanged: hasStateChanged,
    getActive: (props) => {
      const { state, view } = props;

      if (!isActive(state) || !isTextSelection(state.selection)) {
        return Positioner.EMPTY;
      }

      try {
        const { head, anchor } = state.selection;
        return [{ from: view.coordsAtPos(anchor), to: view.coordsAtPos(head) }];
      } catch {
        return Positioner.EMPTY;
      }
    },

    getPosition(props) {
      const { element, data, view } = props;
      const { from, to } = data;
      const parent = element.offsetParent ?? view.dom;
      const parentRect = parent.getBoundingClientRect();
      const height = Math.abs(to.bottom - from.top);

      // True when the selection spans multiple lines.
      const spansMultipleLines = height > from.bottom - from.top;

      // The position furthest to the left.
      const leftmost = Math.min(from.left, to.left);

      // The position nearest the top.
      const topmost = Math.min(from.top, to.top);

      const left =
        parent.scrollLeft +
        (spansMultipleLines
          ? to.left - parentRect.left
          : leftmost - parentRect.left);
      const top = parent.scrollTop + topmost - parentRect.top;
      const width = spansMultipleLines ? 1 : Math.abs(from.left - to.right);
      const rect = new DOMRect(
        spansMultipleLines ? to.left : leftmost,
        topmost,
        width,
        height
      );
      // const visible = isPositionVisible(rect, view.dom);

      return { rect, y: top, x: left, height, width, visible: true };
    },
  });
}

/**
 * Create a position that fully capture the selected text. When the selection
 * spans multiple lines, the position is created as a box that fully captures
 * the start cursor and end cursor.
 */
export const selectionPositioner = createSelectionPositioner(
  (state) => !state.selection.empty
);

/**
 * This can be used to position a menu that is inline with the first character
 * of the selection. This is useful for suggestions since they should typically
 * appear while typing without a multi character selection.
 *
 * @remarks
 *
 * The menu will center itself within the selection.
 *
 * - `right` should be used to absolutely position away from the right hand edge
 *   of the screen.
 * - `left` should be used to absolutely position away from the left hand edge
 *   of the screen.
 * - `bottom` absolutely positions the element above the text selection.
 * - `top` absolutely positions the element below the text selection
 */
export const cursorPositioner = createSelectionPositioner(
  (state) => state.selection.empty
);

/**
 * Creates a position which captures the current active word. Nothing is returned
 * if no word is active.
 *
 * This is only active when the selection is empty (cursor selection)
 *
 * @remarks
 *
 * Creates a rect that wraps the nearest word.
 */
export const nearestWordPositioner = selectionPositioner.clone(() => ({
  getActive: (props) => {
    const { state, view } = props;

    if (!state.selection.empty) {
      return Positioner.EMPTY;
    }

    const word = getSelectedWord(state);

    if (!word) {
      return Positioner.EMPTY;
    }

    try {
      return [
        { from: view.coordsAtPos(word.from), to: view.coordsAtPos(word.to) },
      ];
    } catch {
      return Positioner.EMPTY;
    }
  },
}));
