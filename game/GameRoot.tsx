import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { GameComponent } from "phaser-react-tools";
import config from "../game/config";
import Overlay from "../components/Overlay";
import FrameCounter from "../components/FrameCounter";
import EventEmitterButton from "../components/EventEmitterButton";
import { useWindowSize } from "@react-hook/window-size/throttled";
import events, { OnScrollEventArgs } from "../game/events";
import { useEventEmitter, useEventListener } from "phaser-react-tools";
import { useStore } from "../store";
import { MetamaskWatchers } from "./MetamaskWatchers";
import Head from "next/head";
import HomeHeaderIntro from "../components/HomeHeaderIntro";

type Props = {};

const GameRootWrapper = styled.div``;

export default function GameRoot({}: Props) {
  const store = useStore(null);

  // this setState means we get a rerender on scroll which is inefficient but
  // fine for now
  const [gameScroll, setGameScroll] = useState(0);

  return (
    <GameRootWrapper>
      <Head>
        <title>Forgotten Runes Wizards Cult</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <HomeHeaderIntro scrollY={gameScroll} />
      <GameComponent config={config}>
        <GameWatchers setGameScroll={setGameScroll} />
        <MetamaskWatchers />
        {/* <Overlay> */}
        {/* <FrameCounter></FrameCounter> */}
        {/* <EventEmitterButton></EventEmitterButton> */}
        {/* </Overlay> */}
      </GameComponent>
    </GameRootWrapper>
  );
}

type GameWatchersProps = {
  setGameScroll: (scrollY: number) => void;
};

export function GameWatchers({ setGameScroll }: GameWatchersProps) {
  const [width, height] = useWindowSize();

  const emitResize = useEventEmitter(events.ON_WINDOW_RESIZE);
  useEffect(() => {
    try {
      emitResize({ width, height });
    } catch (err) {
      // console.log("emitResize err:", err);
    }
  }, [width, height]);

  useEventListener(events.ON_SCROLL, (event: OnScrollEventArgs) => {
    // console.log("event: ", event);
    setGameScroll(event.scrollY);
  });

  return <React.Fragment />;
}
