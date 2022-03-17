import { useEthers, useGasPrice } from "@usedapp/core";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "react-use";
import { Flex } from "rebass";
import {
  BackgroundColorPickerField,
  NSFWField,
} from "~/components/AddLore/AddLoreFields";
import { WriteButton } from "~/components/Lore/BookOfLoreControls";
import Spacer from "~/components/Spacer";
import {
  pinFileToIpfs,
  useExistingLoreData,
} from "../../components/AddLore/addLoreHelpers";
import { NEW_LORE_DEFAULT_MARKDOWN } from "../../components/AddLore/loreDefaults";
import { TokenConfiguration } from "../../components/AddLore/WizardPicker";
import LoreMarkdownRenderer, {
  getCloudinaryFrontedImageSrc,
} from "../../components/Lore/LoreMarkdownRenderer";
import { useExtractColors } from "../../hooks/useExtractColors";
import { GetStaticPropsContext } from "next";
import { client } from "~/lib/graphql";
import { gql } from "@apollo/client";
import { MentionAtomNodeAttributes } from "remirror/extensions";

const MarkdownEditor = dynamic(() => import("../../components/editor"), {
  ssr: false,
});

const MemoMarkdownEditor = memo(MarkdownEditor);

const TEMP_LORE_DEFAULT_MARKDOWN = `
https://www.youtube.com/watch?v=dQw4w9WgXcQ

![wizards-2140-2-back.png](https://www.forgottenrunes.com/static/img/forgotten-runes-logo.png)

Best wizard of all is @wizard2140. His dreams of befriending @pony0 one day. Watch out for @soul1732!
`;

const WriteLore = ({
  mentionableTokens,
}: {
  mentionableTokens: MentionAtomNodeAttributes[];
}) => {
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
    <>
      <Flex
        flexDirection={"row"}
        height={"740px"}
        width={"100%"}
        style={{ position: "relative" }}
      >
        {submitting && (
          <Flex
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            style={{
              position: "absolute",
              zIndex: 100,
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgb(0,0,0,0.5)",
            }}
          >
            <h1>Uploading your lore....</h1>
          </Flex>
        )}
        <Flex flex={1} flexDirection="column">
          <h4>{isEditMode ? "Editing existing entry" : "New lore entry"}</h4>
          <MemoMarkdownEditor
            mentionableTokens={mentionableTokens}
            initialContent={previewText}
            onChangeMarkdown={onChangeMarkdown}
            imageUploader={async (f: File) => {
              try {
                const res = await pinFileToIpfs(f, -1, "N/A");

                const { newSrc: url } = getCloudinaryFrontedImageSrc(
                  `ipfs://${res.IpfsHash}`
                );
                if (!firstImageUrl) {
                  setFirstImageUrl(url);
                }
                return { url };
              } catch (e: any) {
                console.error(e);
                return { url: "Problem uploading, please try again..." };
              }
            }}
          />
        </Flex>
        <Flex flex={1} pl={2} flexDirection={"column"}>
          <h4>Preview</h4>
          <LoreMarkdownRenderer
            markdown={previewText}
            bgColor={currentBgColor}
          />
        </Flex>
      </Flex>
      <Flex flexDirection={"row"} width={"100%"}>
        <Flex
          flex={1}
          flexDirection={"row"}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          <NSFWField name="isNsfw" onChange={setNsfw} />
          <Spacer pl={2} />
          <BackgroundColorPickerField
            name={"color-picker"}
            currentBackgroundColor={currentBgColor ?? "#000000"}
            onChange={(color) => setCurrentBgColor(color ?? "#000000")}
          />
        </Flex>
        <Flex
          flex={1}
          pl={2}
          flexDirection={"row"}
          justifyContent={"flex-end"}
          alignItems={"center"}
        >
          <i>
            Gas approx {parseInt(formatUnits(gas ?? BigNumber.from(0), "gwei"))}{" "}
            gwei
          </i>
          <Spacer pl={3} />
          <WriteButton size="medium" onClick={async () => {}}>
            Save Your Lore
          </WriteButton>
        </Flex>
      </Flex>
    </>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      mentionableTokens: (
        await client.query({
          query: gql`
            query Tokens {
              Token {
                tokenId
                pony {
                  name
                }
                wizard {
                  name
                }
                soul {
                  name
                }
              }
            }
          `,
        })
      ).data.Token.map((tokenData: any): MentionAtomNodeAttributes => {
        const actualToken =
          tokenData.wizard ?? tokenData.soul ?? tokenData.pony;
        const tokenType = tokenData.wizard
          ? "wizard"
          : tokenData.soul
          ? "soul"
          : tokenData.pony
          ? "pony"
          : "unknown";

        return {
          id: `${tokenType}${tokenData.tokenId}`,
          label: actualToken?.name ?? `${tokenType} #${tokenData.tokenId} `,
        };
      }),
    },
    revalidate: 12 * 60 * 60,
  };
}

export default WriteLore;
