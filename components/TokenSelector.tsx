import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Select from "react-select";

import wizardLayers from "../public/static/nfts/wizards/wizards-layers.json";
import soulLayers from "../public/static/nfts/souls/souls-layers.json";
import ponyLayers from "../public/static/nfts/ponies/ponies-layers.json";

import { keyBy, sortBy } from "lodash";

const wizardOptions = wizardLayers.map((w) => {
  const name = `Wizard #${w.idx} ${w.name}`;
  return { value: w.idx, label: name };
});

const soulsOptions = sortBy(
  soulLayers.map((w) => {
    const name = `Soul #${w.idx} ${w.name}`;
    return { value: w.idx, label: name };
  }),
  (w) => parseInt(w.value)
);

const poniesOptions = sortBy(
  ponyLayers.map((w) => {
    const name = `Pony #${w.idx} ${w.name}`;
    return { value: w.idx, label: name };
  }),
  (w) => parseInt(w.value)
);

type Props = {
  onChange: any;
};

const TokenSelectorElement = styled.div``;

const tokenTypeOptions = [
  { value: "wizards", label: "Wizard" },
  { value: "souls", label: "Soul" },
  { value: "ponies", label: "Pony" },
];

export default function TokenSelector({ onChange }: Props) {
  const [tokenTypeOption, setTokenTypeOption] = useState(tokenTypeOptions[0]);
  const [tokenOption, setTokenOption] = useState(wizardOptions[0]);
  const [tokenOptionsSet, setTokenOptionsSet] = useState(wizardOptions);

  useEffect(() => {
    console.log("yo");
    if (tokenTypeOption) {
      setTokenOptionsSet(
        tokenTypeOption.value === "wizards"
          ? wizardOptions
          : tokenTypeOption.value === "souls"
          ? soulsOptions
          : tokenTypeOption.value === "ponies"
          ? poniesOptions
          : wizardOptions
      );
      setTokenOption(
        tokenTypeOption.value === "wizards"
          ? wizardOptions[0]
          : tokenTypeOption.value === "souls"
          ? soulsOptions[0]
          : tokenTypeOption.value === "ponies"
          ? poniesOptions[0]
          : wizardOptions[0]
      );
    }
  }, [tokenTypeOption]);

  useEffect(() => {
    onChange({ tokenTypeOption, tokenOption });
  }, [tokenTypeOption, tokenOption]);

  return (
    <TokenSelectorElement>
      <Select
        options={tokenTypeOptions}
        defaultValue={tokenTypeOption}
        value={tokenTypeOption}
        onChange={setTokenTypeOption as any}
      />

      <Select
        options={tokenOptionsSet}
        defaultValue={tokenOptionsSet[0]}
        value={tokenOption}
        onChange={setTokenOption as any}
        isSearchable={true}
      />
    </TokenSelectorElement>
  );
}
