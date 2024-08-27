import type { ReferenceConfiguration as ScalarConfig } from "@scalar/api-reference";

/**
 * Nitro OpenAPI configuration
 */
export interface NitroOpenAPIConfig {
  /**
   * OpenAPI meta information
   */
  meta?: {
    title?: string;
    description?: string;
    version?: string;
  };

  /**
   * OpenAPI json route
   *
   * Default is `/_openapi.json`
   */
  route?: string;

  /**
   * Enable OpenAPI generation for production builds
   */
  production?: false | "runtime" | "prerender";

  /**
   * UI configurations
   */
  ui?: {
    /**
     * Scalar UI configuration
     */
    scalar?:
      | false
      | (ScalarConfig & {
          /**
           * Scalar UI route
           *
           * Default is `/_scalar`
           */
          route?: string;
        });
    /**
     * Swagger UI configuration
     */
    swagger?:
      | false
      | {
          /**
           * Swagger UI route
           *
           * Default is `/_swagger`
           */
          route?: string;
        };
  };
}
