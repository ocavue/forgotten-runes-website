import React, { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import styled from "@emotion/styled";
import { keys } from "lodash";
import TokenSelector from "./TokenSelector";
import ResolutionSelector from "./ResolutionSelector";

const Container = styled.div`
  display: flex;
`;

const a = 2;

const RenderGroup = ({}) => {
  const [currentToken, setCurrentToken] = useState();
  const onTokenSelectorChange = (values: any) => {
    setCurrentToken(values);
  };
  return (
    <Container>
      <TokenSelector onChange={onTokenSelectorChange} />
      {/* <pre>{JSON.stringify(tokenTypeOption, null, 2)}</pre> */}
      <pre>{JSON.stringify(currentToken, null, 2)}</pre>
    </Container>
  );
};

export default {
  title: "Wizards/TokenSelector",
  component: RenderGroup,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof RenderGroup>;

const Template: ComponentStory<typeof RenderGroup> = (args) => (
  <RenderGroup {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};

export const ResolutionSelectorGroup = ({}) => {
  const [currentToken, setCurrentToken] = useState();
  return (
    <Container>
      <ResolutionSelector onChange={setCurrentToken} />
      <pre>{JSON.stringify(currentToken, null, 2)}</pre>
    </Container>
  );
};
