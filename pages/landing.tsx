import { GetStaticProps } from "next";
import InfoPageLayout from "../components/InfoPageLayout";
import { createClient, Entry } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

export default function WtfPage({ entry }: { entry: Entry<any> }) {
  return (
    <InfoPageLayout>
      {/*{documentToReactComponents(entry.fields.mainContent)}*/}
    </InfoPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  return {
    props: {
      entry: {},
    },
  };
};
