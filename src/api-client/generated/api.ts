import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction, QueryFunction, QueryKey,
  UseMutationOptions, UseMutationResult,
  UseQueryOptions, UseQueryResult,
} from "@tanstack/react-query";
import type {
  Airport, ErrorResponse, FlightSearchInput, FlightSearchResult,
  HealthStatus, SearchAirportsParams,
} from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealthCheckUrl = () => `/api/healthz`;
export const healthCheck = (options?: RequestInit): Promise<HealthStatus> =>
  customFetch<HealthStatus>(getHealthCheckUrl(), { ...options, method: "GET" });
export const getHealthCheckQueryKey = () => [`/api/healthz`] as const;
export const getHealthCheckQueryOptions = <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>; request?: SecondParameter<typeof customFetch>; }) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({ signal }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & { queryKey: QueryKey };
};
export function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>; request?: SecondParameter<typeof customFetch>; }): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ── Search Flights ────────────────────────────────────────────────────────────
export const getSearchFlightsUrl = () => `/api/flights/search`;
export const searchFlights = (flightSearchInput: FlightSearchInput, options?: RequestInit): Promise<FlightSearchResult> =>
  customFetch<FlightSearchResult>(getSearchFlightsUrl(), { ...options, method: "POST", headers: { "Content-Type": "application/json", ...options?.headers }, body: JSON.stringify(flightSearchInput) });

export const getSearchFlightsMutationOptions = <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof searchFlights>>, TError, { data: BodyType<FlightSearchInput> }, TContext>; request?: SecondParameter<typeof customFetch>; }): UseMutationOptions<Awaited<ReturnType<typeof searchFlights>>, TError, { data: BodyType<FlightSearchInput> }, TContext> => {
  const mutationKey = ["searchFlights"];
  const { mutation: mutationOptions, request: requestOptions } = options ? (options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } }) : { mutation: { mutationKey }, request: undefined };
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof searchFlights>>, { data: BodyType<FlightSearchInput> }> = (props) => { const { data } = props ?? {}; return searchFlights(data, requestOptions); };
  return { mutationFn, ...mutationOptions };
};
export type SearchFlightsMutationResult = NonNullable<Awaited<ReturnType<typeof searchFlights>>>;
export type SearchFlightsMutationBody = BodyType<FlightSearchInput>;
export type SearchFlightsMutationError = ErrorType<ErrorResponse>;
export const useSearchFlights = <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof searchFlights>>, TError, { data: BodyType<FlightSearchInput> }, TContext>; request?: SecondParameter<typeof customFetch>; }): UseMutationResult<Awaited<ReturnType<typeof searchFlights>>, TError, { data: BodyType<FlightSearchInput> }, TContext> =>
  useMutation(getSearchFlightsMutationOptions(options));

// ── Popular Airports ──────────────────────────────────────────────────────────
export const getGetPopularAirportsUrl = () => `/api/airports/popular`;
export const getPopularAirports = (options?: RequestInit): Promise<Airport[]> =>
  customFetch<Airport[]>(getGetPopularAirportsUrl(), { ...options, method: "GET" });
export const getGetPopularAirportsQueryKey = () => [`/api/airports/popular`] as const;
export const getGetPopularAirportsQueryOptions = <TData = Awaited<ReturnType<typeof getPopularAirports>>, TError = ErrorType<unknown>>(options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getPopularAirports>>, TError, TData>; request?: SecondParameter<typeof customFetch>; }) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetPopularAirportsQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getPopularAirports>>> = ({ signal }) => getPopularAirports({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getPopularAirports>>, TError, TData> & { queryKey: QueryKey };
};
export function useGetPopularAirports<TData = Awaited<ReturnType<typeof getPopularAirports>>, TError = ErrorType<unknown>>(options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getPopularAirports>>, TError, TData>; request?: SecondParameter<typeof customFetch>; }): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetPopularAirportsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ── Search Airports ───────────────────────────────────────────────────────────
export const getSearchAirportsUrl = (params: SearchAirportsParams) => {
  const p = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined) p.append(k, v === null ? "null" : v.toString()); });
  const s = p.toString();
  return s.length > 0 ? `/api/airports/search?${s}` : `/api/airports/search`;
};
export const searchAirports = (params: SearchAirportsParams, options?: RequestInit): Promise<Airport[]> =>
  customFetch<Airport[]>(getSearchAirportsUrl(params), { ...options, method: "GET" });
export const getSearchAirportsQueryKey = (params?: SearchAirportsParams) => [`/api/airports/search`, ...(params ? [params] : [])] as const;
export const getSearchAirportsQueryOptions = <TData = Awaited<ReturnType<typeof searchAirports>>, TError = ErrorType<unknown>>(params: SearchAirportsParams, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof searchAirports>>, TError, TData>; request?: SecondParameter<typeof customFetch>; }) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getSearchAirportsQueryKey(params);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof searchAirports>>> = ({ signal }) => searchAirports(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof searchAirports>>, TError, TData> & { queryKey: QueryKey };
};
export function useSearchAirports<TData = Awaited<ReturnType<typeof searchAirports>>, TError = ErrorType<unknown>>(params: SearchAirportsParams, options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof searchAirports>>, TError, TData>; request?: SecondParameter<typeof customFetch>; }): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getSearchAirportsQueryOptions(params, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}
