import React, { memo, useCallback, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";

import { Box, Flex } from "rebass";
import LoreMarkdownRenderer, {
  getCloudinaryFrontedImageSrc,
} from "../../components/Lore/LoreMarkdownRenderer";
import { useExtractColors } from "../../hooks/useExtractColors";
import {
  TokenConfiguration,
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
  pinFileToIpfs,
  submitV2Lore,
  useExistingLoreData,
} from "../../components/AddLore/addLoreHelpers";
import { useRouter } from "next/router";
import { getTokenImageSrc } from "../../lib/nftUtilis";
import "react-toastify/dist/ReactToastify.css";
import StyledToastContainer from "../../components/StyledToastContainer";
import { NEW_LORE_DEFAULT_MARKDOWN } from "../../components/AddLore/loreDefaults";
import { ConnectWalletButton } from "../../components/web3/ConnectWalletButton";
import { GetStaticPropsContext } from "next";
import { client } from "~/lib/graphql";
import { gql } from "@apollo/client";
import { BOOK_OF_LORE_ADDRESS } from "~/contracts/ForgottenRunesWizardsCultContract";
import { MentionAtomNodeAttributes } from "remirror/extensions";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

const MarkdownEditor = dynamic(() => import("../../components/editor"), {
  ssr: false,
});

const MemoMarkdownEditor = memo(MarkdownEditor);

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

  const fetchingExistingLore = !existingLore && isEditMode;

  return (
    <Flex flexDirection={"column"} pb={6} p={4} pr={4}>
      <Flex
        flexDirection="row"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Image
          src="/static/img/forgotten-runes-logo.png"
          width="200"
          height={"66"}
        />
        <Flex
          flexDirection={"row"}
          alignItems={"center"}
          pb={0}
          alignSelf={"center"}
        >
          {pickedToken && (
            <img
              width={"80"}
              height={"80"}
              src={getTokenImageSrc(
                pickedToken.tokenId,
                pickedToken.tokenAddress
              )}
            />
          )}

          <Spacer pl={2} />
          {pickedToken ? (
            <h2>
              {pickedToken.name} #{pickedToken.tokenId}{" "}
            </h2>
          ) : (
            <h2>Pick a character</h2>
          )}
        </Flex>
        <div style={{ width: 200 }} />
      </Flex>
      {!pickedToken && !isEditMode && !account && (
        <Box p={6} alignSelf={"center"}>
          <ConnectWalletButton showOpen={true} />
        </Box>
      )}

      {!pickedToken && !isEditMode && account && (
        <>
          <Flex
            flexDirection="column"
            alignItems={"center"}
            p={6}
            width={"100%"}
          >
            <WizardList onWizardPicked={setPickedToken} />
            <Spacer pt={6} />
            <i style={{ fontSize: "12px" }}>
              Connected to{" "}
              <strong>{getChainById(chainId as ChainId)?.chainName}</strong>{" "}
              with address <strong>{account}</strong>
            </i>
          </Flex>
        </>
      )}
      {fetchingExistingLore && <h1>Fetching existing lore entry...</h1>}

      {pickedToken && !fetchingExistingLore ? (
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
            <Flex flex={1} flexDirection={"column"}>
              <h4>
                {isEditMode ? "Editing existing entry" : "New lore entry"}
              </h4>
              <MemoMarkdownEditor
                initialContent={previewText}
                onChangeMarkdown={onChangeMarkdown}
                mentionableTokens={mentionableTokens}
                imageUploader={async (f: File) => {
                  try {
                    const res = await pinFileToIpfs(f, -1, "N/A");
                    const url = `ipfs://${res.IpfsHash}`;

                    const { newSrc: cloudinaryUrl } =
                      getCloudinaryFrontedImageSrc(url);

                    if (!firstImageUrl) {
                      setFirstImageUrl(cloudinaryUrl);
                    }

                    return { url };
                  } catch (e: any) {
                    console.error(e);
                    return { url: "Problem uploading, please try again..." };
                  }
                }}
              />
              {/*<MdEditor*/}
              {/*  allowPasteImage={false}*/}
              {/*  onChangeTrigger={"afterRender"}*/}
              {/*  value={editorText}*/}
              {/*  style={{ height: "100%" }}*/}
              {/*  view={{ menu: true, md: true, html: false }}*/}
              {/*  plugins={[*/}
              {/*    "header",*/}
              {/*    "font-bold",*/}
              {/*    "font-italic",*/}
              {/*    "font-underline",*/}
              {/*    "font-strikethrough",*/}
              {/*    "list-unordered",*/}
              {/*    "list-ordered",*/}
              {/*    "block-quote",*/}
              {/*    "block-wrap",*/}
              {/*    "block-code-inline",*/}
              {/*    "block-code-block",*/}
              {/*    "image",*/}
              {/*    "link",*/}
              {/*    "clear",*/}
              {/*  ]}*/}
              {/*  renderHTML={(text) => <></>}*/}
              {/*  onChange={(value) => {*/}
              {/*    setEditorText(value.text);*/}
              {/*  }}*/}
              {/*  onImageUpload={async (f: File) => {*/}
              {/*    try {*/}
              {/*      const res = await pinFileToIpfs(f, -1, "N/A");*/}

              {/*      const url = `ipfs://${res.IpfsHash}`;*/}
              {/*      if (!firstImageUrl) {*/}
              {/*        setFirstImageUrl(url);*/}
              {/*      }*/}
              {/*      return url;*/}
              {/*    } catch (e: any) {*/}
              {/*      console.error(e);*/}
              {/*      return "Problem uploading, please try again...";*/}
              {/*    }*/}
              {/*  }}*/}
              {/*/>*/}
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
                Gas approx{" "}
                {parseInt(formatUnits(gas ?? BigNumber.from(0), "gwei"))} gwei
              </i>
              <Spacer pl={3} />
              <WriteButton
                size="medium"
                onClick={async () =>
                  await submitV2Lore({
                    nsfw: nsfw,
                    tokenId: pickedToken?.tokenId,
                    tokenContract: pickedToken?.tokenAddress,
                    loreIndex: isEditMode ? existingLoreIndex : undefined,
                    setErrorMessage: () => {},
                    setSubmitting: setSubmitting,
                    body: previewText,
                    title: `The Lore of ${pickedToken?.name}`,
                    bgColor: currentBgColor,
                    provider: library,
                    router: router,
                  })
                }
              >
                Save Your Lore
              </WriteButton>
            </Flex>
          </Flex>
        </>
      ) : null}
      <StyledToastContainer theme="dark" />
    </Flex>
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
