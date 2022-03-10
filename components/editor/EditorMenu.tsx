import styled from "@emotion/styled";
import {
  ComponentItem,
  Toolbar,
  ToolbarItemUnion,
  useActive,
  useCommands,
  useRemirrorContext,
} from "@remirror/react";
import { useCallback, useMemo } from "react";

const MenuContainer = styled.div`
  background: #222;

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

const MenuButtonContainer = styled.button<{ actived?: boolean }>`
  background: ${(props) => (props.actived ? "yellow" : "blue")};
`;

const MenuButton: React.FC<{ onClick: () => void; actived?: boolean }> = ({
  onClick,
  actived,
  children,
}) => {
  return (
    <MenuButtonContainer
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      actived={actived}
    >
      {children}
    </MenuButtonContainer>
  );
};

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

const MenuButtons = () => {
  const commands = useCommands();
  const active = useActive(true);
  const clearAllContent = useClearAllContent();
  const openUplpadDialog = useOnClickImage();

  return (
    <>
      <MenuButton
        onClick={() => commands.toggleHeading({ level: 1 })}
        actived={active.heading({ level: 1 })}
      >
        H1
      </MenuButton>
      <MenuButton
        onClick={() => commands.toggleHeading({ level: 2 })}
        actived={active.heading({ level: 2 })}
      >
        H2
      </MenuButton>
      <MenuButton
        onClick={() => commands.toggleHeading({ level: 3 })}
        actived={active.heading({ level: 3 })}
      >
        H3
      </MenuButton>
      <MenuButton
        onClick={() => commands.toggleHeading({ level: 4 })}
        actived={active.heading({ level: 4 })}
      >
        H4
      </MenuButton>
      <MenuButton
        onClick={() => commands.toggleHeading({ level: 5 })}
        actived={active.heading({ level: 5 })}
      >
        H5
      </MenuButton>
      <MenuButton
        onClick={() => commands.toggleHeading({ level: 6 })}
        actived={active.heading({ level: 6 })}
      >
        H6
      </MenuButton>

      <MenuButton onClick={() => commands.toggleBold()} actived={active.bold()}>
        Bold
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleItalic()}
        actived={active.italic()}
      >
        Italic
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleUnderline()}
        actived={active.underline()}
      >
        Underline
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleStrike()}
        actived={active.strike()}
      >
        Strike
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleBulletList()}
        actived={active.bulletList()}
      >
        BulletList
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleOrderedList()}
        actived={active.orderedList()}
      >
        OrderedList
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleBlockquote()}
        actived={active.blockquote()}
      >
        Blockquote
      </MenuButton>

      <MenuButton onClick={() => commands.toggleCode()} actived={active.code()}>
        InlineCode
      </MenuButton>

      <MenuButton
        onClick={() => commands.toggleCodeBlock({ language: "" })}
        actived={active.codeBlock()}
      >
        CodeBlock
      </MenuButton>

      <MenuButton onClick={() => openUplpadDialog()}>InsertImage</MenuButton>

      <MenuButton onClick={() => clearAllContent()}>ClearAllContent</MenuButton>
    </>
  );
};

function useLink() {
  const active = useActive(true);
  const linkActive = active.link();
  const onCreateLink = useCallback(() => {}, []);
  const onRemoveLink = useCallback(() => {}, []);
  const onEditLink = useCallback(() => {}, []);

  return useMemo(
    () => ({ linkActive, onCreateLink, onRemoveLink, onEditLink }),
    [linkActive, onCreateLink, onRemoveLink, onEditLink]
  );
}

export const EditorMenu = () => {
  const { linkActive, onCreateLink, onRemoveLink, onEditLink } = useLink();
  const onClearContent = useClearAllContent();
  const onClickImage = useOnClickImage();

  const toolbarItems = useMemo(
    () =>
      createToolbarItems({
        linkActive,
        onClearContent,
        onClickImage,
        onCreateLink,
        onRemoveLink,
        onEditLink,
      }),
    [linkActive, onClearContent, onCreateLink, onRemoveLink, onEditLink]
  );

  return (
    <MenuContainer>
      <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
    </MenuContainer>
  );
};

interface CreateToolbarItemsProps {
  onClickImage: () => void;
  onCreateLink: () => void;
  onRemoveLink: () => void;
  onEditLink: () => void;
  onClearContent: () => void;
  linkActive: boolean;
}

function createToolbarItems(
  props: CreateToolbarItemsProps
): ToolbarItemUnion[] {
  const {
    onClickImage,
    onCreateLink,
    onEditLink,
    onRemoveLink,
    onClearContent,
    linkActive,
  } = props;

  return [
    {
      type: ComponentItem.ToolbarGroup,
      label: "Formatting",
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
          commandName: "toggleUnderline",
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
          onClick: linkActive ? onEditLink : onCreateLink,
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
