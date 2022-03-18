import { FileAttributes, FileExtension } from "@remirror/extension-file";
import {
  ApplySchemaAttributes,
  ExtensionPriority,
  ExtensionTag,
  FileUploader,
  NodeExtensionSpec,
  NodeSpecOverride,
  uniqueId,
} from "remirror";
import { getCloudinaryFrontedImageSrc } from "../Lore/LoreMarkdownRenderer";
import { sleep } from "./editorUtils";

class ImageExtension extends FileExtension {
  createTags() {
    return [ExtensionTag.InlineNode] as any;
  }

  createNodeSpec(
    extra: ApplySchemaAttributes,
    override: NodeSpecOverride
  ): NodeExtensionSpec {
    let spec = super.createNodeSpec(extra, override);
    return {
      ...spec,
      attrs: {
        ...spec.attrs,
        ...extra.defaults(),
        ipfs: { default: null },
      },
      inline: true,
      parseDOM: [
        {
          tag: "img",
          priority: ExtensionPriority.High,
          getAttrs: (dom): FileAttributes => {
            const img = dom as HTMLImageElement;

            const url = img.getAttribute("src") || "";
            const { ipfs } = img.dataset;
            const fileName = img.getAttribute("alt") || "";
            const attrs = { ...extra.parse(dom), url, fileName, ipfs };
            return attrs;
          },
        },
      ],
      toDOM: (node) => {
        let { url, fileName, ipfs } = node.attrs;
        let src = url;

        if (url.startsWith("ipfs://")) {
          ipfs = url;
          src = getCloudinaryFrontedImageSrc(url).newSrc;
        }

        const attrs = {
          ...extra.dom(node),
          src,
          alt: fileName,
          "data-ipfs": ipfs,
        };
        return ["img", attrs];
      },
    };
  }
}

export type ImageUploader = (
  file: File
) => Promise<{ url: string; ipfs?: string }>;

// TODO: replace this to actual implementation
const defaultImageUploader: ImageUploader = async (file) => {
  await sleep(2000);
  const url = URL.createObjectURL(file);
  return { url };
};

function uploadFileHandler(
  imageUploader: ImageUploader = defaultImageUploader
): FileUploader<FileAttributes> {
  let file: File;
  let attrs: FileAttributes;

  return {
    insert: (_file: File): FileAttributes => {
      file = _file;
      attrs = {
        id: uniqueId(),
        url: "",
        fileName: file.name,
      };
      return attrs;
    },

    upload: async (context): Promise<FileAttributes> => {
      try {
        let { url } = await imageUploader(file);
        return { ...attrs, url };
      } catch (error) {
        return { ...attrs, error: `Failed to upload image: ${error}` };
      }
    },

    abort: () => {},
  };
}

export function createImageExtension({
  imageUploader,
}: {
  imageUploader?: ImageUploader;
}) {
  return new ImageExtension({
    pasteRuleRegexp: /^.*image.*$/i,
    render: (props): JSX.Element => {
      const attrs = props.node.attrs as FileAttributes;
      if (attrs.url) {
        let extraProps: Partial<Record<string, string>> = {};
        let src = attrs.url;

        if (attrs.url?.startsWith("ipfs://")) {
          extraProps["data-ipfs"] = attrs.url;
          src = getCloudinaryFrontedImageSrc(attrs.url).newSrc;
        }

        return (
          <img
            src={src}
            title={attrs.fileName}
            alt={attrs.fileName}
            {...extraProps}
          />
        );
      } else {
        return <div>Uploading {attrs.fileName} ...</div>;
      }
    },

    uploadFileHandler: () => uploadFileHandler(imageUploader),
  });
}
