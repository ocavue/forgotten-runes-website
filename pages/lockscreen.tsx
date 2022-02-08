import Layout from "../components/Layout";
import styled from "@emotion/styled";
import LockscreenPicker from "../components/LockscreenPicker";
import InfoPageLayout from "../components/InfoPageLayout";
import { GetServerSidePropsContext } from "next";

const Container = styled.div`
  min-height: 100vh;
`;

const LockscreenPage = ({
  tokenSlug,
  tokenId,
  ridingTokenSlug,
  ridingTokenId,
}: {
  tokenSlug: string;
  tokenId: string;
  device?: string;
  ridingTokenSlug?: string;
  ridingTokenId?: string;
  width?: number;
  height?: number;
  ratio?: number;
}) => (
  <InfoPageLayout
    title="Forgotten Runes Lockscreen Wallpaper Generator | Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs"
    size="wide"
  >
    <Container>
      <LockscreenPicker
        tokenSlug={tokenSlug}
        tokenId={tokenId}
        ridingTokenSlug={ridingTokenSlug}
        ridingTokenId={ridingTokenId}
      />
    </Container>
  </InfoPageLayout>
);

export default LockscreenPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      tokenId: context.query?.tokenId || null,
      tokenSlug: context.query?.tokenSlug || null,
      tokenOption: context.query?.tokenOption || null,
      tokenTypeOption: context.query?.tokenTypeOption || null,
    },
  };
}
