import styled from "@emotion/styled";
import {
  ComponentItem,
  Toolbar,
  ToolbarItemUnion,
  useActive,
  useCommands,
  useRemirrorContext,
  useCurrentSelection,
  useAttrs,
  useChainedCommands,
  useMarkRange,
  useExtension,
  FloatingWrapper,
} from "@remirror/react";
import { useCallback, useMemo, useState } from "react";
import { LinkExtension } from "remirror/extensions";
import { ModalDecorator } from "../ui/ModalDecorator";
import Button from "../ui/Button";
import { nearestWordPositioner } from "./Positioners";

const ConnectModal = styled(ModalDecorator)`
  &__Overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    transition: all 1s ease-in;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 2000;
  }

  &__Content {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    border: none;
    background: black;
    overflow: auto;
    border-radius: 3px;
    outline: none;
    padding: 80px;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    text-align: center;
    //min-width: 20vw;
    //min-height: 30vw;
    color: white;
    display: flex;
    //width: 70vw;
    //max-width: 600px;
    max-height: 90vh;
    z-index: 2001;
  }
`;

const MenuContainer = styled.div`
  background: #222;
  /* flex-shrink: 1; */

  .remirror-role {
    background-color: #222;
  }

  .remirror-toolbar {
    flex-wrap: wrap;
  }

  .remirror-menu-pane-label {
    color: #ccc;
  }

  .remirror-button {
    color: #ccc;
    background-color: #333;

    &.remirror-button-active {
      background-color: #a983ff;
      color: #fff;
    }
  }
`;

function useLink() {
  const range = useMarkRange("link");
  const chain = useChainedCommands();
  const url = (useAttrs().link()?.href as string) ?? "";
  const selection = useCurrentSelection();
  const active = useActive(true);
  const linkActive = active.link();

  const onEditLink = useCallback(() => {
    if (selection.empty && !range) {
      return;
    }

    setIsOpen(true);
  }, [selection.empty, range]);

  const onRemoveLink = useCallback(() => {
    if (!linkActive) {
      return;
    }

    chain.removeLink().run();
  }, [linkActive]);

  const onSubmitLink = useCallback(
    (href: string) => {
      setIsOpen(false);

      if (!href) {
        chain.removeLink();
      } else {
        chain.updateLink({ href, auto: false });
      }

      chain.focus(selection.to).run();
    },
    [selection.to]
  );
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);
  const openModal = useCallback(() => setIsOpen(true), []);

  // Listen for shortcuts.
  useExtension(
    LinkExtension,
    ({ addHandler }) =>
      addHandler("onShortcut", (props) => {
        if (isOpen) {
          return;
        }

        openModal();
      }),
    [isOpen, openModal]
  );

  return useMemo(
    () => ({
      url,
      linkActive,
      onEditLink,
      onRemoveLink,
      onSubmitLink,
      isOpen,
      onClose,
      openModal,
      canEdit: !selection.empty || !!range,
    }),
    [
      url,
      linkActive,
      onEditLink,
      onRemoveLink,
      isOpen,
      onClose,
      openModal,
      onSubmitLink,
      selection.empty,
      range,
    ]
  );
}

interface LinkModalProps {
  isOpen: boolean;
  url: string;
  onSubmitLink: (link: string) => void;
  onClose: () => void;
}

const LinkModal = (props: LinkModalProps) => {
  const { isOpen, url, onSubmitLink, onClose } = props;
  const [value, setValue] = useState(url);

  return (
    <ConnectModal isOpen={isOpen} onRequestClose={onClose}>
      <Wrapper>
        <Row>
          <Label>Link</Label>
          <Input
            type="text"
            name="url"
            defaultValue={url}
            autoFocus={true}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                onSubmitLink(value);
              }
            }}
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
        </Row>
        <Button onClick={() => onSubmitLink(value)}>Submit</Button>
      </Wrapper>
    </ConnectModal>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  font-family: "Alagard", serif;
  margin-bottom: 12px;
`;
const Input = styled.input`
  font-family: "Alagard", serif;
  font-size: 18px;
`;
const Label = styled.label`
  font-size: 24px;
  margin-right: 10px;
`;

interface OpenLinkProps {
  url: string;
}

const LinkWrapper = styled.div`
  background: #222;
  padding: 0px 3px;
  border: 1px white solid;

  a {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
    font-size: 14px;
    text-decoration: none;
    font-weight: normal;
  }
`;

const OpenLink = (props: OpenLinkProps) => {
  const { url } = props;

  return (
    <FloatingWrapper
      enabled={!!url}
      placement="bottom"
      positioner={nearestWordPositioner}
    >
      {url && (
        <LinkWrapper>
          <a href={url} target="_blank" rel="noreferrer noopener">
            {url}
          </a>{" "}
          ⬈
        </LinkWrapper>
      )}
    </FloatingWrapper>
  );
};

export const EditorMenu = () => {
  const {
    url,
    linkActive,
    onRemoveLink,
    onEditLink,
    isOpen,
    onClose,
    canEdit,
    onSubmitLink,
  } = useLink();
  const onClearContent = useClearAllContent();
  const onClickImage = useOnClickImage();

  const toolbarItems = useMemo(
    () =>
      createToolbarItems({
        linkActive,
        onClearContent,
        onClickImage,
        onEditLink,
        onRemoveLink,
        canEdit,
      }),
    [linkActive, onClearContent, onEditLink, onRemoveLink, onEditLink]
  );

  return (
    <>
      <MenuContainer>
        <LinkModal
          isOpen={isOpen}
          url={url}
          onClose={onClose}
          onSubmitLink={onSubmitLink}
        />
        <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
        <OpenLink url={url} />
      </MenuContainer>
    </>
  );
};

interface CreateToolbarItemsProps {
  onClickImage: () => void;
  onEditLink: () => void;
  onRemoveLink: () => void;

  onClearContent: () => void;
  linkActive: boolean;
  canEdit: boolean;
}

function createToolbarItems(
  props: CreateToolbarItemsProps
): ToolbarItemUnion[] {
  const {
    onClickImage,
    onEditLink,

    onRemoveLink,
    onClearContent,
    linkActive,
    canEdit,
  } = props;

  return [
    {
      type: ComponentItem.ToolbarGroup,
      label: "Headings",
      items: [
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleHeading",
          attrs: { level: 1 },
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleHeading",
          attrs: { level: 2 },
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarMenu,
          icon: "heading",
          label: "Headings",
          menuLabel: "H",

          items: [
            {
              type: ComponentItem.MenuGroup,
              role: "radio",
              items: [
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: "toggleHeading",
                  attrs: { level: 3 },
                },
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: "toggleHeading",
                  attrs: { level: 4 },
                },
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: "toggleHeading",
                  attrs: { level: 5 },
                },
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: "toggleHeading",
                  attrs: { level: 6 },
                },
              ],
            },
          ],
        },
      ],
      separator: "end",
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: "Formatting",
      items: [
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleBold",
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleItalic",
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleStrike",
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleCode",
          display: "icon",
        },
      ],
      separator: "end",
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: "Lists",
      items: [
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleBulletList",
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleOrderedList",
          display: "icon",
        },
      ],
      separator: "end",
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: "Blocks",
      items: [
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleBlockquote",
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: "toggleCodeBlock",
          display: "icon",
        },
        {
          type: ComponentItem.ToolbarButton,
          icon: "imageLine",
          onClick: onClickImage,
          active: false,
        },
        {
          type: ComponentItem.ToolbarButton,
          icon: linkActive ? "linkM" : "link",
          active: linkActive,
          focusable: true,
          disabled: !canEdit,
          onClick: linkActive ? onEditLink : onEditLink,
          refocusEditor: false,
        },
        {
          type: ComponentItem.ToolbarButton,
          icon: "linkUnlink",
          disabled: !linkActive,
          focusable: linkActive,
          onClick: onRemoveLink,
          refocusEditor: true,
        },
      ],
      separator: "end",
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: "Clear",
      items: [
        {
          type: ComponentItem.ToolbarButton,
          icon: "deleteBinLine",
          onClick: onClearContent,
          refocusEditor: false,
        },
      ],
      separator: "none",
    },
  ];
}

function useClearAllContent() {
  const { clearContent } = useRemirrorContext();

  return useCallback(() => {
    const confirmed = confirm("Are you sure you want to clear all contents?");
    if (confirmed) {
      clearContent();
    }
  }, [clearContent]);
}

function useOnClickImage() {
  const { uploadFiles } = useCommands();

  const onClickImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.addEventListener("change", (event: Event) => {
      const { files } = event.target as HTMLInputElement;

      if (files) {
        uploadFiles(Array.from(files));
      }
    });

    input.click();
  }, [uploadFiles]);

  return onClickImage;
}
