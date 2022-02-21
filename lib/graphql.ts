import { ApolloClient, from, HttpLink, InMemoryCache } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { onError } from "@apollo/client/link/error";

export const client = new ApolloClient({
  defaultOptions: { query: { errorPolicy: "all" } },
  cache: new InMemoryCache(),
  link: from([
    onError(({ graphQLErrors, networkError, operation, forward }) => {
      // To retry on network errors, we depend on the RetryLink
      // instead of the onError link. This just logs the error.
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }

      if (graphQLErrors) {
        console.warn(graphQLErrors);
      }
    }),
    new RetryLink({ delay: { initial: 120, max: 200, jitter: true } }),
    new HttpLink({ uri: process.env.GRAPHQL_ENDPOINT as string }),
  ]),
});
