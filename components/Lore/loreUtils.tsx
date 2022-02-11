import { LorePageData } from "./types";

import IndividualLorePage, {
  CoreCharacterPage,
  EmptyLorePage,
  NsfwOrStruckLorePage,
} from "./IndividualLorePage";
import React from "react";
import { CHARACTER_CONTRACTS } from "../../contracts/ForgottenRunesWizardsCultContract";

export type LoreBookPageComponents = {
  currentLeftPage: any;
  currentRightPage: any;
};

export type WizardLorePageRoute = {
  as: string;
  wizardId: number;
  loreIdx: number;
};

export function typeSetter({
  loreTokenSlug,
  tokenId,
  tokenName,
  tokenImage,
  tokenBg,
  currentOwner,
  lorePageData,
}: {
  loreTokenSlug: "wizards" | "souls" | "ponies" | "narrative";
  tokenId: number;
  tokenName: string;
  tokenImage: string;
  tokenBg?: string;
  currentOwner?: string;
  lorePageData: LorePageData;
}) {
  const components: LoreBookPageComponents = {
    currentLeftPage: null,
    currentRightPage: null,
  };

  // Left
  if (!lorePageData.leftPage.isEmpty) {
    if (lorePageData.leftPage.nsfw) {
      components.currentLeftPage = <NsfwOrStruckLorePage nsfw={true} />;
    } else if (lorePageData.leftPage.struck) {
      components.currentLeftPage = <NsfwOrStruckLorePage />;
    } else {
      components.currentLeftPage = (
        <IndividualLorePage
          bgColor={lorePageData.leftPage.bgColor ?? "#000000"}
          story={lorePageData.leftPage.story as string}
        />
      );
    }
  } else {
    components.currentLeftPage = (
      <CoreCharacterPage
        tokenAddress={
          CHARACTER_CONTRACTS[loreTokenSlug as "ponies" | "wizards" | "souls"]
        }
        tokenId={tokenId.toString()}
        tokenName={tokenName}
        tokenImage={tokenImage}
        tokenBg={tokenBg}
        currentOwner={currentOwner}
      />
    );
  }

  // Right
  if (!lorePageData.rightPage.isEmpty) {
    if (lorePageData.rightPage.nsfw) {
      components.currentRightPage = <NsfwOrStruckLorePage nsfw={true} />;
    } else if (lorePageData.rightPage.struck) {
      components.currentRightPage = <NsfwOrStruckLorePage />;
    } else {
      components.currentRightPage = (
        <IndividualLorePage
          bgColor={lorePageData.rightPage.bgColor ?? "#000000"}
          story={lorePageData.rightPage.story as string}
        />
      );
    }
  } else {
    components.currentRightPage = (
      <EmptyLorePage
        pageNum={lorePageData.rightPage?.pageNumber ?? 0}
        loreTokenSlug={loreTokenSlug as "ponies" | "wizards" | "souls"}
        tokenId={tokenId}
      />
    );
  }

  return {
    components,
  };
}

export function getLoreUrl(
  loreTokenSlug: string,
  tokenId: number,
  pageNum: number
) {
  return `/lore/${loreTokenSlug}/${tokenId}/${pageNum}`;
}
