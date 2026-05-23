import { Router } from "express";
import { XMLParser } from "fast-xml-parser";
import * as zod from "zod";

const router = Router();

const SearchFlightsBody = zod.object({
  origin: zod.string(),
  destination: zod.string(),
  date: zod.string(),
  adults: zod.number().min(1),
  children: zod.number().min(0).optional(),
  infants: zod.number().min(0).optional(),
  flightClass: zod.enum(["Econom","Business","First"]).optional(),
});

const SOAP_URL = "https://apisrv.city.travel/SiteCity";
const SOAP_ACTION = "http://tempuri.org/ISiteAvia/AeroSearch";

function buildEnvelope(o: { origin:string; destination:string; date:string; adults:number; children:number; infants:number; flightClass:string; }) {
  return `<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="http://schemas.datacontract.org/2004/07/SiteCity.Common" xmlns:ns2="http://tempuri.org/" xmlns:ns3="http://schemas.datacontract.org/2004/07/SiteCity.Avia.Search"><SOAP-ENV:Body><ns2:AeroSearch><ns2:credentials><ns1:ApiLogin>mobile</ns1:ApiLogin><ns1:ApiPassword>qwegerf4vr3</ns1:ApiPassword><ns1:Currency>CNY</ns1:Currency><ns1:DeviceId>BE210D6C-9076-4C6C-BFB7-AE56E4F1E6E6</ns1:DeviceId><ns1:Language>EN</ns1:Language></ns2:credentials><ns2:aeroSearchParams><ns3:Adults>${o.adults}</ns3:Adults><ns3:Childs>${o.children}</ns3:Childs><ns3:FlightClass>${o.flightClass}</ns3:FlightClass><ns3:Infants>${o.infants}</ns3:Infants><ns3:PartnerName></ns3:PartnerName><ns3:SearchFlights><ns3:SearchFlight><ns3:Date>${o.date}</ns3:Date><ns3:IATAFrom>${o.origin}</ns3:IATAFrom><ns3:IATATo>${o.destination}</ns3:IATATo></ns3:SearchFlight></ns3:SearchFlights></ns2:aeroSearchParams></ns2:AeroSearch></SOAP-ENV:Body></SOAP-ENV:Envelope>`;
}

const s = (v: unknown) => v == null ? "" : String(v);
const n = (v: unknown) => { const x = Number(v); return isNaN(x) ? 0 : x; };
const fmt = (m: number) => { if (m<=0) return ""; const h=Math.floor(m/60),min=m%60; return h>0?`${h}h ${min}m`:`${min}m`; };
const t2m = (t: string) => { const p=t.split(":"); return p.length<2?0:+p[0]*60+ +p[1]; };
const arr = (v: unknown) => !v?[]:Array.isArray(v)?v:[v];

router.post("/flights/search", async (req, res) => {
  const parsed = SearchFlightsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { origin, destination, date, adults, children=0, infants=0, flightClass="Econom" } = parsed.data;

  let xmlText: string;
  try {
    const r = await fetch(SOAP_URL, {
      method: "POST",
      headers: { "Content-Type": `application/soap+xml; charset=utf-8; action="${SOAP_ACTION}"`, "User-Agent": "CityTravel/20220505124464 CFNetwork/3826.600.41.2.1 Darwin/24.6.0", Accept: "*/*" },
      body: buildEnvelope({ origin, destination, date, adults, children, infants, flightClass }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) { res.status(502).json({ error: `上游服务返回 ${r.status}` }); return; }
    xmlText = await r.text();
  } catch (err) {
    console.error("SOAP error:", err);
    res.status(502).json({ error: "无法连接航班查询服务，请稍后重试" }); return;
  }

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, isArray: () => false });
  let doc: any;
  try { doc = parser.parse(xmlText); } catch { res.status(502).json({ error: "航班数据解析失败" }); return; }

  const result = doc?.Envelope?.Body?.AeroSearchResponse?.AeroSearchResult ?? {};
  const fdList = arr(result?.FlightData?.FlightData);
  const offers: any[] = [];

  for (const fd of fdList) {
    const offerCode = s(fd?.OfferCode);
    const totalPrice = n(fd?.TotalPrice);
    for (const offerInfo of arr(fd?.Offers?.OfferInfo)) {
      const validatingAirline = s(offerInfo?.ValidatingAirline);
      const segList = arr(offerInfo?.Segments?.OfferSegment);
      if (!segList.length) continue;
      const segs = segList.map((seg: any) => {
        const dm = n(seg?.FlightMinutes) || t2m(s(seg?.FlightTime));
        const bc = n(seg?.Baggage?.Count);
        return {
          departureAirport: s(seg?.Departure?.Iata), arrivalAirport: s(seg?.Arrival?.Iata),
          departureTime: s(seg?.Departure?.Date), arrivalTime: s(seg?.Arrival?.Date),
          airline: s(seg?.MarketingAirline||seg?.OperatingAirline), flightNumber: s(seg?.FlightNum),
          duration: fmt(dm), _dm: dm, _bag: bc>0?`${bc} ${s(seg?.Baggage?.BaggageType)}`:null,
        };
      });
      const totalDm = segs.reduce((a:number,x:any)=>a+x._dm,0);
      offers.push({
        id: offerCode||`offer-${offers.length}`, price: totalPrice, currency: "CNY",
        segments: segs.map(({_dm:_,_bag:__,...x}:any)=>x),
        stops: Math.max(0,segs.length-1), totalDuration: fmt(totalDm),
        airline: validatingAirline||segs[0]?.airline||"", baggage: segs[0]?._bag??null,
      });
    }
  }
  offers.sort((a,b)=>a.price-b.price);
  res.json({ searchId: `search-${Date.now()}`, offers, totalCount: offers.length });
});

export default router;
