import * as React from "react";
import styled from "@emotion/styled";

import ReactMarkdown from "react-markdown";
import { WriteButton } from "./BookOfLoreControls";
import Link from "next/link";
import { motion } from "framer-motion";
import { ResponsivePixelImg } from "../ResponsivePixelImg";
import { loreTextStyles } from "./loreStyles";
import { IPFS_SERVER } from "../../constants";

import Spacer from "../Spacer";
import LoreMarkdownRenderer, {
  getCloudinaryFrontedImageSrc,
} from "./LoreMarkdownRenderer";
import truncateEthAddress from "truncate-eth-address";
import { Flex } from "rebass";

export const TextPage = styled.div<{
  alignSelf?: string;
  alignChildren?: string;
}>`
  display: flex;
  flex-direction: column;

  color: #e1decd;
  font-size: 24px;
  overflow: scroll;
  padding: 1em;
  font-family: "Alagard", serif;
  align-self: ${(props) => props.alignSelf || "flex-start"};

  ${(props) => {
    if (props.alignChildren === "center") {
      return `
      align-items: center;
      /* height: 100%; */
      min-height: 100%;
      justify-content: center;
      `;
    }
  }}

  width: 100%;
  height: 100%;
  ${loreTextStyles};
`;

const LoadingPageText = styled.div``;

type BookOfLorePageProps = {
  bg: string;
  children: any;
};

const BookOfLorePageWrapper = styled(motion.div)<{ bg?: string }>`
  background-color: ${(props) => props.bg || "#000000"};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: scroll;

  // Ties to Book
  height: calc(100% + 96px);
  margin: -75px -14px 0 -14px;

  @media (max-width: 768px) {
    height: calc(100% + 23px);
    margin: 0px -14px 0 -14px;
  }
`;

export function BookOfLorePage({ bg, children }: BookOfLorePageProps) {
  return <BookOfLorePageWrapper bg={bg}>{children}</BookOfLorePageWrapper>;
}

export const CoreCharacterPage = ({
  tokenId,
  tokenAddress,
  tokenName,
  tokenImage,
  tokenBg,
  currentOwner,
}: {
  tokenId: string;
  tokenAddress: string;
  tokenName: string;
  tokenImage: string;
  tokenBg?: string;
  currentOwner?: string;
}) => {
  const { newSrc, fallbackSrc } = getCloudinaryFrontedImageSrc(tokenImage);
  return (
    <BookOfLorePage bg={tokenBg ? "#" + tokenBg : "#000000"}>
      <Flex
        flexDirection={"column"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <div />
        <ResponsivePixelImg src={newSrc} style={{ maxWidth: "480px" }} />
        {currentOwner &&
        currentOwner.toLowerCase() !==
          "0x0000000000000000000000000000000000000000" ? (
          <h4>
            Owner:{" "}
            <Link href={`https://opensea.io/${currentOwner}`}>
              {truncateEthAddress(currentOwner)}
            </Link>
          </h4>
        ) : (
          <div />
        )}
      </Flex>
    </BookOfLorePage>
  );
};

export const NsfwOrStruckLorePage = ({ nsfw }: { nsfw?: boolean }) => {
  return (
    <BookOfLorePage bg={"#000000"}>
      <TextPage alignSelf="center" alignChildren="center">
        <ReactMarkdown>
          {nsfw
            ? `This lore entry has been marked as NSFW and is therefore not shown.`
            : `This lore entry has been struck and is therefore not shown`}
        </ReactMarkdown>
      </TextPage>
    </BookOfLorePage>
  );
};

export const EmptyLorePage = ({
  pageNum,
  loreTokenSlug,
  tokenId,
}: {
  pageNum: number;
  loreTokenSlug: "wizards" | "souls" | "ponies";
  tokenId: number;
}) => {
  const furtherOrAny = pageNum < 1 ? "" : " further";

  return (
    <BookOfLorePage bg={"#000000"}>
      <TextPage alignSelf="center" alignChildren="center">
        <ReactMarkdown>{`No${furtherOrAny} Lore has been recorded...`}</ReactMarkdown>

        <Link href="/lore/write">
          <WriteButton size="medium">Write Your Lore</WriteButton>
        </Link>
        {loreTokenSlug === "souls" && (
          <>
            <Spacer pt={3} />
            <ReactMarkdown>{`[View Lore of the Wizard that became this Soul](/lore/wizards/${tokenId}/0)`}</ReactMarkdown>
          </>
        )}
      </TextPage>
    </BookOfLorePage>
  );
};

export const CLOUDINARY_SERVER = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/fetch/`;

export default function IndividualLorePage({
  bgColor,
  title,
  story,
}: {
  bgColor: string;
  title?: string;
  story?: string;
}) {
  return (
    <BookOfLorePage bg={bgColor}>
      {" "}
      {story && <LoreMarkdownRenderer markdown={story} bgColor={bgColor} />}
    </BookOfLorePage>
  );
}
