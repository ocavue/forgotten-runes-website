import styled from "@emotion/styled";
import dynamic from "next/dynamic";
import React from "react";
import Layout from "../components/Layout";

const DynamicGameRoot = dynamic(() => import("../game/GameRoot"), {
  ssr: false,
});

const Filler = styled.div`
  min-height: 100vh;
`;

const HeaderIntroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1em;
  margin: 0 auto;
  max-width: 700px;
  /* margin-bottom: -100px; */
  z-index: 100;
  position: relative;

  h1 {
    text-align: center;

    font-size: 1.8em;
    @media (min-width: 768px) {
      font-size: 3em;
    }
  }
`;
const Description = styled.div`
  font-family: "Roboto Mono", system-ui, -apple-system, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
`;

const HeaderIntro = () => {
  return (
    <HeaderIntroContainer>
      <h1>Welcome to the Collaborative&nbsp;Legendarium</h1>
      <Description>
        <p>
          Forgotten Runes Wizard's Cult is a decentralized approach to
          world-building. Worlds like Middle Earth, the Star Wars Galaxy, and
          Westeros were built by singular, lone creators.
        </p>

        <p>
          Our Runiverse, however, is built by thousands of creators in our
          community.
        </p>

        <p>
          With the use of blockchain technologies, our world grows larger
          everyday.
        </p>
      </Description>
    </HeaderIntroContainer>
  );
};

const IndexPage = () => (
  <Layout title="Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs">
    <Filler>
      <HeaderIntro />
      <DynamicGameRoot />
    </Filler>
  </Layout>
);

export default IndexPage;
