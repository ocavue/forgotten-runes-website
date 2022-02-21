import { NextApiRequest, NextApiResponse } from "next";
import { client } from "../../../lib/graphql";
import {
  getLoreAsEvenPage,
  getPreviousAndNextPageRoutes,
} from "../../../components/Lore/loreFetchingUtils";
import { gql } from "@apollo/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    req.query.secret !== process.env.REVALIDATION_SECRET_TOKEN ||
    !process.env.REVALIDATION_SECRET_TOKEN
  ) {
    return res.status(401).json({});
  }

  const tokenSlug = req.query.tokenSlug as string;
  const tokenId = req.query.tokenId as string;
  const page = req.query.page as string;

  if (!tokenSlug || !tokenId || !page) {
    return res
      .status(400)
      .json({ message: "Need tokenSlug, tokenId and page" });
  }

  console.log(`Checking if we have ${tokenSlug}-${tokenId} page ${page} in db`);

  const { data } = await client.query({
    query: gql`
      query Query {
        PaginatedLore(
          limit: 1
          order_by: { globalpage: asc }
          where: {
            slug: { _eq: ${tokenSlug} }
            tokenId: { _eq: ${parseInt(tokenId)} }
            page: { _eq: ${parseInt(page)} }
          }
        ) {
          globalpage
        }
      }
    `,
  });

  if (data.PaginatedLore.length === 0) {
    console.warn("Wasn't found hm");
    return res.status(400).json({ message: "Don't know about this page..." });
  }

  const globalPage = data.PaginatedLore?.[0].globalpage;

  const { previousPageRoute, nextPageRoute } =
    await getPreviousAndNextPageRoutes(globalPage, globalPage, tokenSlug);

  try {
    const mainRoute = `/lore/${tokenSlug.toLowerCase()}/${tokenId}/${getLoreAsEvenPage(
      parseInt(page) - 1
    )}`;

    console.log(`Revalidating ${mainRoute}`);

    await res.unstable_revalidate(mainRoute);

    if (nextPageRoute) {
      console.log(`Revalidating next: ${nextPageRoute}`);
      await res.unstable_revalidate(nextPageRoute);
    }
    if (previousPageRoute) {
      console.log(`Revalidating previous: ${previousPageRoute}`);
      await res.unstable_revalidate(previousPageRoute);
    }

    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send("Error revalidating");
  }
}
