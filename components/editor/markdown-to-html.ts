/**
 * @module
 *
 * Provides the main method used to convert markdown to html.
 */

import { marked } from "marked";
import { allMentionItems } from "./mention-data";

console.log("[marked:]", marked);

const TOKEN_TAG_REGEX = /\@((?:wizard|soul|pony)[0-9]+)/g;

/**
 * Converts the provided markdown to HTML.
 */
export function markdownToHtml(
  markdown: string,
  sanitizer?: (html: string) => string
): string {
  markdown = markdown.replace(TOKEN_TAG_REGEX, (match, group1) => {
    const mentionId = group1;
    const mentionLabel = allMentionItems.find(
      (item) => item.id === mentionId
    )?.label;

    if (!mentionLabel) {
      return match;
    }

    return `<span class="remirror-mention-atom remirror-mention-atom-at" data-mention-atom-id="${mentionId}" data-mention-atom-name="at">${mentionLabel}</span>`;
  });

  return marked(markdown, {
    gfm: true,
    smartLists: true,
    xhtml: true,
    sanitizer,
  });
}
