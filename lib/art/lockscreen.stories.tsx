import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import styled from "@emotion/styled";
import { keys } from "lodash";

const Img = styled.img`
  width: 100%;
  height: auto;
  image-rendering: pixelated;
`;

const baseURL = `http://localhost:3005/api/art/lockscreen`;

const LockScreenImg = (props: {
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

const LockscreenContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const LockscreenRenderGroup = ({}) => {
  return (
    <LockscreenContainer>
      <LockScreenImg tokenSlug="wizards" tokenId="6044" />
      <LockScreenImg tokenSlug="souls" tokenId="6044" device="iPhone SE" />
      <LockScreenImg tokenSlug="souls" tokenId="6044" device="iPhone X" />
      <LockScreenImg
        tokenSlug="souls"
        tokenId="6044"
        device="Desktop - Large"
      />
    </LockscreenContainer>
  );
};

export default {
  title: "Wizards/Lockscreen",
  component: LockscreenRenderGroup,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof LockscreenRenderGroup>;

const Template: ComponentStory<typeof LockscreenRenderGroup> = (args) => (
  <LockscreenRenderGroup {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
