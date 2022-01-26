import { IPFS_SERVER } from "../constants";
import { BigNumber, Contract } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { fetchTokenUrisViaMultiCall } from "./web3Utils";
import zip from "lodash/zip";
import {
  CHARACTER_CONTRACTS,
  getSoulsContract,
  getWizardsContract,
  isPoniesContract,
  isSoulsContract,
  isWizardsContract,
} from "../contracts/ForgottenRunesWizardsCultContract";

import productionWizardData from "../data/nfts-prod.json";
import productionPoniesData from "../data/ponies-prod.json";
import productionSoulsData from "../data/souls-prod.json";
import stagingSoulsData from "../data/souls-staging.json";

const soulsData = (
  parseInt(process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID ?? "1") === 4
    ? stagingSoulsData
    : productionSoulsData
) as { [soulId: string]: any };
const wizData = productionWizardData as { [wizardId: string]: any };
const poniesData = productionPoniesData as { [wizardId: string]: any };

export async function httpifyUrl(url: string, tokenId: string) {
  url = url.replace(/0x\{id\}/, tokenId); // OpenSea
  if (url.match(/^http/)) {
    return url;
  } else if (url.match(/^ipfs/)) {
    return url.replace(/^ipfs:\/\//, `${IPFS_SERVER}/`);
  } else {
    return url;
  }
}

export async function getTokensAndUrisForAddress(
  contract: Contract,
  address: string,
  provider: BaseProvider
): Promise<any[]> {
  const tokens = await contract.tokensOfOwner(address);
  const tokenURIs = await fetchTokenUrisViaMultiCall(
    provider,
    contract.address,
    tokens
  );

  return zip(
    tokens.map((id: BigNumber) => id.toNumber()),
    tokenURIs
  );
}

export async function getTokenDataForAllCollections(
  mainProvider: BaseProvider,
  address: string
) {
  const wizardsContract = await getWizardsContract({ provider: mainProvider });
  const soulsContract = await getSoulsContract({ provider: mainProvider });

  const tokensAndUris = await Promise.all([
    getTokensAndUrisForAddress(wizardsContract, address, mainProvider),
    getTokensAndUrisForAddress(soulsContract, address, mainProvider),
  ]);

  const tokenData = {
    wizards: tokensAndUris[0],
    souls: tokensAndUris[1],
  };
  return tokenData;
}

export function getContractFromTokenSlug(slug: string) {
  return slug === "wizards"
    ? CHARACTER_CONTRACTS.wizards
    : slug === "souls"
    ? CHARACTER_CONTRACTS.souls
    : slug === "ponies"
    ? CHARACTER_CONTRACTS.ponies
    : "0xunknown";
}

export function getTokenName(tokenId: string, tokenAddress: string) {
  if (isWizardsContract(tokenAddress)) {
    // we always have a wiz name (even for burnt)
    return wizData[tokenId].name;
  } else if (isSoulsContract(tokenAddress)) {
    return soulsData?.[tokenId]?.name ?? `Soul #${tokenId}`;
  } else if (isPoniesContract(tokenAddress)) {
    return poniesData?.[tokenId]?.name ?? `Pony #${tokenId}`;
  }
}

export function getSlugFromTag(tag: string) {
  if (tag.toLowerCase() === "wizard") {
    return "wizards";
  }

  if (tag.toLowerCase() === "soul") {
    return "souls";
  }

  if (tag.toLowerCase() === "pony") {
    return "ponies";
  }

  return "uknownslug";
}

export function getTokenImageSrc(tokenId: string, tokenAddress: string) {
  if (isWizardsContract(tokenAddress)) {
    return `${process.env.NEXT_PUBLIC_REACT_APP_WIZARDS_WEB_IMG_BASE_URL}/alt/400-nobg/wizard-${tokenId}.png`;
  } else if (isSoulsContract(tokenAddress)) {
    return `${process.env.NEXT_PUBLIC_SOULS_API}/api/souls/img/${tokenId}.png`;
  } else if (isPoniesContract(tokenAddress)) {
    return `${process.env.NEXT_PUBLIC_SOULS_API}/api/shadowfax/img/${tokenId}.png`;
  }
}
