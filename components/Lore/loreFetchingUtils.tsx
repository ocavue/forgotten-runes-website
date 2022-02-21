import { client } from "../../lib/graphql";
import { gql } from "@apollo/client";
import { CHARACTER_CONTRACTS } from "../../contracts/ForgottenRunesWizardsCultContract";
import { getLoreUrl } from "./loreUtils";
import path from "path";
import { IndividualLorePageData } from "./types";
import { hydratePageDataFromRawContent } from "./markdownUtils";
import { promises as fs } from "fs";
import * as os from "os";
import { getContractFromTokenSlug } from "../../lib/nftUtilis";

const LORE_CACHE = path.join(os.tmpdir(), ".lore_cache");

const getCacheLocation = (tokenAddress: string) => {
  return `${LORE_CACHE}_${tokenAddress.toLowerCase()}`;
};

const WIZARDS_THAT_HAVE_LORE_CACHE = path.join(
  os.tmpdir(),
  ".wizards_that_have_lore_cache"
);

export async function bustLoreCache() {
  const files = Object.entries(CHARACTER_CONTRACTS).map(([_, tokenAddress]) =>
    getCacheLocation(tokenAddress)
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

export async function getSingleTokenData(
  tokenContract: string,
  tokenId: number
): Promise<TokenData> {
  const result = await client.query({
    query: gql`
       query Query {
        Token(where: {tokenContract: {_eq: "${tokenContract}"}, tokenId: {_eq: ${tokenId}}}) {
          pony {
            image
            name
            backgroundColor
          }
          soul {
            image
            name
            backgroundColor
          }
          wizard {
            image
            name
            backgroundColor
          }
          currentOwner
        }
      }`,
    fetchPolicy: "cache-first",
  });

  const specificToken =
    result.data.Token?.[0]?.wizard ??
    result.data.Token?.[0]?.soul ??
    result.data.Token?.[0]?.pony;
  return {
    name: specificToken.name ?? "Unknown",
    image: specificToken.image ?? "http://unknown",
    bg: specificToken.backgroundColor,
    currentOwner: result.data.Token?.[0]?.currentOwner,
  };
}

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
    const serverGraphPagesToFetch = 1;
    const graphResults = await Promise.all(
      Array.from({ length: serverGraphPagesToFetch }, (_, i) =>
        client.query({
          query: gql`
              query WizardLore {
                Token(offset: ${
                  i * 10000
                }, limit: 10000, order_by: {tokenId: asc}, where: {_and: { tokenContract: {_eq: "${tokenContract}"}, lore: {index: {_is_null: false}}}}) {
                  tokenContract
                  tokenId
                  currentOwner
                  wizard {
                    name
                    image
                    backgroundColor
                  }
                  pony {
                    name
                    image
                    backgroundColor
                  }
                  soul {
                    name
                    image
                    backgroundColor
                  }
                  lore(where: {_and: {index: {_is_null: false}}}, order_by: {index: asc}) {
                    index
                    creator
                    tokenId
                    struck
                    nsfw
                    createdAtBlock
                    rawContent
                  }
                }
              }`,
          fetchPolicy: "no-cache",
        })
      )
    );

    console.log(`Got ${graphResults.length} queries worth of results....`);

    for (let i = 0; i < graphResults.length; i++) {
      const loreTokens = graphResults[i]?.data?.Token ?? [];

      console.log(`Query ${i} had ${loreTokens.length} lore tokens`);

      results.push(
        ...loreTokens.map((loreTokenEntry: any) => {
          const specificToken =
            loreTokenEntry.wizard ?? loreTokenEntry.soul ?? loreTokenEntry.pony;
          return {
            tokenId: parseInt(loreTokenEntry.tokenId),
            tokenData: {
              name: specificToken?.name ?? "Unknown",
              image: specificToken?.image ?? "https://unknown",
              bg: specificToken?.backgroundColor,
              currentOwner: loreTokenEntry.currentOwner,
            },
            lore: loreTokenEntry.lore.map((loreEntry: any) => ({
              rawContent: loreEntry.rawContent,
              createdAtBlock: loreEntry.createdAtBlock,
              creator: loreEntry.creator,
              currentOwner: loreTokenEntry.currentOwner,
              index: loreEntry.index,
              nsfw: loreEntry.nsfw,
              struck: loreEntry.struck,
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

export function getLoreAsEvenPage(pageNum: number) {
  // Often used as we key nextjs pages by right page since we show two at a time
  // i.e. /wizards/123/1 redirects to /wizards/123/2
  return pageNum % 2 === 0 ? pageNum : pageNum + 1;
}

const PAGINATED_LORE_FIELDS = `
          slug
          tokenId
          page
          globalpage
          rawContent
          creator
          createdAtBlock
          nsfw
          struck
          index
          token {
            tokenContract
            tokenId
            currentOwner
            wizard {
              name
              image
              backgroundColor
            }
            pony {
              name
              image
              backgroundColor
            }
            soul {
              name
              image
              backgroundColor
            }
          }
`;

export async function getPreviousAndNextPageRoutes(
  globalPageForPrevious: number,
  globalPageForNext: number,
  loreTokenSlug: string
) {
  let previousPageRoute;
  let nextPageRoute;

  const { data } = await client.query({
    query: gql`
        query Query {
            previousPage: PaginatedLore(where: { globalpage: { _eq: ${
              globalPageForPrevious - 1
            } } }) {
                page
                globalpage
                slug
                tokenId
            }
            nextPage: PaginatedLore(where: { globalpage: { _eq: ${
              globalPageForNext + 1
            } } }) {
                page
                globalpage
                slug
                tokenId
            }
        }
    `,
  });

  const previousPageData = data.previousPage?.[0];
  const nextPageData = data.nextPage?.[0];

  if (previousPageData) {
    previousPageRoute = getLoreUrl(
      previousPageData.slug,
      previousPageData.tokenId,
      getLoreAsEvenPage(previousPageData.page - 1)
    );
  } else {
    // TODO: obvs have to get clever with how to do going back from first soul to last wizard
    previousPageRoute = getLoreUrl("narrative", 0, 0);
  }

  if (nextPageData) {
    nextPageRoute = getLoreUrl(
      nextPageData.slug,
      nextPageData.tokenId,
      getLoreAsEvenPage(nextPageData.page - 1)
    );
  } else {
    if (loreTokenSlug === "wizards") {
      const { data } = await client.query({
        query: gql`
          query Query {
            souls: PaginatedLore(
              limit: 1
              order_by: { globalpage: asc }
              where: { slug: { _eq: "souls" } }
            ) {
              tokenId
              page
              globalpage
            }
          }
        `,
        fetchPolicy: "no-cache",
      });

      if (data.souls.length > 0) {
        nextPageRoute = getLoreUrl("souls", data.souls?.[0].tokenId, 0);
      }
    } else if (loreTokenSlug === "souls") {
      const { data } = await client.query({
        query: gql`
          query Query {
            ponies: PaginatedLore(
              limit: 1
              order_by: { globalpage: asc }
              where: { slug: { _eq: "ponies" } }
            ) {
              tokenId
              page
              globalpage
            }
          }
        `,
        fetchPolicy: "no-cache",
      });

      if (data.ponies.length > 0) {
        nextPageRoute = getLoreUrl("ponies", data.ponies?.[0].tokenId, 0);
      }
    }
  }
  return { previousPageRoute, nextPageRoute };
}

export async function getLeftRightPagesV2(
  loreTokenSlug: string,
  tokenId: number,
  leftPageNum: number,
  rightPageNum: number
) {
  const { data } = await client.query({
    query: gql`
      query Query {
        leftPage: PaginatedLore(
          order_by: { globalpage: asc }
          where: { slug: {_eq: ${loreTokenSlug}}, tokenId: { _eq: ${tokenId} }, page: { _eq: ${
      leftPageNum + 1
    } } }
        ) {
            ${PAGINATED_LORE_FIELDS}
        }
        rightPage: PaginatedLore(
          order_by: { globalpage: asc }
          where: { slug: {_eq: ${loreTokenSlug}}, tokenId: { _eq: ${tokenId} }, page: { _eq: ${
      rightPageNum + 1
    } } }
        ) {
            ${PAGINATED_LORE_FIELDS}
        }
      }
    `,
  });

  const leftPageData = data.leftPage?.[0];
  const rightPageData = data.rightPage?.[0];

  const tokenContract = getContractFromTokenSlug(loreTokenSlug);

  const tokenData = await extractTokenData(
    leftPageData,
    rightPageData,
    tokenContract,
    tokenId
  );

  let leftPage: IndividualLorePageData;
  let rightPage: IndividualLorePageData;

  if (leftPageData) {
    leftPage = await hydratePageDataFromRawContent(
      leftPageData.rawContent,
      leftPageData.createdAtBlock,
      leftPageData.creator,
      tokenId
    );
    leftPage.creator = leftPageData.creator;
    leftPage.loreIndex = leftPageData.index;
    leftPage.nsfw = leftPageData.nsfw;
    leftPage.struck = leftPageData.struck;
  } else {
    leftPage = {
      isEmpty: true,
      bgColor: `#000000`,
      firstImage: null,
      pageNumber: leftPageNum,
      nsfw: false,
      struck: false,
    };
  }

  if (rightPageData) {
    rightPage = await hydratePageDataFromRawContent(
      rightPageData.rawContent,
      rightPageData.createdAtBlock,
      rightPageData.creator,
      tokenId
    );
    rightPage.creator = rightPageData.creator;
    rightPage.loreIndex = rightPageData.index;
    rightPage.nsfw = rightPageData.nsfw;
    rightPage.struck = rightPageData.struck;
  } else {
    rightPage = {
      isEmpty: true,
      bgColor: "#000000",
      firstImage: null,
      pageNumber: rightPageNum,
      nsfw: false,
      struck: false,
    };
  }

  leftPage.pageNumber = leftPageNum;
  rightPage.pageNumber = rightPageNum;

  //------
  // Figure out previous route
  let previousPageRoute = null;
  let nextPageRoute = null;
  if (leftPageData ?? rightPageData) {
    // use leftmost page for previous
    const globalPageForPrevious =
      leftPageData?.globalpage ?? rightPageData?.globalpage;

    // use rightmost page for next
    const globalPageForNext =
      rightPageData?.globalpage ?? leftPageData?.globalpage;
    const result = await getPreviousAndNextPageRoutes(
      globalPageForPrevious,
      globalPageForNext,
      loreTokenSlug
    );

    previousPageRoute = result.previousPageRoute;
    nextPageRoute = result.nextPageRoute;
  }

  return [
    tokenData.name,
    tokenData.image,
    tokenData.bg,
    tokenData.currentOwner,
    leftPage,
    rightPage,
    previousPageRoute,
    nextPageRoute,
  ];
}

type TokenData = {
  name: string;
  image: string;
  bg?: string;
  currentOwner?: string;
};

async function extractTokenData(
  leftPageData: any,
  rightPageData: any,
  tokenContract: string,
  tokenId: number
): Promise<TokenData> {
  if (leftPageData || rightPageData) {
    const pageData = leftPageData ?? rightPageData;
    const specificToken =
      pageData.token.wizard ?? pageData.token.soul ?? pageData.token.pony;
    return {
      name: specificToken?.name ?? "Unknown",
      image: specificToken?.image ?? "https://unknown",
      bg: specificToken?.backgroundColor,
      currentOwner: pageData.currentOwner,
    };
  } else {
    return getSingleTokenData(tokenContract, tokenId);
  }
}

// export async function getLeftRightPages(
//   loreTokenSlug: string,
//   tokenId: number,
//   leftPageNum: number,
//   rightPageNum: number
// ) {
//   const tokenContract = getContractFromTokenSlug(loreTokenSlug);
//   const loreInChapterForm = await getLoreInChapterForm(tokenContract);
//
//   const chapterIndexForToken = await getIndexForToken(
//     tokenId,
//     loreInChapterForm
//   );
//
//   let leftPage: IndividualLorePageData;
//   let rightPage: IndividualLorePageData;
//
//   let tokenData: {
//     name: string;
//     image: string;
//     bg?: string;
//     currentOwner?: string;
//   };
//
//   if (chapterIndexForToken === -1) {
//     tokenData = await getSingleTokenData(tokenContract, tokenId);
//     leftPage = {
//       isEmpty: true,
//       bgColor: `#000000`,
//       firstImage: null,
//       pageNumber: leftPageNum,
//       nsfw: false,
//       struck: false,
//     };
//
//     rightPage = {
//       isEmpty: true,
//       bgColor: "#000000",
//       firstImage: null,
//       pageNumber: rightPageNum,
//       nsfw: false,
//       struck: false,
//     };
//   } else {
//     const lore = loreInChapterForm[chapterIndexForToken].lore ?? [];
//     tokenData = loreInChapterForm[chapterIndexForToken].tokenData;
//
//     if (leftPageNum >= 0 && leftPageNum < lore.length) {
//       const loreElement = lore[leftPageNum];
//       leftPage = await hydratePageDataFromRawContent(
//         loreElement.rawContent,
//         loreElement.createdAtBlock,
//         loreElement.creator,
//         tokenId
//       );
//       leftPage.creator = loreElement.creator;
//       leftPage.loreIndex = loreElement.index;
//       leftPage.nsfw = loreElement.nsfw;
//       leftPage.struck = loreElement.struck;
//     } else {
//       // Would end up showing wizard
//       leftPage = {
//         isEmpty: true,
//         bgColor: `#000000`,
//         firstImage: null,
//         nsfw: false,
//         struck: false,
//       };
//     }
//     leftPage.pageNumber = leftPageNum;
//
//     if (rightPageNum < lore.length) {
//       const loreElement = lore[rightPageNum];
//       rightPage = await hydratePageDataFromRawContent(
//         loreElement.rawContent,
//         loreElement.createdAtBlock,
//         loreElement.creator,
//         tokenId
//       );
//       rightPage.creator = loreElement.creator;
//       rightPage.loreIndex = loreElement.index;
//       rightPage.nsfw = loreElement.nsfw;
//       rightPage.struck = loreElement.struck;
//     } else {
//       // Would end showing add lore
//       rightPage = {
//         isEmpty: true,
//         bgColor: "#000000",
//         firstImage: null,
//         nsfw: false,
//         struck: false,
//       };
//     }
//     rightPage.pageNumber = rightPageNum;
//   }
//
//   //------
//   // Figure out previous route
//   let previousPageRoute;
//   if (chapterIndexForToken > 0) {
//     if (leftPageNum - 1 >= 0) {
//       previousPageRoute = getLoreUrl(
//         loreTokenSlug,
//         loreInChapterForm[chapterIndexForToken].tokenId,
//         leftPageNum - 1
//       );
//     } else {
//       previousPageRoute = getLoreUrl(
//         loreTokenSlug,
//         loreInChapterForm[chapterIndexForToken - 1].tokenId,
//         (loreInChapterForm[chapterIndexForToken - 1]?.lore ?? []).length - 1
//       );
//     }
//   } else {
//     // No previous pages implies this is first wizard in the book, so before it comes lore
//     // TODO: obvs have to get clever with how to do going back from first soul to last wizard
//     previousPageRoute = getLoreUrl("narrative", 0, 0);
//   }
//
//   // Figure out next route
//   let nextPageRoute = null;
//   if (
//     rightPageNum <
//     (loreInChapterForm[chapterIndexForToken]?.lore ?? []).length - 1
//   ) {
//     nextPageRoute = getLoreUrl(loreTokenSlug, tokenId, rightPageNum + 2);
//   } else {
//     if (chapterIndexForToken + 1 < loreInChapterForm.length) {
//       nextPageRoute = getLoreUrl(
//         loreTokenSlug,
//         loreInChapterForm[chapterIndexForToken + 1].tokenId,
//         0
//       );
//     } else if (loreTokenSlug === "wizards") {
//       const soulsChapters = await getLoreInChapterForm(
//         CHARACTER_CONTRACTS.souls
//       );
//
//       if (soulsChapters.length > 0) {
//         nextPageRoute = getLoreUrl("souls", soulsChapters[0].tokenId, 0);
//       }
//     } else if (loreTokenSlug === "souls") {
//       const poniesChapters = await getLoreInChapterForm(
//         CHARACTER_CONTRACTS.ponies
//       );
//
//       if (poniesChapters.length > 0) {
//         nextPageRoute = getLoreUrl("ponies", poniesChapters[0].tokenId, 0);
//       }
//     }
//   }
//
//   return [
//     tokenData.name,
//     tokenData.image,
//     tokenData.bg,
//     tokenData.currentOwner,
//     leftPage,
//     rightPage,
//     previousPageRoute,
//     nextPageRoute,
//   ];
// }

export async function getFirstAvailableWizardLoreUrl() {
  // We used to fetch this from subgraph but now we know wizard 0 always has lore so no need :)
  return getLoreUrl("wizards", 0, 0);
}

export async function fetchWizardsWithLore(): Promise<number[]> {
  const { data } = await client.query({
    query: gql`
        query WizardLore {
          Token(where: {_and: {tokenContract: {_eq: "${CHARACTER_CONTRACTS.wizards}"}, lore: {index: {_is_null: false}}}}, order_by: {tokenId: asc}) {
              tokenId
          }
        }`,
  });

  const results = (data?.Token ?? []).reduce(
    (
      result: {
        [key: number]: boolean;
      },
      token: any
    ) => ((result[token.tokenId] = true), result),
    {}
  );

  return results;
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
      results = await fetchWizardsWithLore();

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
