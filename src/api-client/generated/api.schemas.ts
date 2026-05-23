export interface Airport { iata: string; city: string; name: string; country: string; }
export interface FlightSegment { departureAirport: string; arrivalAirport: string; departureTime: string; arrivalTime: string; airline: string; flightNumber: string; duration: string; }
export interface FlightOffer { id: string; price: number; currency: string; segments: FlightSegment[]; stops: number; totalDuration: string; airline?: string; baggage?: string | null; }
export interface FlightSearchResult { searchId: string; offers: FlightOffer[]; totalCount?: number; }
export type FlightSearchInputFlightClass = "Econom" | "Business" | "First";
export interface FlightSearchInput { origin: string; destination: string; date: string; adults: number; children?: number; infants?: number; flightClass?: FlightSearchInputFlightClass; }
export interface HealthStatus { status: string; timestamp: string; }
export interface ErrorResponse { error: string; }
export interface SearchAirportsParams { q: string; }
