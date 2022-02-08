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

const rideables = ["ponies"];

export const LockscreenImg = (props: {
  tokenSlug: string;
  tokenId: string;
  ridingTokenSlug?: string;
  ridingTokenId?: string;
  device?: string;
  width?: number;
  height?: number;
  ratio?: number;
}) => {
  const {
    tokenSlug,
    tokenId,
    ridingTokenSlug,
    ridingTokenId,
    device,
    width,
    height,
    ratio,
  } = props;

  const baseProps = {
    device,
    width,
    height,
    ratio,
  };

  // we want to be able to get a pony aloney so
  // the tokenSlug in that case is "pony"
  let queryProps = rideables.includes(tokenSlug)
    ? {
        ...baseProps,
        ridingTokenSlug: tokenSlug,
        ridingTokenId: tokenId,
        tokenSlug: ridingTokenSlug,
        tokenId: ridingTokenId,
      }
    : props;

  // ?tokenSlug=wizards&tokenId=6044
  const queryParams = keys(queryProps)
    .map((a) => `${a}=${(queryProps as any)[a]}`)
    .join("&");
  const src = baseURL + `?` + queryParams;
  return <Img src={src} />;
};
