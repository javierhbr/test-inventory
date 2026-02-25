import { mockDslGroups, mockRecipeGroups } from '../data/mockDsls';
import { mockLobConfigurations } from '../data/mockLobConfig';
import type {
  GroupedDsls,
  GroupedRecipes,
  Lob,
  LobConfigurationSections,
  TdmRecipeConfig,
} from '../types/domain';

interface DslRouteResult {
  statusCode: number;
  body: {
    success: boolean;
    data?: unknown;
    error?: {
      code: string;
      message: string;
    };
  };
}

// ---------------------------------------------------------------------------
// In-memory stores (seeded from mock data, mutated by PUT endpoints)
// ---------------------------------------------------------------------------

let dslStore: GroupedDsls = structuredClone(mockDslGroups);
let recipeStore: GroupedRecipes = structuredClone(mockRecipeGroups);
let lobConfigStore: LobConfigurationSections = structuredClone(
  mockLobConfigurations
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function methodNotAllowed(method: string, path: string): DslRouteResult {
  return {
    statusCode: 405,
    body: {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${method} is not allowed for ${path}`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export function handleDslHttpRoute(
  method: string,
  rawPath: string,
  body: unknown,
  queryParams?: Record<string, string | undefined>
): DslRouteResult | null {
  const path = normalizePath(rawPath);

  // GET /api/dsls — read all config (optionally filtered by ?lob=CARD)
  // PUT /api/dsls — replace grouped DSLs + recipes
  if (path === '/api/dsls') {
    if (method === 'GET') {
      const lobFilter = queryParams?.lob as Lob | undefined;

      let grouped = dslStore;
      let recipes = recipeStore;

      if (lobFilter) {
        grouped = Object.fromEntries(
          Object.entries(dslStore).filter(([, v]) => v.lob === lobFilter)
        );
        recipes = Object.fromEntries(
          Object.entries(recipeStore)
            .map(([k, v]) => [k, v.filter(r => r.lob === lobFilter)])
            .filter(([, v]) => (v as TdmRecipeConfig[]).length > 0)
        );
      }

      return {
        statusCode: 200,
        body: {
          success: true,
          data: {
            grouped,
            recipes,
            lobConfig: lobConfigStore,
          },
        },
      };
    }

    if (method === 'PUT') {
      const payload = body as Record<string, unknown> | null;
      if (!payload || typeof payload !== 'object') {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message:
                'Request body must be an object with grouped and recipes',
            },
          },
        };
      }

      if (payload.grouped !== undefined) {
        dslStore = structuredClone(payload.grouped) as GroupedDsls;
      }
      if (payload.recipes !== undefined) {
        recipeStore = structuredClone(payload.recipes) as GroupedRecipes;
      }

      return {
        statusCode: 200,
        body: {
          success: true,
          data: {
            grouped: dslStore,
            recipes: recipeStore,
          },
        },
      };
    }

    return methodNotAllowed(method, path);
  }

  // PUT /api/dsls/lob-config — replace LOB configurations
  if (path === '/api/dsls/lob-config') {
    if (method === 'PUT') {
      const payload = body as LobConfigurationSections | null;
      if (!payload || typeof payload !== 'object') {
        return {
          statusCode: 400,
          body: {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'Request body must be a LobConfigurationSections object',
            },
          },
        };
      }

      lobConfigStore = structuredClone(payload);

      return {
        statusCode: 200,
        body: {
          success: true,
          data: lobConfigStore,
        },
      };
    }

    return methodNotAllowed(method, path);
  }

  return null;
}
