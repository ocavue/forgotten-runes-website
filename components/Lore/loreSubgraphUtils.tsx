import client from "../../lib/graphql";
import { gql } from "@apollo/client";
import {
  CHARACTER_CONTRACTS,
  isPoniesContract,
  isSoulsContract,
  isWizardsContract,
} from "../../contracts/ForgottenRunesWizardsCultContract";
import { getLoreUrl } from "./loreUtils";
import path from "path";
import { IndividualLorePageData } from "./types";
import { hydratePageDataFromMetadata } from "./markdownUtils";
import { promises as fs } from "fs";
import * as os from "os";
import { getContractFromTokenSlug } from "../../lib/nftUtilis";

const COMMON_LORE_FIELDS = `
  id
  index
  creator
  tokenContract
  loreMetadataURI
  tokenId
  struck
  nsfw
  createdAtTimestamp
`;

const LORE_CACHE = path.join(os.tmpdir(), ".lore_cache");

const getCacheLocation = (tokenAddress: string) => {
  return `${LORE_CACHE}_${tokenAddress.toLowerCase()}`;
};

const WIZARDS_THAT_HAVE_LORE_CACHE = path.join(
  os.tmpdir(),
  ".wizards_that_have_lore_cache"
);

export async function bustLoreCache() {
  const files = Object.entries(CHARACTER_CONTRACTS).map(
    ([tokenSlug, tokenAddress]) => getCacheLocation(tokenAddress)
  );

  files.push(WIZARDS_THAT_HAVE_LORE_CACHE);

  for (let index in files) {
    const file = files[index];
    try {
      await fs.unlink(file);
      console.info(`Busted cache at ${file}....`);
    } catch (_) {
      console.warn(
        `Cache file ${file} not deleted, probably didn't exist in first place...`
      );
    }
  }
}

const LORE_CACHE_STALE_AFTER_MINUTES = 5;
const WIZARDS_THAT_HAVE_LORE_CACHE_STALE_AFTER_MINUTES = 10;

export async function getLoreInChapterForm(
  tokenContract: string,
  updateCache: boolean = false
) {
  const cacheFile = getCacheLocation(tokenContract);

  let results;

  try {
    const cachedData = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    if (
      Math.floor((new Date().getTime() - cachedData.timestamp) / 1000 / 60) <=
      LORE_CACHE_STALE_AFTER_MINUTES // For x minutes during a deploy we keep using the file cache for lore
    ) {
      results = cachedData.data;
      console.log("Using cached data for lore yay!");
    }
  } catch (e) {
    /* not fatal */
    console.warn("Cache file didn't exist or we couldn't open it");
  }

  if (!results) {
    console.log("No cached lore data - fetching from graph");

    results = [];

    // Not we optimistically fetch N lore pages at a time - this is a temporary hack as it's faster than waiting for results to then do another request etc
    const serverGraphPagesToFetch = 2;
    const graphResults = await Promise.all(
      Array.from({ length: serverGraphPagesToFetch }, (_, i) =>
        client.query({
          query: gql`
              query WizardLore {
                  loreTokens(skip: ${
                    i * 999
                  }, first: 999, orderBy: tokenId, orderDirection: asc, where: {tokenContract: "${tokenContract}"}) {
                      tokenContract
                      tokenId
                      lore(
                          where: { struck: false, nsfw: false }
                          orderBy: id
                          orderDirection: asc
                      ) {
                          ${COMMON_LORE_FIELDS}
                      }
                  }
              }
          `,
          fetchPolicy: "no-cache",
        })
      )
    );
    console.log(`Got ${graphResults.length} queries worth of results....`);

    for (let i = 0; i < graphResults.length; i++) {
      const loreTokens = graphResults[i]?.data?.loreTokens ?? [];

      console.log(`Query ${i} had ${loreTokens.length} lore tokens`);

      results.push(
        ...loreTokens.map((loreTokenEntry: any) => {
          return {
            tokenId: parseInt(loreTokenEntry.tokenId),
            lore: loreTokenEntry.lore.map((loreEntry: any) => ({
              loreMetadataURI: loreEntry.loreMetadataURI,
              createdAtTimestamp: loreEntry.createdAtTimestamp,
              creator: loreEntry.creator,
              index: loreEntry.index,
            })),
          };
        })
      );
    }

    if (updateCache) {
      console.log("Updating cache file");
      await fs.writeFile(
        cacheFile,
        JSON.stringify({ timestamp: new Date().getTime(), data: results }),
        "utf-8"
      );
    }
  }

  return results;
}

export async function getIndexForToken(
  tokenId: number,
  paginatedLore: { tokenId: number; lore: any[] }[]
) {
  return paginatedLore.findIndex((element) => element.tokenId === tokenId);
}

export async function getLeftRightPages(
  loreTokenSlug: string,
  tokenId: number,
  leftPageNum: number,
  rightPageNum: number
) {
  const tokenContract = getContractFromTokenSlug(loreTokenSlug);
  const loreInChapterForm = await getLoreInChapterForm(tokenContract);

  const chapterIndexForToken = await getIndexForToken(
    tokenId,
    loreInChapterForm
  );

  let leftPage: IndividualLorePageData;
  let rightPage: IndividualLorePageData;

  if (chapterIndexForToken === -1) {
    leftPage = {
      isEmpty: true,
      bgColor: `#000000`,
      firstImage: null,
      pageNumber: leftPageNum,
    };

    rightPage = {
      isEmpty: true,
      bgColor: "#000000",
      firstImage: null,
      pageNumber: rightPageNum,
    };
  } else {
    const lore = loreInChapterForm[chapterIndexForToken]?.lore ?? [];

    if (leftPageNum >= 0 && leftPageNum < lore.length) {
      const loreElement = lore[leftPageNum];
      leftPage = await hydratePageDataFromMetadata(
        loreElement.loreMetadataURI,
        loreElement.createdAtTimestamp,
        loreElement.creator,
        tokenId
      );
      leftPage.creator = loreElement.creator;
      leftPage.loreIndex = loreElement.index;
    } else {
      // Would end up showing wizard
      leftPage = {
        isEmpty: true,
        bgColor: `#000000`,
        firstImage: null,
      };
    }
    leftPage.pageNumber = leftPageNum;

    if (rightPageNum < lore.length) {
      const loreElement = lore[rightPageNum];
      rightPage = await hydratePageDataFromMetadata(
        loreElement.loreMetadataURI,
        loreElement.createdAtTimestamp,
        loreElement.creator,
        tokenId
      );
      rightPage.creator = loreElement.creator;
      rightPage.loreIndex = loreElement.index;
    } else {
      // Would end showing add lore
      rightPage = {
        isEmpty: true,
        bgColor: "#000000",
        firstImage: null,
      };
    }
    rightPage.pageNumber = rightPageNum;
  }

  //------
  // Figure out previous route
  let previousPageRoute = null;
  if (chapterIndexForToken > 0) {
    if (leftPageNum - 1 >= 0) {
      previousPageRoute = getLoreUrl(
        loreTokenSlug,
        loreInChapterForm[chapterIndexForToken].tokenId,
        leftPageNum - 1
      );
    } else {
      previousPageRoute = getLoreUrl(
        loreTokenSlug,
        loreInChapterForm[chapterIndexForToken - 1].tokenId,
        (loreInChapterForm[chapterIndexForToken - 1]?.lore ?? []).length - 1
      );
    }
  } else {
    // No previous pages implies this is first wizard in the book, so before it comes lore
    // TODO: obvs have to get clever with how to do going back from first soul to last wizard
    previousPageRoute = getLoreUrl("narrative", 0, 0);
  }

  // Figure out next route
  let nextPageRoute = null;
  if (
    rightPageNum <
    (loreInChapterForm[chapterIndexForToken]?.lore ?? []).length - 1
  ) {
    nextPageRoute = getLoreUrl(loreTokenSlug, tokenId, rightPageNum + 2);
  } else {
    if (chapterIndexForToken + 1 < loreInChapterForm.length) {
      nextPageRoute = getLoreUrl(
        loreTokenSlug,
        loreInChapterForm[chapterIndexForToken + 1].tokenId,
        0
      );
    } else if (loreTokenSlug === "wizards") {
      const soulsChapters = await getLoreInChapterForm(
        CHARACTER_CONTRACTS.souls
      );

      if (soulsChapters.length > 0) {
        nextPageRoute = getLoreUrl("souls", soulsChapters[0].tokenId, 0);
      }
    } else if (loreTokenSlug === "souls") {
      const poniesChapters = await getLoreInChapterForm(
        CHARACTER_CONTRACTS.ponies
      );

      if (poniesChapters.length > 0) {
        nextPageRoute = getLoreUrl("ponies", poniesChapters[0].tokenId, 0);
      }
    }
  }

  return [leftPage, rightPage, previousPageRoute, nextPageRoute];
}

export async function getFirstAvailableWizardLoreUrl() {
  // We used to fetch this from subgraph but now we know wizard 0 always has lore so no need :)
  return getLoreUrl("wizards", 0, 0);
}

export async function getWizardsWithLore(): Promise<{
  [key: number]: boolean;
}> {
  const cacheFile = `${WIZARDS_THAT_HAVE_LORE_CACHE}`;

  let results;

  try {
    const cachedData = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    if (
      Math.floor((new Date().getTime() - cachedData.timestamp) / 1000 / 60) <=
      WIZARDS_THAT_HAVE_LORE_CACHE_STALE_AFTER_MINUTES // For x minutes during a deploy we keep using the file cache for lore
    ) {
      results = cachedData.data;
      console.log("Using cached data for 'wizards that have lore' yay!");
    }
  } catch (e) {
    /* not fatal */
    console.warn(
      "'Wizards that have lore' cache file didn't exist or we couldn't open it"
    );
  }

  if (!results) {
    try {
      const { data } = await client.query({
        query: gql`
            query WizardLore {
                loreTokens(first: 999, orderBy: tokenId, orderDirection: asc, where: {tokenContract: "${CHARACTER_CONTRACTS.wizards}"}) {
                    tokenId
                }
            }`,
      });

      results = (data?.loreTokens ?? []).reduce(
        (
          result: {
            [key: number]: boolean;
          },
          token: any
        ) => ((result[token.tokenId] = true), result),
        {}
      );

      await fs.writeFile(
        cacheFile,
        JSON.stringify({ timestamp: new Date().getTime(), data: results }),
        "utf-8"
      );
    } catch (e) {
      console.error(
        "We couldn't get 'wizards that have lore' from subgraph. Continuing anyway as its non-fatal..."
      );
      results = [];
    }
  }

  return results;
}
