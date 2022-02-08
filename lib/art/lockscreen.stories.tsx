import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import styled from "@emotion/styled";
import { keys } from "lodash";
import LockscreenPicker from "../../components/LockscreenPicker";
import { LockscreenImg } from "../../components/LockscreenImg";

const LockscreenContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-column-gap: 8px;
`;

const a = 2;

const LockscreenRenderGroup = ({}) => {
  return (
    <LockscreenContainer>
      <LockscreenImg tokenSlug="wizards" tokenId="6044" />
      <LockscreenImg tokenSlug="souls" tokenId="6044" device="iPhone SE" />
      <LockscreenImg tokenSlug="wizards" tokenId="1234" device="iPhone X" />
      <LockscreenImg
        tokenSlug="wizards"
        tokenId="8888"
        device="Desktop - Large"
      />
      <LockscreenImg tokenSlug="wizards" tokenId="1222" device="iPhone 6" />
      <LockscreenImg tokenSlug="wizards" tokenId="1223" device="iPhone 7" />
      <LockscreenImg tokenSlug="wizards" tokenId="76" device="iPhone 7" />
      <LockscreenImg
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

export const LockscreenPickerStory = ({}) => {
  //   return <LockscreenPicker  />;
  return <div />;
};
