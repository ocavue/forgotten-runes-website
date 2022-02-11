import React from "react";
import BookOfLoreControls from "./BookOfLoreControls";
import { LorePageData } from "./types";
import { typeSetter } from "./loreUtils";
import BookFrame from "./BookFrame";

export type Props = {
  loreTokenSlug: "wizards" | "souls" | "ponies" | "narrative";
  tokenId: number;
  tokenName: string;
  tokenImage: string;
  tokenBg?: string;
  currentOwner?: string;
  lorePageData: LorePageData;
};

const Book = ({
  loreTokenSlug,
  tokenId,
  tokenName,
  tokenImage,
  tokenBg,
  currentOwner,
  lorePageData,
}: Props) => {
  const bg = tokenBg ? "#" + tokenBg : "#000000";

  const { components } = typeSetter({
    loreTokenSlug,
    tokenId,
    tokenName,
    tokenImage,
    tokenBg,
    currentOwner,
    lorePageData,
  });

  const { currentLeftPage, currentRightPage } = components;

  const controls = (
    <BookOfLoreControls
      loreTokenSlug={loreTokenSlug}
      tokenId={tokenId}
      tokenName={tokenName}
      previousPageRoute={lorePageData.previousPageRoute}
      nextPageRoute={lorePageData.nextPageRoute}
      leftPageLoreIndex={lorePageData.leftPage?.loreIndex}
      rightPageLoreIndex={lorePageData.rightPage?.loreIndex}
      leftPageCreator={lorePageData.leftPage.creator}
      rightPageCreator={lorePageData.rightPage.creator}
    />
  );

  return (
    <BookFrame
      bg={bg}
      bgL={lorePageData.leftPage?.bgColor ?? "#000000"}
      bgR={lorePageData.rightPage?.bgColor ?? "#000000"}
      controls={controls}
      previousPageRoute={lorePageData.previousPageRoute}
      nextPageRoute={lorePageData.nextPageRoute}
    >
      {currentLeftPage}
      {currentRightPage}
    </BookFrame>
  );
};

export default Book;
