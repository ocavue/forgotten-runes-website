import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import wizardTraits from "../../public/static/nfts/wizards/wizards-traits.json";
import { sortBy } from "lodash";

type Props = {};

const WizardHeadsElement = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const IndividualTrait = styled.div`
  display: flex;
  flex-align: center;
  justify-content: top;
  flex-direction: column;

  padding: 20px;
  margin-bottom: 20px;

  max-width: 169px;

  .label {
    width: 100%;
    text-align: center;
    padding: 10px 0px 5px 0px;
    font-family: "Alagard", sans-serif;
  }
`;

export default function WizardHeads({}: Props) {
  const traits = sortBy(
    wizardTraits.filter((wt) => wt.trait === "head"),
    "label"
  ).slice(1); // skip 9272ETH

  return (
    <WizardHeadsElement>
      {traits.map((trait) => {
        return (
          <IndividualTrait key={trait.filename}>
            <img src={`/static/nfts/wizards/padded/${trait.filename}`} />
            <div className="label">{trait.label}</div>
          </IndividualTrait>
        );
      })}
    </WizardHeadsElement>
  );
}
