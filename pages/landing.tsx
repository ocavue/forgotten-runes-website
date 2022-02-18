import { GetStaticProps } from "next";
import InfoPageLayout from "../components/InfoPageLayout";
import { createClient, Entry } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { Flex } from "rebass";

export default function WtfPage({ entry }: { entry: Entry<any> }) {
  return (
    <InfoPageLayout>
      <Flex flexDirection={"column"} p={2}>
        {documentToReactComponents(entry.fields.mainContent, {
          renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: (node) => (
              <img
                src={node.data?.target?.fields?.file?.url}
                alt={node.data?.target?.fields?.title}
                style={{ objectFit: "cover" }}
              />
            ),
          },
        })}
      </Flex>
    </InfoPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE as string,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
  });

  const entry = await client.getEntry("6N3xs2AZQ1llxbyf5BFJz6"); // TODO: maybe some json config for specific static pages
  // console.log(entry);

  return {
    props: {
      entry: entry,
    },
  };
};
