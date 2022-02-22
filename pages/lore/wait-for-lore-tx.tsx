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
    if (router.query?.waitForTxHash || router.query?.redirectTo) {
      // @ts-ignore
      window.location = router.query?.redirectTo
        ? router.query?.redirectTo
        : `/lore/wait-for-lore-tx?waitForTxHash=${router.query?.waitForTxHash}`;
    }
  }, 5 * 1000);

  if (router.query?.waitForTxHash || router.query?.redirectTo) {
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
  }

  return <h2>Hmm, something went wrong...</h2>;
};

const WaitForLoreTxPage = () => {
  return <WaitingForGraphPage />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (context.query?.waitForTxHash) {
    if (!context.query?.client) {
      console.log("Server side checking pending...");
      console.log(context.query.tokenAddress as string);
      const protocol = context.req.headers.host?.startsWith("local")
        ? "http"
        : "https";

      return await getPendingLoreTxHashRedirection(
        context.query.waitForTxHash as string,
        `${protocol}://${context.req.headers.host}`
      );
    } else {
      return { props: {} };
    }
  } else {
    return { props: {} };
  }
}

export default WaitForLoreTxPage;
