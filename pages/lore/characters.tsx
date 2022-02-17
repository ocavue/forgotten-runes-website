import { css, Global } from "@emotion/react";
import dynamic from "next/dynamic";
import React from "react";
import Layout from "../../components/Layout";
import OgImage from "../../components/OgImage";
import { GetStaticPropsContext } from "next";
import { getWizardsWithLore } from "../../components/Lore/loreFetchingUtils";
import LoreSharedLayout from "../../components/Lore/LoreSharedLayout";

const WizardMapLeaflet = dynamic(
  () => import("../../components/Lore/WizardMapLeaflet"),
  { ssr: false }
);

const CharacterMapLorePage = ({
  wizardsWithLore,
}: {
  wizardsWithLore: any;
}) => {
  return (
    <Layout title={`The Forgotten Runes Book of Lore`}>
      <OgImage
        title={`The Book of Lore`}
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
        <h2>Characters with Lore</h2>
      </LoreSharedLayout>
      <WizardMapLeaflet wizardsWithLore={wizardsWithLore} bookOfLore={true} />
    </Layout>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      wizardsWithLore: await getWizardsWithLore(),
    },
    revalidate: 5 * 60,
  };
}

export default CharacterMapLorePage;
