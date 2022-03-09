import styled from "@emotion/styled";
import { useActive, useCommands, useRemirrorContext } from "@remirror/react";
import { useCallback } from "react";

const MenuContainer = styled.div`
  background: #681515;
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

function useOpenUplpadDialog() {
  const { uploadFiles } = useCommands();

  const openUplpadDialog = useCallback(() => {
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

  return openUplpadDialog;
}

const MenuButtons = () => {
  const commands = useCommands();
  const active = useActive(true);
  const clearAllContent = useClearAllContent();
  const openUplpadDialog = useOpenUplpadDialog();

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

export const EditorMenu = () => {
  return (
    <MenuContainer>
      <MenuButtons />
    </MenuContainer>
  );
};
