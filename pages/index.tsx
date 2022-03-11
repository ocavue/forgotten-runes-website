import styled from "@emotion/styled";
import dynamic from "next/dynamic";
import React from "react";
import Layout from "../components/Layout";
import useScrollPosition from "@react-hook/window-scroll";
import {
  useEventListener,
  useEventEmitter,
  GameContext,
} from "phaser-react-tools";
import events, { OnScrollEventArgs } from "../game/events";

const DynamicGameRoot = dynamic(() => import("../game/GameRoot"), {
  ssr: false,
});

const Filler = styled.div`
  min-height: 100vh;
`;

const HeaderIntro = () => {};

const IndexPage = () => (
  <Layout title="Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs">
    <Filler>
      <DynamicGameRoot />
    </Filler>
  </Layout>
);

export default IndexPage;
