import styled from "@emotion/styled";
import { TokenConfiguration } from "./AddLore/WizardPicker";
import { motion } from "framer-motion";
import { getTokenImageSrc } from "../lib/nftUtilis";

const CardStyle = styled.div<{ isHovering?: boolean }>`
  transition: all 0.1s ease-in;
  max-width: 100%;
  position: relative;

  &:after {
    display: block;
  }
`;

export const WizardFrame = styled.div`
  position: relative;
  background-image: url("/static/img/wizard_frame.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const WizardImageContainer = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WizardImage = styled(motion.img)`
  width: 100%;
  height: auto;
  image-rendering: pixelated;
  margin-top: 23%;
  margin-bottom: 13%;
`;

export const WizardName = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  h3 {
    text-align: center;
    position: relative;
    line-height: 1em;

    font-size: 1em;
    padding: 0 30%;
    color: #dfd1a8;
    font-family: "Alagard";
    position: absolute;
    margin-top: 30%;
  }
`;

const WizardCard = ({
  tokenAddress,
  id,
  name,
  onWizardPicked,
}: {
  tokenAddress: string;
  id: string;
  name: string;
  onWizardPicked?: (wizardConfiguration: TokenConfiguration) => void;
}) => {
  return (
    <CardStyle>
      <WizardFrame
        onClick={
          onWizardPicked
            ? () => {
                const wizardPicked: TokenConfiguration = {
                  tokenAddress: tokenAddress,
                  tokenId: id,
                  name: name ?? id,
                };
                console.log("wizardPicked: ", wizardPicked);
                onWizardPicked(wizardPicked);
              }
            : () => null
        }
      >
        <WizardName>
          <h3>
            {name} (#{id})
          </h3>
        </WizardName>
        <WizardImageContainer>
          <WizardImage
            layoutId={`wizard-image-${id}`}
            key={`wizard-image-${id}`}
            src={getTokenImageSrc(id, tokenAddress)}
          />
        </WizardImageContainer>
      </WizardFrame>
    </CardStyle>
  );
};

export default WizardCard;
