import { GetStaticProps } from "next";
import InfoPageLayout from "../components/InfoPageLayout";
import { createClient, Entry } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { Box, Flex } from "rebass";

export default function FaqPage({ entry }: { entry: Entry<any> }) {
  return (
    <InfoPageLayout size={"wide"}>
      <Flex flexDirection={"column"} width={"100%"} alignItems={"center"}>
        {entry.fields.topBanner && (
          <img
            src={entry.fields.topBanner.fields.file.url}
            alt={entry.fields.topBanner.fields.title}
          />
        )}
        <Flex flexDirection={"column"} px={[1, 2]} maxWidth={"860px"}>
          {entry.fields.faqEntries.map((faqEntry: any) => {
            const columnImage = faqEntry.fields.inlineImage ? (
              <img
                style={{
                  objectFit: "contain",
                  flex: "0 0 25%",
                  width: "100%",
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

            return (
              <Box pt={4} key={faqEntry.sys.id}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: columns,
                  }}
                >
                  {columnImage && isColumnImageLeftAligned ? (
                    <Box pr={3}>{columnImage}</Box>
                  ) : null}
                  <Flex flexDirection={"column"} flex={"1 0 75%"}>
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
                  {columnImage && !isColumnImageLeftAligned ? (
                    <Box pl={3}>{columnImage}</Box>
                  ) : null}
                </div>
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
