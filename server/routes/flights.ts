import { Router, type IRouter } from "express";
import { XMLParser } from "fast-xml-parser";
import * as zod from "zod";

const router: IRouter = Router();

const SearchFlightsBody = zod.object({
  origin: zod.string(),
  destination: zod.string(),
  date: zod.string(),
  adults: zod.number().min(1),
  children: zod.number().min(0).optional(),
  infants: zod.number().min(0).optional(),
  flightClass: zod.enum(["Econom", "Business", "First"]).optional(),
});

const SOAP_URL = "https://apisrv.city.travel/SiteCity";
const SOAP_ACTION = "http://tempuri.org/ISiteAvia/AeroSearch";
const API_LOGIN = "mobile";
const API_PASSWORD = "qwegerf4vr3";
const USER_AGENT = "CityTravel/20220505124464 CFNetwork/3826.600.41.2.1 Darwin/24.6.0";

function buildSoapEnvelope(input: {
  origin: string; destination: string; date: string;
  adults: number; children: number; infants: number; flightClass: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="http://schemas.datacontract.org/2004/07/SiteCity.Common" xmlns:ns2="http://tempuri.org/" xmlns:ns3="http://schemas.datacontract.org/2004/07/SiteCity.Avia.Search"><SOAP-ENV:Body><ns2:AeroSearch><ns2:credentials><ns1:ApiLogin>${API_LOGIN}</ns1:ApiLogin><ns1:ApiPassword>${API_PASSWORD}</ns1:ApiPassword><ns1:Currency>CNY</ns1:Currency><ns1:DeviceId>BE210D6C-9076-4C6C-BFB7-AE56E4F1E6E6</ns1:DeviceId><ns1:Language>EN</ns1:Language></ns2:credentials><ns2:aeroSearchParams><ns3:Adults>${input.adults}</ns3:Adults><ns3:Childs>${input.children}</ns3:Childs><ns3:FlightClass>${input.flightClass}</ns3:FlightClass><ns3:Infants>${input.infants}</ns3:Infants><ns3:PartnerName></ns3:PartnerName><ns3:SearchFlights><ns3:SearchFlight><ns3:Date>${input.date}</ns3:Date><ns3:IATAFrom>${input.origin}</ns3:IATAFrom><ns3:IATATo>${input.destination}</ns3:IATATo></ns3:SearchFlight></ns3:SearchFlights></ns2:aeroSearchParams></ns2:AeroSearch></SOAP-ENV:Body></SOAP-ENV:Envelope>`;
}

function safeStr(val: unknown): string { return val === undefined || val === null ? "" : String(val); }
function safeNum(val: unknown): number { const n = Number(val); return isNaN(n) ? 0 : n; }
function fmtMinutes(mins: number): string {
  if (mins <= 0) return "";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function timeStrToMinutes(t: string): number {
  const p = t.split(":"); if (p.length < 2) return 0;
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArray(v: unknown): any[] { if (!v) return []; return Array.isArray(v) ? v : [v]; }

router.post("/flights/search", async (req, res): Promise<void> => {
  const parsed = SearchFlightsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { origin, destination, date, adults, children = 0, infants = 0, flightClass = "Econom" } = parsed.data;

  const soapBody = buildSoapEnvelope({ origin, destination, date, adults, children, infants, flightClass });

  let xmlText: string;
  try {
    const response = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": `application/soap+xml; charset=utf-8; action="${SOAP_ACTION}"`,
        "User-Agent": USER_AGENT, Accept: "*/*",
      },
      body: soapBody,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) { res.status(502).json({ error: `Upstream returned ${response.status}` }); return; }
    xmlText = await response.text();
  } catch (err) {
    console.error("SOAP request failed", err);
    res.status(502).json({ error: "无法连接航班查询服务" }); return;
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", removeNSPrefix: true, isArray: () => false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let doc: any;
  try { doc = parser.parse(xmlText); } catch { res.status(502).json({ error: "航班数据解析失败" }); return; }

  const result = doc?.Envelope?.Body?.AeroSearchResponse?.AeroSearchResult ?? {};
  const fdList = toArray(result?.FlightData?.FlightData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offers: any[] = [];

  for (const fd of fdList) {
    const offerCode = safeStr(fd?.OfferCode);
    const totalPrice = safeNum(fd?.TotalPrice);
    for (const offerInfo of toArray(fd?.Offers?.OfferInfo)) {
      const validatingAirline = safeStr(offerInfo?.ValidatingAirline);
      const segmentList = toArray(offerInfo?.Segments?.OfferSegment);
      if (!segmentList.length) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const segments = segmentList.map((seg: any) => {
        const flightMins = safeNum(seg?.FlightMinutes);
        const durationMins = flightMins > 0 ? flightMins : timeStrToMinutes(safeStr(seg?.FlightTime));
        const baggageCount = safeNum(seg?.Baggage?.Count);
        const baggageType = safeStr(seg?.Baggage?.BaggageType);
        return {
          departureAirport: safeStr(seg?.Departure?.Iata), arrivalAirport: safeStr(seg?.Arrival?.Iata),
          departureTime: safeStr(seg?.Departure?.Date), arrivalTime: safeStr(seg?.Arrival?.Date),
          airline: safeStr(seg?.MarketingAirline || seg?.OperatingAirline),
          flightNumber: safeStr(seg?.FlightNum), duration: fmtMinutes(durationMins),
          _dm: durationMins, _bag: baggageCount > 0 ? `${baggageCount} ${baggageType}` : null,
        };
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalDurationMins = segments.reduce((s: number, x: any) => s + x._dm, 0);
      offers.push({
        id: offerCode || `offer-${offers.length}`, price: totalPrice, currency: "CNY",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        segments: segments.map(({ _dm: _, _bag: __, ...s }: any) => s),
        stops: Math.max(0, segments.length - 1), totalDuration: fmtMinutes(totalDurationMins),
        airline: validatingAirline || segments[0]?.airline || "", baggage: segments[0]?._bag ?? null,
      });
    }
  }

  offers.sort((a, b) => a.price - b.price);
  res.json({ searchId: `search-${Date.now()}`, offers, totalCount: offers.length });
});

export default router;
