import Layout from "../components/Layout";
import dynamic from "next/dynamic";
import styled from "@emotion/styled";
import { LorePageDescription } from "../components/Lore/loreStyles";

const DynamicMap = dynamic(() => import("../components/Map"), {
  ssr: false, // leaflet doesn't like Next.js SSR
});

const Filler = styled.div`
  min-height: 80vh;
`;

const MapPage = () => (
  <Layout title="A World Map Fragment of Forgotten Runes | Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs">
    <Filler>
      <DynamicMap />
      <LorePageDescription>
        <p>
          These are the current known regions of the Runiverse. There are many
          parts of this world that have yet to be charted...
        </p>
      </LorePageDescription>
    </Filler>
  </Layout>
);

export default MapPage;
