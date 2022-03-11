import * as React from "react";
import { Flex } from "rebass";
import Spacer from "../Spacer";
import styled from "@emotion/styled";
import Link from "next/link";
import { useRouter } from "next/router";
import { COLORS, FONTS } from "../../styles/styleguide";

type Props = {
  children: any;
};

const StyledLink = styled.a<{ selected?: boolean }>`
  font-family: ${FONTS.robotishText};
  color: ${(props) => (props.selected ? COLORS.navBlurple : "white")};
  text-decoration: ${(props) => (props.selected ? "underline" : "none")};
  text-underline-offset: 6px;

  &:hover {
    color: ${COLORS.mustardLime};
  }
`;

const StyledSubnav = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 1em;
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
      <StyledSubnav>
        <Link href={"/lore"} passHref={true}>
          <StyledLink selected={isOnBookRoute}>Lore Pages</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/recent"} passHref={true}>
          <StyledLink selected={isOnRecentRoute}>Recent Lore</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/images"} passHref={true}>
          <StyledLink selected={isOnImagesRoute}>Lore with Images</StyledLink>
        </Link>
        <Spacer pl={4} />
        <Link href={"/lore/characters"} passHref={true}>
          <StyledLink selected={isOnCharactersRoute}>All Characters</StyledLink>
        </Link>
        {/*<Spacer pl={4} />*/}
        {/*<Link href={"/lore/stats"} passHref={true}>*/}
        {/*  <StyledLink selected={isOnStatsRoute}>Stats</StyledLink>*/}
        {/*</Link>*/}
      </StyledSubnav>
      {children}
    </Flex>
  );
};

export default LoreSharedLayout;
