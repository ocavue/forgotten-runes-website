import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import Button from "../ui/Button";
import { useMst } from "../../store";
import { useEthers } from "@usedapp/core";

type Props = {};

const ConnectButton = styled(Button)`
  background-color: #3f2b20;
  cursor: pointer;
`;

import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import StyledModal from "../AddLore/StyledModal";
import { Flex } from "rebass";
import Spacer from "../Spacer";
import { ModalDecorator } from "../ui/ModalDecorator";

const walletConnectConnector = new WalletConnectConnector({
  infuraId: process.env.NEXT_PUBLIC_REACT_APP_INFURA_PROJECT_ID,
  chainId: parseInt(process.env.NEXT_PUBLIC_REACT_APP_CHAIN_ID as string),
  qrcode: true,
});

const ConnectModal = styled(ModalDecorator)`
  &__Overlay {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    transition: all 1s ease-in;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 2000;
  }

  &__Content {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    border: none;
    background: #0d0019;
    overflow: auto;
    border-radius: 3px;
    outline: none;
    padding: 10px;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    text-align: center;
    min-width: 20vw;
    min-height: 30vw;
    color: white;
    display: flex;
    width: 70vw;
    max-width: 600px;
    max-height: 90vh;
    z-index: 2001;
  }
`;
export default StyledModal;

export function ConnectWalletButton() {
  const { activate, activateBrowserWallet } = useEthers();
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  return (
    <>
      <ConnectModal
        isOpen={modalIsOpen}
        onRequestClose={setModalIsOpen}
        ariaHideApp={false}
      >
        <Flex
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          width={"100%"}
        >
          <ConnectButton
            onClick={async () => {
              await activateBrowserWallet();
              setModalIsOpen(false);
            }}
          >
            Connect Wallet (MetaMask etc)
          </ConnectButton>
          <Spacer pt={4} />
          <ConnectButton
            onClick={async () => {
              await activate(walletConnectConnector);
              setModalIsOpen(false);
            }}
          >
            Connect WalletConnect
          </ConnectButton>
        </Flex>
      </ConnectModal>
      <ConnectButton onClick={() => setModalIsOpen(!modalIsOpen)}>
        Connect Your Wallet
      </ConnectButton>
    </>
  );
}
