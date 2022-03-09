import { useEthers, useGasPrice } from "@usedapp/core";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "react-use";
import { Flex } from "rebass";
import { useExistingLoreData } from "../../components/AddLore/addLoreHelpers";
import { NEW_LORE_DEFAULT_MARKDOWN } from "../../components/AddLore/loreDefaults";
import { TokenConfiguration } from "../../components/AddLore/WizardPicker";
import LoreMarkdownRenderer from "../../components/Lore/LoreMarkdownRenderer";
import { useExtractColors } from "../../hooks/useExtractColors";

const MarkdownEditor = dynamic(() => import("../../components/editor"), {
  ssr: false,
});

const MemoMarkdownEditor = memo(MarkdownEditor);

const TEMP_LORE_DEFAULT_MARKDOWN = `
https://www.youtube.com/watch?v=dQw4w9WgXcQ

![wizards-2140-2-back.png](https://www.forgottenrunes.com/static/img/forgotten-runes-logo.png)

Best wizard of all is @wizard2140. His dreams of befriending @pony0 one day. Watch out for @soul1732!
`;

const WriteLore = ({}: {}) => {
  const [previewText, setPreviewText] = useState<string>(
    NEW_LORE_DEFAULT_MARKDOWN
  );
  const [editorText, setEditorText] = useState<string>(
    NEW_LORE_DEFAULT_MARKDOWN
  );

  const [currentBgColor, setCurrentBgColor] = useState<string>("#3A110F");
  const [nsfw, setNsfw] = useState<boolean>();
  const [pickedToken, setPickedToken] = useState<TokenConfiguration>();

  const [firstImageUrl, setFirstImageUrl] = useState<string | undefined>();
  const { bgColor: firstImageBgColor } = useExtractColors(firstImageUrl);

  const router = useRouter();
  const { library, account, chainId } = useEthers();
  const gas = useGasPrice();

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Make preview only update after some delay
  useDebounce(
    () => {
      setPreviewText(editorText);
    },
    500,
    [editorText]
  );

  useEffect(() => {
    if (firstImageBgColor && !currentBgColor) {
      setCurrentBgColor(firstImageBgColor);
    }
  }, [firstImageBgColor]);

  //in case of editing
  const {
    isEditMode,
    existingLoreToken,
    existingLore,
    existingLoreBgColor,
    existingLoreIndex,
    existingLoreError,
  } = useExistingLoreData();

  useEffect(() => {
    if (existingLore) {
      setPreviewText(existingLore);
      setEditorText(existingLore);
    }
    if (existingLoreBgColor) {
      setCurrentBgColor(existingLoreBgColor);
    }
    if (existingLoreToken) setPickedToken(existingLoreToken);
  }, [existingLoreToken, existingLore, existingLoreBgColor]);

  const onChangeMarkdown = useCallback((markdown: string) => {
    console.log("[onChangeMarkdown] markdown:", markdown);
    setEditorText(markdown);
  }, []);

  return (
    <Flex flexDirection={"column"} pb={6} p={4} pr={4}>
      <Flex flex={1} flexDirection={"column"}>
        <h4>{isEditMode ? "Editing existing entry" : "New lore entry"}</h4>
        <MemoMarkdownEditor
          initialContent={TEMP_LORE_DEFAULT_MARKDOWN}
          onChangeMarkdown={onChangeMarkdown}
        />
      </Flex>
      <Flex flex={1} pl={2} flexDirection={"column"}>
        <h4>Preview</h4>
        <LoreMarkdownRenderer markdown={previewText} bgColor={currentBgColor} />
      </Flex>
    </Flex>
  );
};

export default WriteLore;
