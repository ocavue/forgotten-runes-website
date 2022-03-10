import { FC } from "react";
import {
  FlatEmojiWithUrl,
  useEmoji,
  FloatingWrapper,
  useActive,
} from "@remirror/react";
import { cx, ExtensionEmojiTheme } from "remirror";

/**
 * Display the image for the emoji displayed via the CDN.
 */
export const EmojiFromCdn = (props: FlatEmojiWithUrl): JSX.Element => {
  return (
    <img
      role="presentation"
      className={ExtensionEmojiTheme.EMOJI_IMAGE}
      aria-label={props.annotation}
      alt={props.annotation}
      src={props.url}
    />
  );
};

const emptyList: never[] = [];

/**
 * This component renders the emoji suggestion dropdown for the user.
 */
export const EmojiPopupComponent: FC = () => {
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } =
    useEmoji();
  const codeblockActive = useActive().codeBlock();
  const enabled = !!state && !codeblockActive;

  return (
    <FloatingWrapper
      positioner="cursor"
      enabled={enabled}
      placement="auto-end"
      renderOutsideEditor
    >
      <div
        {...getMenuProps()}
        className={cx(ExtensionEmojiTheme.EMOJI_POPUP_WRAPPER)}
      >
        {enabled &&
          (state?.list ?? emptyList).map((emoji, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);
            const shortcode = emoji.shortcodes?.[0] ?? emoji.annotation;

            return (
              <div
                key={emoji.emoji}
                className={cx(
                  ExtensionEmojiTheme.EMOJI_POPUP_ITEM,
                  isHighlighted && ExtensionEmojiTheme.EMOJI_POPUP_HIGHLIGHT,
                  isHovered && ExtensionEmojiTheme.EMOJI_POPUP_HOVERED
                )}
                {...getItemProps({
                  item: emoji,
                  index,
                })}
              >
                <span className={ExtensionEmojiTheme.EMOJI_POPUP_CHAR}>
                  {emoji.emoji}
                  {/* <EmojiFromCdn {...emoji} /> */}
                </span>
                <span className={ExtensionEmojiTheme.EMOJI_POPUP_NAME}>
                  :{shortcode}:
                </span>
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
};
