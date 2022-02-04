import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  FORGOTTEN_PONIES_ADDRESS,
  FORGOTTEN_SOULS_ADDRESS,
  getAllCharacterContracts,
  getSoulsContract,
  getWizardsContract,
  WIZARDS_CONTRACT_ADDRESS,
} from "../../contracts/ForgottenRunesWizardsCultContract";
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
import { Web3Provider } from "@ethersproject/providers";
import every from "lodash/every";

const wizData = productionWizardData as { [wizardId: string]: any };
const soulsData = (
  parseInt(process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID ?? "1") === 4
    ? stagingSoulsData
    : productionSoulsData
) as { [soulId: string]: any };
const poniesData = productionPoniesData as { [wizardId: string]: any };

export const WizardPickerFormContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  padding: 1em 0em 1em 0em;
`;

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

export type onTokenPickedFn = (tokenConfiguration: TokenConfiguration) => void;

function WizardGrid({
  tokens,
  onTokenPicked,
}: {
  tokens: { [tokenAddress: string]: any[] } | undefined;
  onTokenPicked: onTokenPickedFn;
}) {
  const { chainId } = useEthers();

  const contracts = getAllCharacterContracts(chainId as number);

  return (
    <WizardGridElement>
      <WizardGridLayout>
        {contracts.map((contract: string) =>
          (tokens?.[contract] ?? []).map((token: any) => {
            return (
              <WizardCard
                key={`${contract}-${token.id}`}
                tokenAddress={contract}
                id={token.id}
                name={token.name}
                onWizardPicked={onTokenPicked}
              />
            );
          })
        )}
      </WizardGridLayout>
      {every(
        contracts,
        (contract: string) => tokens?.[contract]?.length === 0
      ) && (
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
  onWizardPicked: onTokenPickedFn;
}) {
  const [tokens, setTokens] = useState<{ [tokenAddress: string]: any[] }>();
  const { account, library, chainId } = useEthers();

  useEffect(() => {
    async function run() {
      if (!(library && account && chainId)) return;
      console.log("Getting characters...");
      try {
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
          FORGOTTEN_PONIES_ADDRESS[chainId].toLowerCase(),
          PONIES_ABI
        );

        let [wizardTokens, soulsTokens, poniesTokens] = await Promise.all([
          wizardsContract.tokensOfOwner(account),
          soulsContract.tokensOfOwner(account),
          ethcallProvider.tryAll(
            Array.from({ length: 10 }).map((_, i) =>
              poniesContract.tokenOfOwnerByIndex(account, i)
            )
          ),
        ]);
        poniesTokens = poniesTokens.filter((value: any) => value); // multicalll can give undefineds

        console.log("Got all characters from chain...");

        const tokensDict = {
          [WIZARDS_CONTRACT_ADDRESS[chainId].toLowerCase()]: wizardTokens.map(
            (id: BigNumber) => ({
              ...wizData[id.toNumber()],
              ["id"]: id.toNumber().toString(),
            })
          ),
          [FORGOTTEN_SOULS_ADDRESS[chainId].toLowerCase()]: soulsTokens.map(
            (id: BigNumber) => ({
              ...soulsData[id.toNumber()],
              id: id.toNumber().toString(),
            })
          ),
          [FORGOTTEN_PONIES_ADDRESS[chainId].toLowerCase()]: poniesTokens.map(
            (id: BigNumber) => ({
              ...poniesData[id.toNumber()],
              id: id.toNumber().toString(),
            })
          ),
        };

        console.log(tokensDict);

        setTokens(tokensDict);
      } catch (err) {
        console.log("err: ", err);
      }
    }

    run();
  }, [library, account, chainId]);

  return <WizardGrid tokens={tokens} onTokenPicked={onWizardPicked} />;
}

export type TokenConfiguration = {
  tokenAddress: string;
  tokenId: string;
  name: string;
};
