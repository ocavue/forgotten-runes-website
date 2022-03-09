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
      inline: true,
      parseDOM: [
        {
          tag: "img",
          priority: ExtensionPriority.High,
          getAttrs: (dom): FileAttributes => {
            const img = dom as HTMLImageElement;
            const url = img.getAttribute("src") || "";
            const fileName = img.getAttribute("alt") || "";
            const attrs = { url, fileName };
            return attrs;
          },
        },
      ],
      toDOM: (node) => {
        const { url, fileName } = node.attrs;
        const attrs = { src: url, alt: fileName };
        return ["img", attrs];
      },
    };
  }
}

export type ImageUploader = (file: File) => Promise<{ url: string }>;

// TODO: replace this to actual implementation
const defaultImageUploader: ImageUploader = async (file) => {
  console.log("uploading image", file.name);
  await sleep(2000);
  const url = URL.createObjectURL(file);
  console.log("uploaded image", url);
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
        return <img src={attrs.url} title={attrs.fileName} />;
      } else {
        return <div>Uploading {attrs.fileName} ...</div>;
      }
    },

    uploadFileHandler: () => uploadFileHandler(imageUploader),
  });
}
