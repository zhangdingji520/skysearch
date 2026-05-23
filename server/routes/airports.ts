import { Router, type IRouter } from "express";
import * as zod from "zod";

const router: IRouter = Router();

const AirportSchema = zod.object({
  iata: zod.string(),
  city: zod.string(),
  name: zod.string(),
  country: zod.string(),
});

const GetPopularAirportsResponse = zod.array(AirportSchema);
const SearchAirportsQueryParams = zod.object({ q: zod.coerce.string() });
const SearchAirportsResponse = zod.array(AirportSchema);

const AIRPORTS = [
  { iata: "PEK", city: "北京", name: "首都国际机场", country: "中国" },
  { iata: "PKX", city: "北京", name: "大兴国际机场", country: "中国" },
  { iata: "PVG", city: "上海", name: "浦东国际机场", country: "中国" },
  { iata: "SHA", city: "上海", name: "虹桥国际机场", country: "中国" },
  { iata: "CAN", city: "广州", name: "白云国际机场", country: "中国" },
  { iata: "SZX", city: "深圳", name: "宝安国际机场", country: "中国" },
  { iata: "CTU", city: "成都", name: "双流国际机场", country: "中国" },
  { iata: "TFU", city: "成都", name: "天府国际机场", country: "中国" },
  { iata: "CKG", city: "重庆", name: "江北国际机场", country: "中国" },
  { iata: "WUH", city: "武汉", name: "天河国际机场", country: "中国" },
  { iata: "XIY", city: "西安", name: "咸阳国际机场", country: "中国" },
  { iata: "KMG", city: "昆明", name: "长水国际机场", country: "中国" },
  { iata: "HGH", city: "杭州", name: "萧山国际机场", country: "中国" },
  { iata: "NKG", city: "南京", name: "禄口国际机场", country: "中国" },
  { iata: "XMN", city: "厦门", name: "高崎国际机场", country: "中国" },
  { iata: "TSN", city: "天津", name: "滨海国际机场", country: "中国" },
  { iata: "SHE", city: "沈阳", name: "桃仙国际机场", country: "中国" },
  { iata: "HRB", city: "哈尔滨", name: "太平国际机场", country: "中国" },
  { iata: "TAO", city: "青岛", name: "胶东国际机场", country: "中国" },
  { iata: "NNG", city: "南宁", name: "吴圩国际机场", country: "中国" },
  { iata: "URC", city: "乌鲁木齐", name: "地窝堡国际机场", country: "中国" },
  { iata: "LHW", city: "兰州", name: "中川国际机场", country: "中国" },
  { iata: "SYX", city: "三亚", name: "凤凰国际机场", country: "中国" },
  { iata: "HKG", city: "香港", name: "国际机场", country: "中国香港" },
  { iata: "MFM", city: "澳门", name: "国际机场", country: "中国澳门" },
  { iata: "TPE", city: "台北", name: "桃园国际机场", country: "中国台湾" },
  { iata: "NRT", city: "东京", name: "成田国际机场", country: "日本" },
  { iata: "HND", city: "东京", name: "羽田机场", country: "日本" },
  { iata: "KIX", city: "大阪", name: "关西国际机场", country: "日本" },
  { iata: "ICN", city: "首尔", name: "仁川国际机场", country: "韩国" },
  { iata: "GMP", city: "首尔", name: "金浦机场", country: "韩国" },
  { iata: "SIN", city: "新加坡", name: "樟宜机场", country: "新加坡" },
  { iata: "BKK", city: "曼谷", name: "素万那普机场", country: "泰国" },
  { iata: "DMK", city: "曼谷", name: "廊曼机场", country: "泰国" },
  { iata: "KUL", city: "吉隆坡", name: "国际机场", country: "马来西亚" },
  { iata: "DXB", city: "迪拜", name: "国际机场", country: "阿联酋" },
  { iata: "AUH", city: "阿布扎比", name: "国际机场", country: "阿联酋" },
  { iata: "LHR", city: "伦敦", name: "希思罗机场", country: "英国" },
  { iata: "LGW", city: "伦敦", name: "盖特威克机场", country: "英国" },
  { iata: "CDG", city: "巴黎", name: "戴高乐机场", country: "法国" },
  { iata: "FRA", city: "法兰克福", name: "法兰克福机场", country: "德国" },
  { iata: "AMS", city: "阿姆斯特丹", name: "史基浦机场", country: "荷兰" },
  { iata: "JFK", city: "纽约", name: "肯尼迪机场", country: "美国" },
  { iata: "LAX", city: "洛杉矶", name: "洛杉矶国际机场", country: "美国" },
  { iata: "SFO", city: "旧金山", name: "旧金山国际机场", country: "美国" },
  { iata: "ORD", city: "芝加哥", name: "奥黑尔国际机场", country: "美国" },
  { iata: "SYD", city: "悉尼", name: "金斯福德-史密斯机场", country: "澳大利亚" },
  { iata: "MEL", city: "墨尔本", name: "图拉马林机场", country: "澳大利亚" },
  { iata: "YYZ", city: "多伦多", name: "皮尔逊国际机场", country: "加拿大" },
  { iata: "MNL", city: "马尼拉", name: "尼诺伊·阿基诺国际机场", country: "菲律宾" },
  { iata: "CGK", city: "雅加达", name: "苏加诺-哈达国际机场", country: "印度尼西亚" },
  { iata: "BJS", city: "北京", name: "北京(全城)", country: "中国" },
];

const POPULAR_IATA = [
  "PEK", "PKX", "PVG", "SHA", "CAN", "SZX", "CTU", "CKG",
  "WUH", "XIY", "HKG", "NRT", "ICN", "SIN", "DXB", "BKK",
];

router.get("/airports/popular", (_req, res): void => {
  const popular = POPULAR_IATA.map((iata) =>
    AIRPORTS.find((a) => a.iata === iata),
  ).filter(Boolean);

  const result = GetPopularAirportsResponse.parse(popular);
  res.json(result);
});

router.get("/airports/search", (req, res): void => {
  const params = SearchAirportsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const q = params.data.q.trim().toUpperCase();
  const qLower = q.toLowerCase();

  const matches = AIRPORTS.filter(
    (a) =>
      a.iata.toUpperCase().includes(q) ||
      a.city.toLowerCase().includes(qLower) ||
      a.name.toLowerCase().includes(qLower) ||
      a.country.toLowerCase().includes(qLower),
  ).slice(0, 10);

  const result = SearchAirportsResponse.parse(matches);
  res.json(result);
});

export default router;
