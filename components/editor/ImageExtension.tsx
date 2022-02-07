import {
  ImageExtension as BaseImageExtension,
  ImageOptions as BaseImageOptions,
  ImageExtensionAttributes,
} from "remirror/extensions";
import {
  extension,
  uploadFile,
  FileUploader,
  ApplySchemaAttributes,
  NodeSpecOverride,
  CommandFunction,
  command,
} from "remirror";
import { PasteRule } from "@remirror/pm/paste-rules";

type ImageClickCallback = (image: HTMLImageElement) => void;

export interface ImageOptions extends BaseImageOptions {
  onClick?: ImageClickCallback | null;
  uploadImageHandler?: UploadHandler;
}

export interface ImageAttributes extends ImageExtensionAttributes {
  // A temporary unique during the upload progress.
  id?: any;

  // The reason of the upload failure.
  error?: string | null;
}

@extension<ImageOptions>({
  defaultOptions: { ...BaseImageExtension.defaultOptions, onClick: null },
})
export class ImageExtension extends BaseImageExtension {
  constructor(props: ImageOptions) {
    super(props);
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride) {
    const spec = super.createNodeSpec(extra, override);
    return {
      ...spec,
      attrs: {
        ...spec.attrs,
        id: { default: null },
        error: { default: null },
      },
    };
  }

  createPasteRules(): PasteRule[] {
    return [
      {
        type: "file",
        regexp: /^image.*$/i,
        fileHandler: (props) => {
          /**
            This check is meant for MSWord and any other applications that place both text and images
            on the clipboard when text is copied from within them.
            For context when text is copied from MSWord it places both a plain text,
            an html, an rtf format, and finally a png screenshot of the copied text on the clipboard.
            This check ensures that if a text/html exists together with an image, we paste the html instead.
          **/
          if (
            props.type === "paste" &&
            props.event.clipboardData?.types.includes("text/html")
          ) {
            return false;
          }

          for (const file of props.files) {
            this.uploadFileV2(file);
          }
          return true;
        },
      },
    ];
  }

  private uploadFileV2(file: File, pos?: number | undefined): void {
    return uploadFile({
      file,
      pos,
      view: this.store.view,
      fileType: this.type,
      uploadHandler: () => {
        return buildUploader((this.options as ImageOptions).uploadImageHandler);
      },
    });
  }

  @command()
  uploadImages(files: File[]): CommandFunction {
    return () => {
      for (const file of files) {
        this.uploadFileV2(file);
      }
      return true;
    };
  }
}

type UploadHandler = (file: File) => Promise<ImageAttributes>;

function buildUploader(
  uploadHandler?: UploadHandler
): FileUploader<ImageAttributes> {
  let file: File;
  let attrs: ImageAttributes;

  return {
    insert: (f: File) => {
      file = f;
      attrs = {
        src: URL.createObjectURL(file),
        fileName: file.name,
      };
      return attrs;
    },
    upload: async () => {
      if (uploadHandler) {
        return await uploadHandler(file);
      }
      return attrs;
    },
    abort: () => {
      // not implemented
    },
  };
}
