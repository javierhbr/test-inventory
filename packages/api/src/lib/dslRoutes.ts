import { mockSemanticRules, mockTdmRecipes } from '../data/mockDsls';
import { GroupedDsls } from '../types/domain';

interface DslRouteResult {
  statusCode: number;
  body: {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
    };
  };
}

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function handleDslHttpRoute(
  method: string,
  rawPath: string
): DslRouteResult | null {
  const path = normalizePath(rawPath);

  if (path === '/api/dsls') {
    if (method === 'GET') {
      const grouped: GroupedDsls = {};

      // Group Semantic Rules
      mockSemanticRules.forEach(rule => {
        const prefix =
          rule.category === 'Flavor' ? 'TestDataFlavors' : 'TestDataRecon';
        const key = `${prefix}${rule.lob}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(rule);
      });

      // Group TDM Recipes
      mockTdmRecipes.forEach(recipe => {
        const key = `TDMRecipes${recipe.lob}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(recipe);
      });

      return {
        statusCode: 200,
        body: {
          success: true,
          data: {
            semanticRules: mockSemanticRules,
            recipes: mockTdmRecipes,
            grouped,
          },
        },
      };
    }

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

  return null;
}
