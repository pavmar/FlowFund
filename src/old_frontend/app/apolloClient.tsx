import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:9090/graphql', // Your GraphQL server endpoint
  cache: new InMemoryCache(),
});

export default client;