import { FloatingWrapper, useMentionAtom } from "@remirror/react";
import { useEffect, useState } from "react";
import { cx } from "remirror";
import { MentionAtomNodeAttributes } from "remirror/extensions";
import { allMentionItems } from "./allMentionItems";

function UserSuggester() {
  const [items, setItems] = useState<MentionAtomNodeAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } =
    useMentionAtom({ items: items });

  useEffect(() => {
    if (!state) {
      return;
    }

    const searchTerm = state.query.full.toLowerCase();
    const filteredUsers = allMentionItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm) ||
          item.id.includes(searchTerm)
      )
      .sort()
      .slice(0, 5);
    setItems(filteredUsers);
  }, [state]);

  const enabled = !!state;

  return (
    <FloatingWrapper
      positioner="cursor"
      enabled={enabled}
      placement="bottom-start"
      containerClass="mention-container"
    >
      <div {...getMenuProps()} className="suggestions">
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

export const Tagging = (): JSX.Element => {
  return <UserSuggester />;
};
