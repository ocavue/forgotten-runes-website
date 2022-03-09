import {
  MentionAtomExtension,
  MentionAtomNodeAttributes,
} from "remirror/extensions";

export function createMentionExtension() {
  const extension = new MentionAtomExtension({
    matchers: [{ name: "at", char: "@", appendText: " ", matchOffset: 0 }],
  });

  extension.addHandler("onClick", (event, nodeWithPosition) => {
    const attrs = nodeWithPosition.node.attrs as MentionAtomNodeAttributes;
    alert(`You clicked: ${JSON.stringify(attrs)}`);
    // TODO: go to the mention target
    return true;
  });

  return extension;
}
