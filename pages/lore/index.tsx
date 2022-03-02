import { css, Global } from "@emotion/react";
import React from "react";
import Layout from "../../components/Layout";
import BookCover from "../../components/Lore/BookCover";
import LoreSharedLayout from "../../components/Lore/LoreSharedLayout";
import OgImage from "../../components/OgImage";
import { GetStaticPropsContext } from "next";
import styled from "@emotion/styled";
import { FONTS } from "../../styles/styleguide";
import { LorePageDescription } from "../../components/Lore/loreStyles";

const BookOfLoreIndexPage = () => {
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
        {/* <LoreHeader>
          <h2>The Forgotten Runes Book of Lore</h2>
        </LoreHeader> */}
        <BookCover />
        <LorePageDescription>
          <p>
            Welcome to the Forgotten Runes Book of Lore. This relic is a
            compendium of all the stories, art, and creative energy of our Cult
            members. It is every growing and ever changing, but its content is
            immutable on the blockchain. To contribute to this book,{" "}
            <a href="/posts/writing-in-the-book-of-lore">follow this guide.</a>
          </p>
          <p>Or click the book above to start reading from the beginning</p>
        </LorePageDescription>
      </LoreSharedLayout>
    </Layout>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {},
    revalidate: 5 * 60,
  };
}

export default BookOfLoreIndexPage;
