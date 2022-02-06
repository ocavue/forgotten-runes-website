import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import { keys } from "lodash";

const Img = styled.img`
  width: 100%;
  height: auto;
  image-rendering: pixelated;
`;

const baseURL = `/api/art/lockscreen`;

export const LockscreenImg = (props: {
  tokenSlug: string;
  tokenId: string;
  device?: string;
  ridingTokenSlug?: string;
  ridingTokenId?: string;
  width?: number;
  height?: number;
}) => {
  // ?tokenSlug=wizards&tokenId=6044
  const queryParams = keys(props)
    .map((a) => `${a}=${(props as any)[a]}`)
    .join("&");
  const src = baseURL + `?` + queryParams;
  return <Img src={src} />;
};
