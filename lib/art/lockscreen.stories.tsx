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
  grid-column-gap: 8px;
`;

const a = 2;

const LockscreenRenderGroup = ({}) => {
  return (
    <LockscreenContainer>
      <LockScreenImg tokenSlug="wizards" tokenId="6044" />
      <LockScreenImg tokenSlug="souls" tokenId="6044" device="iPhone SE" />
      <LockScreenImg tokenSlug="wizards" tokenId="1234" device="iPhone X" />
      <LockScreenImg
        tokenSlug="wizards"
        tokenId="8888"
        device="Desktop - Large"
      />
      <LockScreenImg tokenSlug="wizards" tokenId="1222" device="iPhone 6" />
      <LockScreenImg tokenSlug="wizards" tokenId="1223" device="iPhone 7" />
      <LockScreenImg tokenSlug="wizards" tokenId="76" device="iPhone 7" />
      <LockScreenImg
        tokenSlug="wizards"
        tokenId="1225"
        ridingTokenSlug="ponies"
        ridingTokenId="32"
        device="iPhone 4"
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
