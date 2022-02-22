import { css } from "@emotion/react";
import { FONTS } from "../../styles/styleguide";
import styled from "@emotion/styled";

export const loreTextStyles = css`
  font-size: 16px;

  h1,
  h2,
  h3,
  h4,
  h5 {
    margin-top: 0.5em;
    font-family: "Alagard", serif;
  }

  h1 {
    font-size: 32px;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 18px;
  }
  h4 {
    font-size: 16px;
  }

  blockquote {
    background-color: #ffffff14;
    margin: 0;
    padding: 1em;
    border-radius: 2px;
  }
`;

export const LorePageHeader = styled.div``;
export const LorePageDescription = styled.div<{ center?: boolean }>`
  font-family: ${FONTS.robotishText};
  max-width: 768px;
  padding: 1em;
  margin: 0 auto;

  text-align: ${(props) => (props.center ? "center" : "left")};
`;
