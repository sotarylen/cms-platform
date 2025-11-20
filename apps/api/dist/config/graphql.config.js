"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlDriverConfig = void 0;
const apollo_1 = require("@nestjs/apollo");
const node_path_1 = require("node:path");
const graphqlDriverConfig = () => ({
    driver: apollo_1.ApolloDriver,
    autoSchemaFile: (0, node_path_1.join)(process.cwd(), 'src/schema.gql'),
    playground: true,
    sortSchema: true,
    context: ({ req }) => ({ req }),
    uploads: false,
});
exports.graphqlDriverConfig = graphqlDriverConfig;
