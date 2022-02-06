import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Select from "react-select";
import AyncSelect from "react-select/async";

import wizardLayers from "../public/static/nfts/wizards/wizards-layers.json";
import soulLayers from "../public/static/nfts/souls/souls-layers.json";
import ponyLayers from "../public/static/nfts/ponies/ponies-layers.json";

import { keyBy, sortBy } from "lodash";
import FuzzyReactSelect from "./FuzzyReactSelect";

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
  includeMounts?: boolean;
};

const TokenSelectorElement = styled.div``;

const tokenTypeOptions = [
  { value: "wizards", label: "Wizard" },
  { value: "souls", label: "Soul" },
  { value: "ponies", label: "Pony" },
];

// fuze.js options
const fuzzyOptions = {
  keys: [{ name: "label", weight: 0.7 }],
  valueKey: "value",
  maxPatternLength: 8,
  includeScore: true,
  maxResults: 25,
  threshold: 0.3,
};

export const customSelectStyles: any = {
  container: (provided: any) => ({
    ...provided,
    minWidth: "98%",
    maxWidth: "98%",
    margin: "5px",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
  }),
  input: (provided: any) => ({
    ...provided,
    // backgroundColor: "#171818",
    color: "white",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
    color: "white",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#350a49"
      : state.isFocused
      ? "#092953"
      : "#171818",
    color: "white",
    "&:hover": {
      backgroundColor: "#212222",
    },
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
    color: "white",
    borderColor: "#3D3F3E",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
    color: "white",
  }),
};

export default function TokenSelector({
  onChange,
  includeMounts = true,
}: Props) {
  const [tokenTypeOption, setTokenTypeOption] = useState(tokenTypeOptions[0]);
  const [tokenOption, setTokenOption] = useState(wizardOptions[0]);
  const [tokenOptionsSet, setTokenOptionsSet] = useState(wizardOptions);

  const [riderTokenOption, setRiderTokenOption] = useState();

  useEffect(() => {
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
    onChange({ tokenTypeOption, tokenOption, riderTokenOption });
  }, [tokenTypeOption, tokenOption, riderTokenOption]);

  // TODO
  // _now_ if you have a pony selected, you can also select another wizard or soul
  // maybe don't be too clever: just reimplement and abstract
  let typeOptions = includeMounts
    ? tokenTypeOptions
    : tokenTypeOptions.filter((t) => t.value !== "ponies");

  return (
    <TokenSelectorElement>
      <Select
        styles={customSelectStyles}
        options={typeOptions}
        defaultValue={tokenTypeOption}
        value={tokenTypeOption}
        onChange={setTokenTypeOption as any}
      />

      <FuzzyReactSelect
        styles={customSelectStyles}
        theme={(theme: any) => ({
          ...theme,
          colors: {
            ...theme.colors,
          },
        })}
        options={tokenOptionsSet}
        fuzzyOptions={fuzzyOptions}
        onChange={setTokenOption as any}
        placeholder="Search..."
      />

      {tokenTypeOption.value === "ponies" && (
        <>
          <h3>Pick a rider</h3>
          <TokenSelector
            onChange={setRiderTokenOption as any}
            includeMounts={false}
          />
        </>
      )}
    </TokenSelectorElement>
  );
}
