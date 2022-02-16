import * as React from "react";
import { Flex } from "rebass";
import Spacer from "../Spacer";
import styled from "@emotion/styled";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  children: any;
};

const StyledLink = styled.a<{ selected?: boolean }>`
  font-family: "Roboto Mono", system-ui, -apple-system, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";

  color: white;
  text-decoration: ${(props) => (props.selected ? "underline" : "none")};
  text-underline-offset: 6px;
`;

const LoreSharedLayout = ({ children }: Props) => {
  const { route, pathname } = useRouter();

  const isOnRecentRoute = route === "/lore/recent";
  const isOnImagesRoute = route === "/lore/images";
  const isOnCharactersRoute = route === "/lore/characters";
  const isOnStatsRoute = route === "/lore/stats";
  const isOnBookRoute =
    !isOnCharactersRoute &&
    !isOnRecentRoute &&
    !isOnStatsRoute &&
    !isOnImagesRoute;

  return (
    <Flex flexDirection={"column"} alignItems={"center"}>
      <Flex flexDirection={"row"}>
        <Link href={"/lore"} passHref={true}>
          <StyledLink selected={isOnBookRoute}>Book</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/recent"} passHref={true}>
          <StyledLink selected={isOnRecentRoute}>Recent</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/images"} passHref={true}>
          <StyledLink selected={isOnImagesRoute}>Images</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/characters"} passHref={true}>
          <StyledLink selected={isOnCharactersRoute}>Characters</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/stats"} passHref={true}>
          <StyledLink selected={isOnStatsRoute}>Stats</StyledLink>
        </Link>
      </Flex>
      {children}
    </Flex>
  );
};

export default LoreSharedLayout;
