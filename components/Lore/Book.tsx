import ReactMarkdown from "react-markdown";
import styled from "@emotion/styled";
import BookOfLoreControls from "./BookOfLoreControls";
import { ResponsivePixelImg } from "../../components/ResponsivePixelImg";
import PageHorizontalBreak from "../../components/PageHorizontalBreak";
import productionWizardData from "../../data/nfts-prod.json";
import { Box } from "rebass";

const wizData = productionWizardData as { [wizardId: string]: any };

const text = `
“Well, your father gave me this to give to you; and if I have chosen my own 
time and way for handing it over, you can hardly blame me, considering the 
trouble I had to find you. Your father could not remember his own name when he 
gave me the paper, and he never told me yours; so on the whole I think I ought to 
be praised and thanked! Here it is,” said he handing the map to Thorin. 

“I don’t understand,” said Thorin, and Bilbo felt he would have liked to say 
the same. The explanation did not seem to explain. 

“Your grandfather,” said the wizard slowly and grimly, “gave the map to his 
son for safety before he went to the mines of Moria. Your father went away to 
try his luck with the map after your grandfather was killed; and lots of 
adventures of a most unpleasant sort he had, but he never got near the Mountain. 
How he got there I don’t know, but I found him a prisoner in the dungeons of the 
Necromancer.” 

“Whatever were you doing there?” asked Thorin with a shudder, and all the 
dwarves shivered. 

“Never you mind. I was finding things out, as usual; and a nasty dangerous 
business it was. Even I, Gandalf, only just escaped. I tried to save your father, 
but it was too late. He was witless and wandering, and had forgotten almost 
everything except the map and the key.” 

“We have long ago paid the goblins of Moria,” said Thorin; “we must give a 
thought to the Necromancer.” 

“Don’t be absurd! He is an enemy far beyond the powers of all the dwarves 
put together, if they could all be collected again from the four corners of the 
world. The one thing your father wished was for his son to read the map and use 
the key. The dragon and the Mountain are more than big enough tasks for you!” 

“Hear, hear!” said Bilbo, and accidentally said it aloud. 

“Hear what?” they all said turning suddenly towards him, and he was so 
flustered that he answered “Hear what I have got to say!” 

“What’s that?” they asked.`;

const Carousel = styled.div`
  box-sizing: border-box;
  position: relative;
  height: calc(100vh - 58px - 30px);
  padding: 0 40px;
`;

const FirstPage = styled.div<{ bg?: string }>`
  background-color: ${(props) => props.bg || "#000000"};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spread = styled.div<{}>`
  display: grid;
  gap: 0px 0px;
  height: 75vh;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0px 4px 14px #00000026;
  border: 1px solid #63440b;

  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TextPage = styled.div`
  color: #e1decd;
  font-size: 24px;
  max-height: 70vh;
  overflow: scroll;
  padding: 1em;
  font-family: "Alagard", serif;
`;

export type Props = {
  wizardId: string;
  page: string;
};

const Book = ({ wizardId, page }: Props) => {
  const wizardData: any = wizData[wizardId.toString()];
  const bg = "#" + wizardData.background_color;

  return (
    <Box>
      <Carousel>
        <PageHorizontalBreak />
        <Spread>
          <FirstPage bg={bg}>
            <ResponsivePixelImg
              src={`https://nftz.forgottenrunes.com/wizards/alt/400-nobg/wizard-${wizardId}.png`}
              style={{ maxWidth: "480px" }}
            />
          </FirstPage>

          <FirstPage bg={bg}>
            <TextPage>
              <ReactMarkdown>{text}</ReactMarkdown>
            </TextPage>
          </FirstPage>
        </Spread>

        <BookOfLoreControls
          wizardId={wizardId as string}
          page={page as string}
        />
      </Carousel>
    </Box>
  );
};

export default Book;
