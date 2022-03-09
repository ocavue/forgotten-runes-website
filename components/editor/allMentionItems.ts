import productionWizardData from "../../data/nfts-prod.json";
import productionSoulsData from "../../data/souls-prod.json";
import productionPoniesData from "../../data/ponies-prod.json";
import { MentionAtomNodeAttributes } from "remirror/extensions";

export const allMentionItems: MentionAtomNodeAttributes[] = [
  // { id: "wizard2140", label: "Archmagus George of the Cosmos" },
  // { id: "soul1732", label: "Soul #1732" },
  // { id: "pony0", label: "MetaPony" },
];

for (const [id, wizard] of Object.entries(productionWizardData)) {
  allMentionItems.push({
    id: `wizard${id}`,
    label: wizard.name,
  });
}

for (const [id, soul] of Object.entries(productionSoulsData)) {
  allMentionItems.push({
    id: `soul${id}`,
    label: `Soul #${id}`,
  });
}

for (const [id, pony] of Object.entries(productionPoniesData)) {
  allMentionItems.push({
    id: `pony${id}`,
    label: pony.name,
  });
}
