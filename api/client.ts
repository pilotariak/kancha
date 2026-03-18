import { logger } from "@/utils/logger";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class GqlError extends Error {
  constructor(public readonly errors: Array<{ message: string }>) {
    super(errors.map((e) => e.message).join("; "));
    this.name = "GqlError";
  }
}

interface GqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlRequest<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    logger.error("Configuration Error: EXPO_PUBLIC_API_URL is missing");
    throw new ApiError("EXPO_PUBLIC_API_URL is not configured", 0, "CONFIG_ERROR");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  const operationName = query.match(/(query|mutation)\s+(\w+)/)?.[2] || "anonymous";
  logger.startPerformanceMark(`graphql-${operationName}`);

  try {
    const league = process.env.EXPO_PUBLIC_LEAGUE ?? "lcapb";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Pilotariak-League": league,
    };

    const endpoint = `${baseUrl}/graphql`;
    logger.debug(`Starting GraphQL ${operationName}`, {
      endpoint,
      query,
      variables,
      league,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      logger.warn(`GraphQL ${operationName} HTTP Failure`, { status: response.status, body });
      throw new ApiError(
        body.message ?? `HTTP ${response.status}`,
        response.status,
        body.code,
      );
    }

    const json = (await response.json()) as GqlResponse<TData>;

    if (json.errors?.length) {
      logger.error(`GraphQL ${operationName} Logic Errors`, json.errors);
      throw new GqlError(json.errors);
    }

    if (!json.data) {
      logger.error(`GraphQL ${operationName} No Data`, { json });
      throw new ApiError("No data returned from GraphQL", 0, "NO_DATA");
    }

    logger.info(`GraphQL ${operationName} Success`);
    return json.data;
  } catch (error) {
    if (error instanceof ApiError || error instanceof GqlError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      logger.error(`GraphQL ${operationName} Timeout`);
      throw new ApiError("Request timed out", 0, "TIMEOUT");
    }
    logger.error(`GraphQL ${operationName} Network/System Error`, error);
    throw new ApiError(`Network error (${baseUrl}/graphql)`, 0, "NETWORK_ERROR");
  } finally {
    clearTimeout(timeoutId);
    logger.endPerformanceMark(`graphql-${operationName}`);
  }
}
