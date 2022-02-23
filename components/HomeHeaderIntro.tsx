import styled from "@emotion/styled";
import dynamic from "next/dynamic";
import React, { useContext } from "react";
import Layout from "../components/Layout";
import useScrollPosition from "@react-hook/window-scroll";
import {
  useEventListener,
  useEventEmitter,
  GameContext,
} from "phaser-react-tools";
import events, { OnScrollEventArgs } from "../game/events";

const Filler = styled.div`
  min-height: 100vh;
`;

const SCROLL_SCALE = 100;

const HeaderIntroContainer = styled.div<{ scrollY: number }>`
  opacity: ${(props) =>
    Math.max(SCROLL_SCALE - props.scrollY, 0) / SCROLL_SCALE};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1em;
  margin: 0 auto;
  max-width: 700px;
  margin-bottom: -200px;
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

type Props = { scrollY: number };

export default function HomeHeaderIntro({ scrollY }: Props) {
  const game = useContext(GameContext);
  //   const scrollY = useScrollPosition(60 /*fps*/);
  //   const emitMetamaskConnected = useEventEmitter(events.ON_SCROLL);
  //   useEventListener(events.ON_SCROLL, (event: OnScrollEventArgs) => {
  //     console.log("event: ", event);
  //   });

  return (
    <HeaderIntroContainer scrollY={scrollY}>
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
}
