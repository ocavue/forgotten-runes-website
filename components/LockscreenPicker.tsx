import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import TokenSelector from "./TokenSelector";
import ResolutionSelector from "./ResolutionSelector";
import { LockscreenImg } from "./LockscreenImg";

type Props = {};

const LockscreenPickerElement = styled.div`
  display: flex;
  flex-direction: row;
`;

const Controls = styled.div`
  flex: 50%;
  margin: 0.5em;
`;
const Preview = styled.div`
  flex: 50%;
  margin: 0.5em;
  margin-left: 2em;
`;
const ImgFrame = styled.div`
  background-color: white;
  padding: 5px;
  padding-bottom: 3px;
  border-radius: 5px;
`;

export default function LockscreenPicker({}: Props) {
  const [currentToken, setCurrentToken] = useState<any>();
  const [currentResolution, setCurrentResolution] = useState<any>();

  let lockscreenImgProps;
  if (currentToken?.tokenTypeOption?.value === "ponies") {
    lockscreenImgProps = {
      ridingTokenSlug: currentToken?.tokenTypeOption?.value,
      ridingTokenId: currentToken?.tokenOption?.value,

      tokenSlug: currentToken?.riderTokenOption?.tokenTypeOption?.value,
      tokenId: currentToken?.riderTokenOption?.tokenOption?.value,
    };
  } else {
    lockscreenImgProps = {
      tokenSlug: currentToken?.tokenTypeOption?.value,
      tokenId: currentToken?.tokenOption?.value,
    };
  }

  return (
    <LockscreenPickerElement>
      <Controls>
        <h2>Pick a Wizard</h2>
        <TokenSelector onChange={setCurrentToken} />
        <h2>Pick a Resolution</h2>
        <ResolutionSelector onChange={setCurrentResolution} />
        {/* <pre>{JSON.stringify(currentToken, null, 2)}</pre>
        <pre>{JSON.stringify(currentResolution, null, 2)}</pre> */}
      </Controls>

      <Preview>
        <ImgFrame>
          <LockscreenImg
            {...lockscreenImgProps}
            device={currentResolution?.resolutionOption?.value?.name}
          />
        </ImgFrame>
      </Preview>
    </LockscreenPickerElement>
  );
}
