import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';

export const graphqlDriverConfig = (): ApolloDriverConfig => ({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  playground: true,
  sortSchema: true,
  context: ({ req }) => ({ req }),
  uploads: false,
});
