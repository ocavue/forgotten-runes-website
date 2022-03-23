import { LinkExtension } from "remirror/extensions";

export function createLinkExtension() {
  const extension = new LinkExtension({
    autoLink: true,
  });

  extension.addHandler("onClick", (event, data) => {
    // alert(`You clicked link: ${JSON.stringify(data)}`);
    // TODO: go to the link target
    return true;
  });

  return extension;
}
