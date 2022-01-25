import { LorePageData } from "./types";

import IndividualLorePage, {
  CoreCharacterPage,
  EmptyLorePage,
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
  lorePageData,
}: {
  loreTokenSlug: "wizards" | "souls";
  tokenId: number;
  lorePageData: LorePageData;
}) {
  const components: LoreBookPageComponents = {
    currentLeftPage: null,
    currentRightPage: null,
  };

  components.currentLeftPage = !lorePageData.leftPage.isEmpty ? (
    <IndividualLorePage
      bgColor={lorePageData.leftPage.bgColor ?? "#000000"}
      story={lorePageData.leftPage.story as string}
    />
  ) : (
    <CoreCharacterPage
      tokenAddress={CHARACTER_CONTRACTS[loreTokenSlug]}
      tokenId={tokenId.toString()}
    />
  );

  components.currentRightPage = !lorePageData.rightPage.isEmpty ? (
    <IndividualLorePage
      bgColor={lorePageData.rightPage.bgColor ?? "#000000"}
      story={lorePageData.rightPage.story as string}
    />
  ) : (
    <EmptyLorePage
      pageNum={lorePageData.rightPage?.pageNumber ?? 0}
      loreTokenSlug={loreTokenSlug}
      tokenId={tokenId}
    />
  );

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
