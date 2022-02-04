import styled from "@emotion/styled";
import "draft-js/dist/Draft.css";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { getPendingLoreTxHashRedirection } from "../../components/AddLore/addLoreHelpers";
import { Flex } from "rebass";

import { useTimeoutFn } from "react-use";

export type LoreAPISubmitParams = {
  token_address: string;
  token_id: string;
  signature: string;
  title: string | null;
  story: string | null;
  pixel_art: boolean;
  bg_color: string | null | undefined;
};

export const WaitingText = styled.div`
  color: #e1decd;
  font-size: 24px;
  overflow: scroll;
  padding: 1em;
  font-family: "Alagard", serif;
`;
const WaitingForGraphPage = () => {
  const router = useRouter();
  useTimeoutFn(() => {
    // @ts-ignore
    window.location = `/lore/add?waitForTxHash=${router.query?.waitForTxHash}&tokenId=${router.query?.tokenId}&tokenAddress=${router.query?.tokenAddress}&waited=true`;
  }, 5 * 1000);

  return (
    <Flex
      width={"100%"}
      height={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <WaitingText>Waiting for your lore to be inscribed...</WaitingText>
    </Flex>
  );
};

const AddLorePage = () => {
  const router = useRouter();

  if (
    (router.query?.waitForTxHash || router.query?.lorePageToPrefetch) &&
    router.query?.tokenId
  ) {
    return <WaitingForGraphPage />;
  }

  return <h2>Hmm, something went wrong...</h2>;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (context.query?.waitForTxHash && context.query?.tokenId) {
    if (!context.query?.client) {
      console.log("Server side checking pending...");

      const pendingLoreProps = await getPendingLoreTxHashRedirection({
        waitForTxHash: context.query.waitForTxHash as string,
        tokenAddress: context.query.tokenAddress as string,
        tokenId: context.query.tokenId as string,
        waitedOneRound: Boolean(context.query?.waited) ?? false,
      });
      return pendingLoreProps;
    } else {
      return { props: {} };
    }
  } else {
    return {
      redirect: {
        destination: "/lore/write",
        permanent: false,
      },
    };
  }
}

export default AddLorePage;
