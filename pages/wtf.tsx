import { GetStaticProps } from "next";
import InfoPageLayout from "../components/InfoPageLayout";
import { createClient, Entry } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { Box, Flex } from "rebass";

import { MediaContextProvider, Media } from "../lib/media";
import React from "react";
import Spacer from "../components/Spacer";

export default function FaqPage({ entry }: { entry: Entry<any> }) {
  return (
    <InfoPageLayout size={"wide"}>
      <Flex flexDirection={"column"} width={"100%"} alignItems={"center"}>
        {entry.fields.topBanner && (
          <img
            src={entry.fields.topBanner.fields.file.url}
            alt={entry.fields.topBanner.fields.title}
            style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
          />
        )}
        <Flex flexDirection={"column"} px={[1, 2]} maxWidth={"860px"}>
          {entry.fields.faqEntries.map((faqEntry: any) => {
            const columnImage = faqEntry.fields.inlineImage ? (
              <img
                style={{
                  objectFit: "contain",
                  maxWidth: "100%",
                  height: "auto",
                }}
                src={faqEntry.fields.inlineImage.fields.file.url}
                alt={faqEntry.fields.inlineImage.fields.title}
              />
            ) : null;

            const columnImageWidthPercent =
              faqEntry.fields.inlineImageWidth ?? 25;

            const isColumnImageLeftAligned =
              !faqEntry.fields.inlineImageAlignment ||
              faqEntry.fields.inlineImageAlignment === "left";

            const columns = columnImage
              ? isColumnImageLeftAligned
                ? `${columnImageWidthPercent}% ${
                    100 - columnImageWidthPercent
                  }%`
                : `${
                    100 - columnImageWidthPercent
                  }% ${columnImageWidthPercent}%`
              : "1fr";

            const mainContentBody = (
              <Flex flexDirection={"column"}>
                <h2 style={{ margin: 0 }}>{faqEntry.fields.title}</h2>
                {documentToReactComponents(faqEntry.fields.body, {
                  renderText: (text: string) => {
                    return text
                      .split("\n")
                      .reduce(
                        (
                          children: any[],
                          textSegment: string,
                          index: number
                        ) => {
                          return [
                            ...children,
                            index > 0 && <br key={index} />,
                            textSegment,
                          ];
                        },
                        []
                      );
                  },
                  renderNode: {
                    [BLOCKS.EMBEDDED_ASSET]: (node) => (
                      <img
                        src={node.data?.target?.fields?.file?.url}
                        alt={node.data?.target?.fields?.title}
                        style={{
                          objectFit: "cover",
                          alignSelf: "center",
                          maxWidth: "100%",
                        }}
                      />
                    ),
                  },
                })}
              </Flex>
            );

            return (
              <Box pt={4} key={faqEntry.sys.id}>
                <MediaContextProvider>
                  <Media at={"xs"}>
                    <Flex flexDirection={"column"} alignItems={"center"}>
                      {mainContentBody}
                      {columnImage && (
                        <>
                          <Spacer pt={2} />
                          {columnImage}
                        </>
                      )}
                    </Flex>
                  </Media>
                  <Media greaterThanOrEqual={"sm"}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: columns,
                      }}
                    >
                      {columnImage && isColumnImageLeftAligned ? (
                        <Box pr={3}>{columnImage}</Box>
                      ) : null}
                      {mainContentBody}
                      {columnImage && !isColumnImageLeftAligned ? (
                        <Box pl={3}>{columnImage}</Box>
                      ) : null}
                    </div>
                  </Media>
                </MediaContextProvider>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </InfoPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE as string,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
  });

  const entry = await client.getEntry("6yF1z7Y7tv3vOChPST5Jxj"); // TODO: maybe some json config for specific static pages
  // console.log(entry);

  return {
    props: {
      entry: entry,
    },
  };
};
