import * as React from "react";
import styled from "@emotion/styled";
import productionWizardData from "../../data/nfts-prod.json";
import productionSoulsData from "../../data/souls-prod.json";
import productionPoniesData from "../../data/ponies-prod.json";
import stagingSoulsData from "../../data/souls-staging.json";

import ReactMarkdown from "react-markdown";
import { WriteButton } from "./BookOfLoreControls";
import Link from "next/link";
import { motion } from "framer-motion";
import { ResponsivePixelImg } from "../ResponsivePixelImg";
import { loreTextStyles } from "./loreStyles";
import { IPFS_SERVER } from "../../constants";
import {
  isPoniesContract,
  isSoulsContract,
  isWizardsContract,
} from "../../contracts/ForgottenRunesWizardsCultContract";
import Spacer from "../Spacer";
import LoreMarkdownRenderer from "./LoreMarkdownRenderer";

const wizData = productionWizardData as { [wizardId: string]: any };
const soulsData = (
  parseInt(process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID ?? "1") === 4
    ? stagingSoulsData
    : productionSoulsData
) as { [soulId: string]: any };
const poniesData = productionPoniesData as { [id: string]: any };

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
}: {
  tokenId: string;
  tokenAddress: string;
}) => {
  let bg;
  let imageUrl;
  if (isWizardsContract(tokenAddress)) {
    const wizardData: any = wizData[tokenId.toString()];
    bg = "#" + wizardData.background_color;
    imageUrl = `https://nftz.forgottenrunes.com/wizards/alt/400-nobg/wizard-${tokenId}.png`;
  } else if (isSoulsContract(tokenAddress)) {
    const soulData: any = soulsData[tokenId.toString()];
    bg = "#" + +soulData?.background_color ?? "000000";
    imageUrl = `${process.env.NEXT_PUBLIC_SOULS_API}/api/souls/img/${tokenId}.png`;
  } else if (isPoniesContract(tokenAddress)) {
    const data: any = poniesData[tokenId.toString()];
    bg = "#" + +data?.background_color ?? "000000";
    imageUrl = `${process.env.NEXT_PUBLIC_SOULS_API}/api/shadowfax/img/${tokenId}.png`;
  }

  return (
    <BookOfLorePage bg={bg as string}>
      <ResponsivePixelImg src={imageUrl} style={{ maxWidth: "480px" }} />
    </BookOfLorePage>
  );
};

export const EmptyLorePage = ({
  pageNum,
  loreTokenSlug,
  tokenId,
}: {
  pageNum: number;
  loreTokenSlug: "wizards" | "souls";
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

export const IPFS_HTTP_SERVER = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD
  ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/fetch/f_auto/${IPFS_SERVER}/`
  : `${IPFS_SERVER}/`;

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
