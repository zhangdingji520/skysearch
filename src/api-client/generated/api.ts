import { customFetch } from "../custom-fetch";
import type { Airport, FlightSearchInput, FlightSearchResult, HealthStatus } from "./api.schemas";

export async function getHealth(): Promise<HealthStatus> {
  return customFetch("/api/healthz");
}
export async function getPopularAirports(): Promise<Airport[]> {
  return customFetch("/api/airports/popular");
}
export async function searchAirports(q: string): Promise<Airport[]> {
  return customFetch(`/api/airports/search?q=${encodeURIComponent(q)}`);
}
export async function searchFlights(body: FlightSearchInput): Promise<FlightSearchResult> {
  return customFetch("/api/flights/search", { method: "POST", body: JSON.stringify(body) });
}
