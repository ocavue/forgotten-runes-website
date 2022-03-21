import { FloatingWrapper, useMentionAtom, useActive } from "@remirror/react";
import { useEffect, useState } from "react";
import {
  cx,
  // ExtensionMentionAtomTheme
} from "remirror";
import { MentionAtomNodeAttributes } from "remirror/extensions";
import { cursorPositioner } from "./Positioners";

export function Tagging({
  mentionableTokens,
}: {
  mentionableTokens: MentionAtomNodeAttributes[];
}) {
  const [items, setItems] = useState<MentionAtomNodeAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } =
    useMentionAtom({ items });
  const codeblockActive = useActive().codeBlock();

  useEffect(() => {
    if (!state) {
      if (items.length) {
        setItems([]);
      }

      return;
    }

    const searchTerm = state.query.full.toLowerCase();
    const filteredUsers = mentionableTokens
      .filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm) ||
          item.id.includes(searchTerm)
      )
      .sort()
      .slice(0, 5);
    setItems(filteredUsers);
  }, [state]);

  const enabled = !!state && !codeblockActive;
  const menuProps = getMenuProps();
  console.log(menuProps.ref);
  console.log(menuProps);

  return (
    <FloatingWrapper
      positioner={cursorPositioner}
      enabled={enabled}
      placement="auto-end"
      // containerClass="mention-container"
      renderOutsideEditor
    >
      <div
        {...menuProps}
        className={cx(
          "suggestions"
          // ExtensionMentionAtomTheme.MENTION_ATOM_POPUP_WRAPPER
        )}
      >
        {enabled &&
          items.map((item, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);

            return (
              <div
                key={item.id}
                className={cx(
                  "suggestion",
                  isHighlighted && "highlighted",
                  isHovered && "hovered"
                )}
                {...getItemProps({
                  item: item,
                  index,
                })}
              >
                @{item.id} {item.label}
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
}
