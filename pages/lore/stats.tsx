import { css, Global } from "@emotion/react";
import dynamic from "next/dynamic";
import React from "react";
import Layout from "../../components/Layout";
import OgImage from "../../components/OgImage";
import { GetStaticPropsContext } from "next";
import LoreSharedLayout from "../../components/Lore/LoreSharedLayout";
import Spacer from "../../components/Spacer";
import { gql } from "@apollo/client";
import { client } from "../../lib/graphql";
import { BOOK_OF_LORE_ADDRESS } from "../../contracts/ForgottenRunesWizardsCultContract";

const CharacterMapLorePage = ({ loreCount }: { loreCount: number }) => {
  return (
    <Layout title={`The Forgotten Runes Book of Lore`}>
      <OgImage
        title={`The Book of Lore Stats`}
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
        <h2>Stats</h2>
        <Spacer pt={4} />
        <h3>Total lore entries: {loreCount}</h3>
      </LoreSharedLayout>
    </Layout>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      loreCount: (
        await client.query({
          query: gql`
            query WizardLore {
              countData: Lore_aggregate(
                where: {
                  creator: {
                    _neq: "${
                      BOOK_OF_LORE_ADDRESS[
                        parseInt(
                          process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID as string
                        )
                      ]
                    }"
                  }
                }
              ) {
                aggregate {
                  count
                }
              }
            }
          `,
        })
      ).data.countData.aggregate.count,
    },
    revalidate: 5 * 60,
  };
}

export default CharacterMapLorePage;
