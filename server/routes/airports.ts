import { Router } from "express";
const router = Router();

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
  { iata: "SYX", city: "三亚", name: "凤凰国际机场", country: "中国" },
  { iata: "HKG", city: "香港", name: "国际机场", country: "中国香港" },
  { iata: "MFM", city: "澳门", name: "国际机场", country: "中国澳门" },
  { iata: "TPE", city: "台北", name: "桃园国际机场", country: "中国台湾" },
  { iata: "NRT", city: "东京", name: "成田国际机场", country: "日本" },
  { iata: "HND", city: "东京", name: "羽田机场", country: "日本" },
  { iata: "KIX", city: "大阪", name: "关西国际机场", country: "日本" },
  { iata: "ICN", city: "首尔", name: "仁川国际机场", country: "韩国" },
  { iata: "SIN", city: "新加坡", name: "樟宜机场", country: "新加坡" },
  { iata: "BKK", city: "曼谷", name: "素万那普机场", country: "泰国" },
  { iata: "KUL", city: "吉隆坡", name: "国际机场", country: "马来西亚" },
  { iata: "DXB", city: "迪拜", name: "国际机场", country: "阿联酋" },
  { iata: "LHR", city: "伦敦", name: "希思罗机场", country: "英国" },
  { iata: "CDG", city: "巴黎", name: "戴高乐机场", country: "法国" },
  { iata: "JFK", city: "纽约", name: "肯尼迪机场", country: "美国" },
  { iata: "LAX", city: "洛杉矶", name: "洛杉矶国际机场", country: "美国" },
  { iata: "SYD", city: "悉尼", name: "金斯福德-史密斯机场", country: "澳大利亚" },
];

const POPULAR = ["PEK","SHA","CAN","SZX","CTU","CKG","WUH","XIY","KMG","HGH","NKG","XMN","TSN","SHE","HRB","TAO"];

router.get("/airports/popular", (_req, res) => {
  res.json(POPULAR.map(iata => AIRPORTS.find(a => a.iata === iata)).filter(Boolean));
});

router.get("/airports/search", (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) { res.json([]); return; }
  const up = q.toUpperCase(), lo = q.toLowerCase();
  res.json(AIRPORTS.filter(a =>
    a.iata.includes(up) || a.city.includes(q) || a.city.toLowerCase().includes(lo) || a.name.includes(q)
  ).slice(0, 10));
});

export default router;
