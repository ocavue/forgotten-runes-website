import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";

import { Box, Flex } from "rebass";
import LoreMarkdownRenderer from "../../components/Lore/LoreMarkdownRenderer";
import { useExtractColors } from "../../hooks/useExtractColors";
import {
  WizardConfiguration,
  WizardList,
} from "../../components/AddLore/WizardPicker";
import Spacer from "../../components/Spacer";
import { ChainId, getChainById, useEthers, useGasPrice } from "@usedapp/core";
import { formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import {
  BackgroundColorPickerField,
  NSFWField,
} from "../../components/AddLore/AddLoreFields";
import { useDebounce } from "react-use";
import { WriteButton } from "../../components/AddLore/AddLoreControls";
import {
  submitV2Lore,
  useExistingLoreData,
} from "../../components/AddLore/addLoreHelpers";
import { useRouter } from "next/router";
import { getTokenImageSrc } from "../../lib/nftUtilis";
import "react-toastify/dist/ReactToastify.css";
import StyledToastContainer from "../../components/StyledToastContainer";
import { NEW_LORE_DEFAULT_MARKDOWN } from "../../components/AddLore/loreDefaults";
import { ConnectWalletButton } from "../../components/web3/ConnectWalletButton";
import { NETWORKS } from "../../constants";
import { MarkdownEditor } from "~/components/editor";
import { uploadImageIpfs } from "../../components/editor/uploadImageIpfs";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

const WriteLore = ({}: {}) => {
  const [previewText, setPreviewText] = useState<string>(
    NEW_LORE_DEFAULT_MARKDOWN
  );
  const [editorText, setEditorText] = useState<string>(
    NEW_LORE_DEFAULT_MARKDOWN
  );

  const [currentBgColor, setCurrentBgColor] = useState<string>("#3A110F");
  const [nsfw, setNsfw] = useState<boolean>();
  const [pickedToken, setPickedToken] = useState<WizardConfiguration>();

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

  return (
    <Flex flexDirection={"column"} pb={6} p={4} pr={4}>
      <Flex flex={1} flexDirection={"column"}>
        <h4>{isEditMode ? "Editing existing entry" : "New lore entry"}</h4>
        <MarkdownEditor
          initialContent={
            /*NEW_LORE_DEFAULT_MARKDOWN*/ "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          }
        />
        <div
          style={{ height: "100%" }}
          onPaste={async () =>
            console.log(await navigator.clipboard.readText())
          }
        >
          <MdEditor
            allowPasteImage={false}
            onChangeTrigger={"afterRender"}
            value={editorText}
            style={{ height: "100%" }}
            view={{ menu: true, md: true, html: false }}
            plugins={[
              "header",
              "font-bold",
              "font-italic",
              "font-underline",
              "font-strikethrough",
              "list-unordered",
              "list-ordered",
              "block-quote",
              "block-wrap",
              "block-code-inline",
              "block-code-block",
              "image",
              "link",
              "clear",
            ]}
            renderHTML={(text) => <></>}
            onChange={(value) => {
              setEditorText(value.text);
            }}
            onImageUpload={uploadImageIpfs(firstImageUrl, setFirstImageUrl)}
          />
        </div>
      </Flex>
      <Flex flex={1} pl={2} flexDirection={"column"}>
        <h4>Preview</h4>
        <LoreMarkdownRenderer markdown={previewText} bgColor={currentBgColor} />
      </Flex>
    </Flex>
  );
};

export default WriteLore;
