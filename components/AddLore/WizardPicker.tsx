import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { EmptyWell } from "../ui/EmptyWell";
import { ConnectWalletButton } from "../web3/ConnectWalletButton";
import {
  CHARACTER_CONTRACTS,
  FORGOTTEN_PONIES_ADDRESS,
  getSoulsContract,
  getWizardsContract,
} from "../../contracts/ForgottenRunesWizardsCultContract";
import Button from "../ui/Button";
import StyledModal from "./StyledModal";
import WizardCard from "../WizardCard";
import productionWizardData from "../../data/nfts-prod.json";
import productionSoulsData from "../../data/souls-prod.json";
import stagingSoulsData from "../../data/souls-staging.json";
import productionPoniesData from "../../data/ponies-prod.json";

import { BigNumber } from "ethers";
import { useEthers } from "@usedapp/core";
import {
  Contract as EthCallContract,
  Provider as EthCallProvider,
} from "ethcall";
import { PONIES_ABI } from "../../contracts/abis";
import { Network, Web3Provider } from "@ethersproject/providers";

const wizData = productionWizardData as { [wizardId: string]: any };
const soulsData = (
  parseInt(process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID ?? "1") === 4
    ? stagingSoulsData
    : productionSoulsData
) as { [soulId: string]: any };
const poniesData = productionPoniesData as { [wizardId: string]: any };

const WizardPickerModalElement = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
  width: 100%;
  height: 100%;
`;

export const WizardPickerFormContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  padding: 1em 0em 1em 0em;
`;

function NotConnected() {
  return (
    <div>
      <ConnectWalletButton />
    </div>
  );
}

const WizardGridElement = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
`;

const WizardGridLayout = styled.div`
  display: grid;
  grid-gap: 5px;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  font-size: 12px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    font-size: 10px;
  }
`;

const NoWizards = styled.div`
  font-family: "Alagard";
  font-size: 1.5em;
`;

export type onWizardPickedFn = (
  wizardConfiguration: WizardConfiguration
) => void;

function WizardGrid({
  tokens,
  onWizardPicked,
}: {
  tokens: { [tokenAddress: string]: any[] } | undefined;
  onWizardPicked: onWizardPickedFn;
}) {
  // console.log(tokens);
  // console.log(CHARACTER_CONTRACTS);
  return (
    <WizardGridElement>
      <WizardGridLayout>
        {(tokens?.[CHARACTER_CONTRACTS.wizards] ?? []).map((token: any) => {
          return (
            <WizardCard
              key={"wizards-" + token.id}
              tokenAddress={CHARACTER_CONTRACTS.wizards}
              id={token.id}
              name={token.name}
              onWizardPicked={onWizardPicked}
            />
          );
        })}
        {(tokens?.[CHARACTER_CONTRACTS.souls] ?? []).map((token: any) => {
          return (
            <WizardCard
              key={"souls-" + token.id}
              tokenAddress={CHARACTER_CONTRACTS.souls}
              id={token.id}
              name={token?.name ?? token.id}
              onWizardPicked={onWizardPicked}
            />
          );
        })}
        {(tokens?.[CHARACTER_CONTRACTS.ponies] ?? []).map((token: any) => {
          return (
            <WizardCard
              key={"ponies-" + token.id}
              tokenAddress={CHARACTER_CONTRACTS.ponies}
              id={token.id}
              name={token?.name ?? token.id}
              onWizardPicked={onWizardPicked}
            />
          );
        })}
      </WizardGridLayout>
      {tokens?.[CHARACTER_CONTRACTS.souls]?.length === 0 &&
        tokens?.[CHARACTER_CONTRACTS.wizards]?.length === 0 &&
        tokens?.[CHARACTER_CONTRACTS.ponies]?.length === 0 && (
          <NoWizards>
            The connected wallet doesn't hold any Wizards or Souls or Ponies.
            Perhaps try another wallet?
          </NoWizards>
        )}
    </WizardGridElement>
  );
}

export function WizardList({
  onWizardPicked,
}: {
  onWizardPicked: onWizardPickedFn;
}) {
  const [tokens, setTokens] = useState<{ [tokenAddress: string]: any[] }>();
  const { account, library } = useEthers();

  useEffect(() => {
    async function run() {
      console.log("getting characters");
      try {
        const { chainId } = (await library?.getNetwork()) as Network;

        const wizardsContract = await getWizardsContract({
          provider: library,
          chainId: chainId,
        });

        const soulsContract = await getSoulsContract({
          provider: library,
          chainId: chainId,
        });

        const ethcallProvider = new EthCallProvider();
        await ethcallProvider.init(library as Web3Provider);

        const poniesContract = new EthCallContract(
          FORGOTTEN_PONIES_ADDRESS[chainId as number],
          PONIES_ABI
        );
        let poniesTokens = await ethcallProvider.tryAll(
          Array.from({ length: 10 }).map((_, i) =>
            poniesContract.tokenOfOwnerByIndex(account, i)
          )
        );

        poniesTokens = poniesTokens.filter((value: any) => value);

        console.log(poniesTokens);

        const [wizardTokens, soulsTokens] = await Promise.all([
          wizardsContract.tokensOfOwner(account),
          soulsContract.tokensOfOwner(account),
        ]);

        setTokens({
          [wizardsContract.address.toLowerCase()]: wizardTokens.map(
            (id: BigNumber) => ({
              ...wizData[id.toNumber()],
              ["id"]: id.toNumber().toString(),
            })
          ),
          [soulsContract.address.toLowerCase()]: soulsTokens.map(
            (id: BigNumber) => ({
              ...soulsData[id.toNumber()],
              id: id.toNumber().toString(),
            })
          ),
          [FORGOTTEN_PONIES_ADDRESS[chainId as number].toLowerCase()]:
            poniesTokens.map((id: BigNumber) => ({
              ...poniesData[id.toNumber()],
              id: id.toNumber().toString(),
            })),
        });
      } catch (err) {
        console.log("err: ", err);
      }
    }
    if (library && account) run();
  }, [library, account]);

  return <WizardGrid tokens={tokens} onWizardPicked={onWizardPicked} />;
}

function WizardPickerModal({ onRequestClose, onWizardPicked }: any) {
  return (
    <WizardPickerModalElement>
      <h1>Pick a Character</h1>
      <WizardPickerFormContainer>
        <WizardList onWizardPicked={onWizardPicked} />
      </WizardPickerFormContainer>
      <Button onClick={onRequestClose}>Done</Button>
    </WizardPickerModalElement>
  );
}

type Props = {
  currentWizard: WizardConfiguration | undefined;
  setCurrentWizard: (WizardConfiguration: WizardConfiguration) => void;
};

const WizardPickerElement = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-height: 100%;
`;

const StyledPickWizardButton = styled(Button)`
  margin-top: 1em;
  cursor: pointer;
`;

/**
 * Wizard Picker
 *
 * This component lets the user pick a Wizard to attach lore to.
 *
 **/

export type WizardConfiguration = {
  tokenAddress: string;
  tokenId: string;
  name: string;
};

const WizardPicker = ({ currentWizard, setCurrentWizard }: Props) => {
  const { account } = useEthers();

  console.log(account);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const closeModal = () => setModalIsOpen(false);

  const onWizardModalPicked = (wizardConfiguration: WizardConfiguration) => {
    setCurrentWizard(wizardConfiguration);
  };

  if (!account) {
    return (
      <EmptyWell>
        <NotConnected />
      </EmptyWell>
    );
  }

  function wizardPicked(wizardConfiguration: WizardConfiguration) {
    onWizardModalPicked(wizardConfiguration);
    closeModal();
  }

  return (
    <WizardPickerElement>
      <EmptyWell noBorder={!!currentWizard}>
        {currentWizard && (
          <WizardCard
            tokenAddress={currentWizard.tokenAddress}
            id={currentWizard.tokenId}
            name={currentWizard.name}
          />
        )}
        {!currentWizard && (
          <StyledPickWizardButton onClick={() => setModalIsOpen(!modalIsOpen)}>
            Pick {currentWizard ? "another" : "a"} character
          </StyledPickWizardButton>
        )}
        <StyledModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          ariaHideApp={false}
        >
          <WizardPickerModal
            onRequestClose={closeModal}
            onWizardPicked={wizardPicked}
          />
        </StyledModal>
      </EmptyWell>
    </WizardPickerElement>
  );
};

export default WizardPicker;
