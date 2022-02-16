import { css, Global } from "@emotion/react";
import React from "react";
import Layout from "../../components/Layout";
import LoreSharedLayout from "../../components/Lore/LoreSharedLayout";
import OgImage from "../../components/OgImage";
import { GetStaticPropsContext } from "next";
import { client } from "../../lib/graphql";
import { gql } from "@apollo/client";
import { Box } from "rebass";
import flatMap from "lodash/flatMap";
import { getCloudfrontedImageSrc } from "../../components/Lore/LoreMarkdownRenderer";

const LoreImagesPage = ({ loreImages }: { loreImages: any[] }) => {
  return (
    <Layout title={`Forgotten Runes Lore Images`}>
      <OgImage
        title={`Lore Images`}
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
        <h2>Images from lore entries</h2>
        <Box px={5} py={4}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "5px",
              gridAutoFlow: "dense",
            }}
          >
            {loreImages.map((imgData: any, index) => (
              <a
                key={`${index}-${imgData.src}`}
                href={`/lore/${imgData.slug}/${imgData.tokenId}/${
                  imgData.page - 1
                }`}
              >
                <img
                  style={{ width: "100%", height: "auto" }}
                  src={imgData.src}
                />
              </a>
            ))}
          </div>
        </Box>
      </LoreSharedLayout>
    </Layout>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  const loreImageData = await client.query({
    query: gql`
      query Query {
        loreWithImages: PaginatedLore(
          where: {
            images: { href: { _is_null: false } }
            nsfw: { _eq: false }
            struck: { _eq: false }
            markdownText: { _nilike: "%Delete below%" }
          }
          order_by: { createdAtBlock: desc }
        ) {
          images {
            href
          }
          slug
          tokenId
          page
        }
      }
    `,
    fetchPolicy: "cache-first",
  });

  const loreImages = flatMap(loreImageData.data.loreWithImages, (entry: any) =>
    entry.images.map((imageData: any) => {
      const { newSrc, fallbackSrc } = getCloudfrontedImageSrc(imageData.href);
      return {
        src: newSrc,
        slug: entry.slug,
        tokenId: entry.tokenId,
        page: entry.page,
      };
    })
  );

  return {
    props: { loreImages },
    revalidate: 20 * 60,
  };
}

export default LoreImagesPage;
