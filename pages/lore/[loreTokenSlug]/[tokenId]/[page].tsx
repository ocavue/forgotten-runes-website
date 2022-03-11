import Layout from "../../../../components/Layout";
import { GetStaticPropsContext } from "next";
import Book from "../../../../components/Lore/Book";
import { LorePageData } from "../../../../components/Lore/types";
import OgImage from "../../../../components/OgImage";

import {
  getFirstAvailableWizardLoreUrl,
  getLeftRightPagesV2,
} from "../../../../components/Lore/loreFetchingUtils";
import { getLoreUrl } from "../../../../components/Lore/loreUtils";
import { promises as fs } from "fs";
import path from "path";
import LoreSharedLayout from "../../../../components/Lore/LoreSharedLayout";
import Spacer from "../../../../components/Spacer";
import { getCloudinaryFrontedImageSrc } from "../../../../components/Lore/LoreMarkdownRenderer";

const LorePage = ({
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
}) => {
  const title = `The Lore of ${tokenName}`;

  let ogImage =
    lorePageData.leftPage?.firstImage ?? lorePageData.rightPage?.firstImage;

  if (!ogImage) {
    ogImage = tokenImage;
  }

  const { newSrc: cloudFrontedOgImage } = getCloudinaryFrontedImageSrc(ogImage);

  const og = (
    <OgImage
      title={title}
      wizard={tokenId}
      images={cloudFrontedOgImage}
      bgColor={
        lorePageData.leftPage?.firstImage
          ? lorePageData.leftPage?.bgColor
          : lorePageData.rightPage?.firstImage
          ? lorePageData.rightPage?.bgColor
          : undefined
      }
    />
  );

  return (
    <Layout title={title}>
      {og}
      <LoreSharedLayout>
        <Spacer pt={3} />
        <Book
          loreTokenSlug={loreTokenSlug}
          tokenId={tokenId}
          tokenName={tokenName}
          tokenImage={tokenImage}
          tokenBg={tokenBg}
          currentOwner={currentOwner}
          lorePageData={lorePageData}
        />
      </LoreSharedLayout>
    </Layout>
  );
};

const NARRATIVE_DIR = path.join(process.cwd(), "posts", "narrative");

async function getNarrativePageData(pageNum: number, loreTokenSlug: string) {
  const leftPageNum = pageNum;
  const rightPageNum = pageNum + 1; // with lore e.g. 0 will be on the left unlike with wizards etc
  const fileExists = async (path: string) => {
    return !!(await fs.stat(path).catch((e: any) => false));
  };

  const leftNarrativeFileName = path.join(
    NARRATIVE_DIR,
    leftPageNum.toString() + ".md"
  );

  if (!(await fileExists(leftNarrativeFileName))) {
    console.log("no exist: " + leftNarrativeFileName);
    return {
      redirect: {
        destination: getLoreUrl("narrative", 0, 0),
      },
    };
  }

  const rightNarrativeFileName = path.join(
    NARRATIVE_DIR,
    rightPageNum.toString() + ".md"
  );
  const rightNarrativeExists = await fileExists(rightNarrativeFileName);

  const nextNarrativeFileName = path.join(
    NARRATIVE_DIR,
    (rightPageNum + 1).toString() + ".md"
  );
  const nextNarrativeExists = await fileExists(nextNarrativeFileName);

  return {
    props: {
      tokenId: null,
      loreTokenSlug,
      lorePageData: {
        leftPage: {
          bgColor: "#000000",
          isEmpty: false,
          title: "The Book of Lore", //TODO
          story: await fs.readFile(leftNarrativeFileName, "utf8"),
          pageNum: leftPageNum,
        },
        rightPage: {
          bgColor: "#000000",
          isEmpty: false, //TODO: even if empty we set false as we pass empty story (to prevent add lore button) #hack
          title: "", //TODO
          story: rightNarrativeExists
            ? await fs.readFile(rightNarrativeFileName, "utf8")
            : "",
          pageNum: rightPageNum,
        },
        previousPageRoute: leftPageNum >= 1 ? leftPageNum - 1 : null,
        nextPageRoute: nextNarrativeExists
          ? rightPageNum + 1
          : await getFirstAvailableWizardLoreUrl(),
      },
    },
  };
}

async function getNarrativePaths() {
  const postsDirectory = path.join(process.cwd(), "posts", "narrative");
  const filenames = await fs.readdir(postsDirectory);
  const posts = [];
  for (let i = 0; i < filenames.length; i++) {
    if (i % 2 !== 0) {
      //ignore odd pages as the previous "even" page would render it in the same "web" page
      continue;
    }

    const filePath = path.join(postsDirectory, filenames[i]);
    posts.push({
      params: {
        loreTokenSlug: "narrative",
        tokenId: "0",
        page: filePath.match(/^.*(\d)\.md$/)?.[1] ?? "0",
      },
    });
  }

  return posts;
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const loreTokenSlug: string = context.params?.loreTokenSlug as string;
  const tokenId: number = parseInt((context.params?.tokenId as string) ?? "0");
  const pageNum: number = parseInt((context.params?.page as string) ?? "0");

  console.log(
    `In static props for ${loreTokenSlug}, ${tokenId} page ${pageNum}`
  );

  if (pageNum % 2 !== 0) {
    // We always key from right page, so redirect...
    return {
      redirect: {
        destination: getLoreUrl(loreTokenSlug, tokenId, pageNum + 1),
      },
    };
  }

  // Shortcut for narrative
  if (loreTokenSlug.toLowerCase() === "narrative") {
    return await getNarrativePageData(pageNum, loreTokenSlug);
  }

  const leftPageNum = pageNum - 1;
  const rightPageNum = pageNum;

  const [
    tokenName,
    tokenImage,
    tokenBg,
    currentOwner,
    leftPage,
    rightPage,
    previousPageRoute,
    nextPageRoute,
  ] = await getLeftRightPagesV2(
    loreTokenSlug,
    tokenId,
    leftPageNum,
    rightPageNum
  );

  console.log(
    `Regenerated ${loreTokenSlug} - ${tokenId} pages ${leftPageNum} and ${rightPageNum}`
  );

  return {
    props: {
      loreTokenSlug,
      tokenId,
      tokenName,
      tokenImage,
      tokenBg: tokenBg ?? null,
      currentOwner: currentOwner ?? null,
      lorePageData: {
        leftPage,
        rightPage,
        previousPageRoute: previousPageRoute ?? null,
        nextPageRoute: nextPageRoute ?? null,
      },
    },
  };
}

export async function getStaticPaths() {
  const paths = [];

  // const { data } = await client.query({
  //   query: gql`
  //     query WizardLore {
  //       PaginatedLore(order_by: { globalpage: asc }) {
  //         slug
  //         tokenId
  //         page
  //         globalpage
  //       }
  //     }
  //   `,
  //   fetchPolicy: "no-cache",
  // });
  // paths.push(
  //   ...map(data.PaginatedLore, (loreData: any) => {
  //     const page = loreData.page - 1;
  //     return {
  //       params: {
  //         loreTokenSlug: loreData.slug,
  //         tokenId: loreData.tokenId.toString(),
  //         page: getLoreAsEvenPage(page).toString(),
  //       },
  //     };
  //   })
  // );

  paths.push(...(await getNarrativePaths()));

  return {
    paths: paths,
    fallback: "blocking",
  };
}

export default LorePage;
