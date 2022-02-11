import Layout from "../../../../components/Layout";
import { GetStaticPropsContext } from "next";
import Book from "../../../../components/Lore/Book";
import { LorePageData } from "../../../../components/Lore/types";
import OgImage from "../../../../components/OgImage";

import {
  bustLoreCache,
  getFirstAvailableWizardLoreUrl,
  getLeftRightPages,
  getLoreInChapterForm,
} from "../../../../components/Lore/loreFetchingUtils";
import { CHARACTER_CONTRACTS } from "../../../../contracts/ForgottenRunesWizardsCultContract";
import { getLoreUrl } from "../../../../components/Lore/loreUtils";
import { promises as fs } from "fs";
import path from "path";
import flatMap from "lodash/flatMap";
import LoreSharedLayout from "../../../../components/Lore/LoreSharedLayout";
import Spacer from "../../../../components/Spacer";

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
  const og = (
    <OgImage
      title={title}
      wizard={tokenId}
      images={ogImage}
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
        revalidate: 2,
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
    revalidate: 2,
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
        revalidate: 2,
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
  ] = await getLeftRightPages(
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
        previousPageRoute,
        nextPageRoute,
      },
    },
    revalidate: 2,
  };
}

export async function getStaticPaths() {
  const paths = [];

  await bustLoreCache();

  for (const [loreTokenSlug, loreTokenContract] of Object.entries(
    CHARACTER_CONTRACTS
  )) {
    console.log(`Generating paths for ${loreTokenSlug} ${loreTokenContract}`);

    const loreInChapterForm = await getLoreInChapterForm(
      loreTokenContract,
      true
    );

    // console.log(data);
    //Note: its so annoying NextJs doesn't let you pass extra data to getStaticProps so now we fetch inside there too sigh... https://github.com/vercel/next.js/discussions/11272
    paths.push(
      ...flatMap(loreInChapterForm, (tokenLoreData: any) => {
        return (tokenLoreData?.lore ?? []).map(
          (loreData: any, index: number) => {
            return {
              params: {
                loreTokenSlug,
                tokenId: tokenLoreData.tokenId.toString(),
                page: (index % 2 === 0 ? index : index + 1).toString(),
              },
            };
          }
        );
      })
    );
  }

  paths.push(...(await getNarrativePaths()));

  return {
    paths: paths,
    fallback: "blocking",
  };
}

export default LorePage;
