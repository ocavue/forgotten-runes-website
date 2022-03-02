import React from "react";
import Layout from "../components/Layout";
import dynamic from "next/dynamic";
import styled from "@emotion/styled";
import { LorePageDescription } from "../components/Lore/loreStyles";

const WizardMapLeaflet = dynamic(
  () => import("../components/Lore/WizardMapLeaflet"),
  { ssr: false }
);

const Filler = styled.div`
  min-height: 100vh;
`;

const WizardGalleryPage = () => {
  return (
    <Layout title="Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs">
      <Filler>
        <LorePageDescription center={true}>
          <p>Here is every Wizard in the Forgotten Runes 10k collection</p>
        </LorePageDescription>
        <WizardMapLeaflet bookOfLore={false} />
      </Filler>
    </Layout>
  );
};

export default WizardGalleryPage;
