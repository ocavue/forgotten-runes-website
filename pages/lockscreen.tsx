import Layout from "../components/Layout";
import styled from "@emotion/styled";
import LockscreenPicker from "../components/LockscreenPicker";
import InfoPageLayout from "../components/InfoPageLayout";

const Container = styled.div`
  min-height: 100vh;
`;

const LockscreenPage = () => (
  <InfoPageLayout
    title="Forgotten Runes Lockscreen Wallpaper Generator | Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs"
    size="wide"
  >
    <Container>
      <LockscreenPicker />
    </Container>
  </InfoPageLayout>
);

export default LockscreenPage;
