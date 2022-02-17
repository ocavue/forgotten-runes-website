import { css, Global } from "@emotion/react";
import React from "react";
import Layout from "../../components/Layout";
import LoreSharedLayout from "../../components/Lore/LoreSharedLayout";
import OgImage from "../../components/OgImage";
import { GetStaticPropsContext } from "next";
import { client } from "../../lib/graphql";
import { gql } from "@apollo/client";
import RecentLoreEntry, {
  RecentLoreEntryType,
} from "../../components/Lore/RecentLoreEntry";
import { getLoreUrl } from "../../components/Lore/loreUtils";
import markdownToTxt from "markdown-to-txt";
import { BlogPostGrid } from "../../components/Blog/BlogPostGrid";
import { Flex } from "rebass";
import { getProvider } from "../../hooks/useProvider";
import { getOrdinal } from "english-ordinals";

const RecentLorePage = ({
  recentLore,
}: {
  recentLore: RecentLoreEntryType[];
}) => {
  return (
    <Layout title={`Recent Forgotten Runes Lore`}>
      <OgImage
        title={`Recent Lore`}
        images={
          "https://www.forgottenrunes.com/static/lore/book/closed_whole.png"
        }
      />

      <Global
        styles={css`
          html,
          body {
            /* background: radial-gradient(#3c324c, #0a080c); */
          }
        `}
      />
      <LoreSharedLayout>
        <Flex p={4}>
          <BlogPostGrid>
            {recentLore.map((entry, index) => (
              <RecentLoreEntry
                key={`${index}-${entry.createdAtTimestamp}`}
                entry={entry}
              />
            ))}
          </BlogPostGrid>
        </Flex>
      </LoreSharedLayout>
    </Layout>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  const provider = await getProvider(true);

  const recentLoreData = await client.query({
    query: gql`
      query Query {
        PaginatedLore(
          limit: 20
          order_by: { createdAtBlock: desc }
          where: { _and: { nsfw: { _eq: false }, struck: { _eq: false } } }
        ) {
          createdAtBlock
          token {
            wizard {
              image
              name
              backgroundColor
            }
            soul {
              image
              name
              backgroundColor
            }
            pony {
              image
              name
              backgroundColor
            }
            tokenId
          }
          markdownText
          page
          firstImage
          slug
          creator
          backgroundColor
        }
      }
    `,
    fetchPolicy: "no-cache",
  });

  const recentLore = await Promise.all(
    (recentLoreData.data?.PaginatedLore ?? []).map(async (entry: any) => {
      const token =
        entry.token?.wizard ?? entry.token?.soul ?? entry.token?.pony;
      const name = token?.name ?? "Unknown";
      const characterImage = token?.image;

      const result: RecentLoreEntryType = {
        createdAtTimestamp: (await provider.getBlock(entry.createdAtBlock))
          .timestamp,
        title: `${getOrdinal(entry.page)} entry for ${name}`,
        image: entry?.firstImage ?? characterImage,
        pixelateImage: !entry?.firstImage,
        coverImageFit: !!entry?.firstImage,
        backgroundColor: token?.backgroundColor
          ? `#${token?.backgroundColor}`
          : "black",
        story: `${markdownToTxt(entry?.markdownText ?? "Image only lore")
          .padEnd(256)
          .substring(0, 256)
          .trim()}...`,
        url: getLoreUrl(entry.slug, entry.token.tokenId, entry.page - 1),
      };

      return result;
    })
  );

  return {
    props: { recentLore: recentLore },
    revalidate: 5 * 60,
  };
}

export default RecentLorePage;
