import {
  ISchemaCustomizationContext,
  ISourcingConfig,
  GatsbyCache,
  CacheKey,
} from "../types"
import { buildTypeDefinitions } from "./build-types"
import { buildSourcingPlan } from "./analyze/build-sourcing-plan"
import { createNodeIdTransform } from "../config/node-id-transform"
import { createTypeNameTransform } from "../config/type-name-transform"
import { defaultGatsbyFieldAliases } from "../config/default-gatsby-field-aliases"

/**
 * Uses sourcing config to define Gatsby types explicitly
 * (using Gatsby schema customization API).
 */
export async function createSchemaCustomization(
  config: ISourcingConfig,
  cache: GatsbyCache,
  cacheKey: CacheKey
) {
  const context = createSchemaCustomizationContext(config)
  const typeDefs = buildTypeDefinitions(context)

  // store remote type definition in gatsby cache
  await cache.set(cacheKey, typeDefs)

  context.gatsbyApi.actions.createTypes(typeDefs)
}

export function createSchemaCustomizationContext(
  config: ISourcingConfig
): ISchemaCustomizationContext {
  const gatsbyFieldAliases =
    config.gatsbyFieldAliases ?? defaultGatsbyFieldAliases

  const {
    idTransform = createNodeIdTransform(),
    typeNameTransform = createTypeNameTransform({
      gatsbyTypePrefix: config.gatsbyTypePrefix,
      gatsbyNodeTypeNames: Array.from(config.gatsbyNodeDefs.keys()),
    }),
  } = config

  return {
    ...config,
    gatsbyFieldAliases,
    idTransform,
    typeNameTransform,
    sourcingPlan: buildSourcingPlan(config),
  }
}
