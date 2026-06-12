// ============================================================
//  data.js — دیتابیس سایت تورهای عراق
//  آخرین بروزرسانی: تیرماه ۱۴۰۴
//  برای بروزرسانی قیمت‌ها فقط همین فایل رو ویرایش کن
// ============================================================

// ─────────────────────────────────────────────
//  ۱. قوانین تاریخی (محدودیت‌ها و افزایش نرخ)
// ─────────────────────────────────────────────
const DATE_RULES = [
  {
    id: "tasua_ashura",
    type: "price_increase",         // افزایش نرخ
    startDate: "1404-04-01",        // ۱ تیر ۱۴۰۴
    endDate:   "1404-04-07",        // ۷ تیر ۱۴۰۴
    increasePercent: 5,             // ۵ درصد افزایش
    affectedItems: ["hotel_najaf", "hotel_karbala"],
    message: "به دلیل تاسوعا و عاشورای حسینی، قیمت هتل‌های نجف و کربلا در این بازه ۵٪ افزایش دارد."
  },
  {
    id: "arbaeen",
    type: "no_travel",             // ممنوعیت اعزام
    startDate: "1404-04-10",       // ۱۰ تیر ۱۴۰۴
    endDate:   "1404-04-16",       // ۱۶ تیر ۱۴۰۴
    affectedItems: ["all"],
    message: "به دلیل اربعین حسینی، امکان انتخاب تاریخ اعزام در این بازه وجود ندارد."
  }
];

// ─────────────────────────────────────────────
//  ۲. نوع سفر و شهرهای مجاز
// ─────────────────────────────────────────────
const TRAVEL_TYPES = {
  air_air: {
    label: "هوایی - هوایی (رفت و برگشت هوایی)",
    allowedCities: ["tehran", "mashhad", "isfahan"]
  },
  air_land: {
    label: "هوایی - زمینی (رفت هوایی، برگشت زمینی)",
    allowedCities: ["tehran", "mashhad", "isfahan"]
  },
  land_land: {
    label: "زمینی - زمینی (رفت و برگشت زمینی)",
    allowedCities: "all"           // همه شهرها
  }
};

// ─────────────────────────────────────────────
//  ۳. قیمت‌های ترانسفر از ایران (تومان)
//     پایه = قیمت برای ۱ نفر
//     برای ۲، ۳، ۴ نفر تقسیم بر تعداد نفر می‌شود
// ─────────────────────────────────────────────
const IRAN_TRANSFER = {

  // ── تهران ──────────────────────────────────
  tehran: {
    label: "تهران",
    air_air:  { price: 21_000_000, note: "بلیط هواپیما رفت‌وبرگشت تهران ↔ نجف" },
    air_land: {
      go:     { price: 11_000_000, note: "بلیط هواپیما رفت تهران → نجف" },
      back:   { price:  6_000_000, note: "خودرو برگشت مرز → تهران (تقسیم بر نفر)" },
      total:  { price: 17_000_000, note: "جمع رفت هوایی + برگشت زمینی" }
    },
    land_land: { price: 12_000_000, note: "خودرو رفت‌وبرگشت تهران ↔ مرز (تقسیم بر نفر)" },
    divideByPassengers: true
  },

  // ── مشهد ──────────────────────────────────
  mashhad: {
    label: "مشهد",
    air_air:  { price: 28_000_000, note: "بلیط هواپیما رفت‌وبرگشت مشهد ↔ نجف" },
    air_land: {
      go:     { price: 14_000_000, note: "بلیط هواپیما رفت مشهد → نجف (نیمی از ۲۸ میلیون)" },
      back:   { price:  9_000_000, note: "خودرو برگشت مرز → مشهد (تقسیم بر نفر)" },
      total:  { price: 23_000_000, note: "جمع رفت هوایی + برگشت زمینی" }
    },
    land_land: { price: 18_000_000, note: "خودرو رفت‌وبرگشت مشهد ↔ مرز (تقسیم بر نفر)" },
    divideByPassengers: true
  },

  // ── اصفهان ─────────────────────────────────
  isfahan: {
    label: "اصفهان",
    air_air:  { price: 34_000_000, note: "بلیط هواپیما رفت‌وبرگشت اصفهان ↔ نجف" },
    air_land: {
      go:     { price: 17_000_000, note: "بلیط هواپیما رفت اصفهان → نجف (نیمی از ۳۴ میلیون)" },
      back:   { price:  5_000_000, note: "خودرو برگشت مرز → اصفهان (تقسیم بر نفر)" },
      total:  { price: 22_000_000, note: "جمع رفت هوایی + برگشت زمینی" }
    },
    land_land: { price: 10_000_000, note: "خودرو رفت‌وبرگشت اصفهان ↔ مرز (تقسیم بر نفر)" },
    divideByPassengers: true
  },

  // ── سایر شهرها (فقط زمینی) ─────────────────
  tabriz: {
    label: "تبریز",
    land_land: { price: 12_000_000 },
    divideByPassengers: true,
    onlyLand: true
  },
  ardabil: {
    label: "اردبیل",
    land_land: { price: 13_000_000 },
    divideByPassengers: true,
    onlyLand: true
  },
  karaj: {
    label: "کرج",
    land_land: { price: 12_000_000 },
    divideByPassengers: true,
    onlyLand: true
  },
  shiraz: {
    label: "شیراز",
    land_land: { price: 12_000_000 },
    divideByPassengers: true,
    onlyLand: true
  },
  qom: {
    label: "قم",
    land_land: { price: 12_000_000 },
    divideByPassengers: true,
    onlyLand: true
  },
  kashan: {
    label: "کاشان",
    land_land: { price: 13_000_000 },
    divideByPassengers: true,
    onlyLand: true
  },

  // ── پیش‌فرض سایر شهرها ─────────────────────
  default: {
    label: "سایر شهرها",
    land_land: { price: 12_000_000, note: "قیمت پیش‌فرض برای شهرهایی که در لیست نیستند" },
    divideByPassengers: true,
    onlyLand: true
  }
};

// ─────────────────────────────────────────────
//  ۴. توابع کمکی
// ─────────────────────────────────────────────

/**
 * بررسی می‌کند تاریخ شمسی داده‌شده در یک رنج خاص هست یا نه
 * @param {string} date - تاریخ به فرمت "1404-04-05"
 * @param {string} start - تاریخ شروع
 * @param {string} end - تاریخ پایان
 */
function isDateInRange(date, start, end) {
  return date >= start && date <= end;
}

/**
 * بررسی قوانین تاریخی برای یک تاریخ اعزام
 * @param {string} departureDate - تاریخ شمسی به فرمت "1404-04-05"
 * @returns {{ valid: boolean, warnings: string[], increases: object[] }}
 */
function checkDateRules(departureDate) {
  const result = { valid: true, warnings: [], increases: [] };

  for (const rule of DATE_RULES) {
    if (isDateInRange(departureDate, rule.startDate, rule.endDate)) {
      if (rule.type === "no_travel") {
        result.valid = false;
        result.warnings.push(rule.message);
      } else if (rule.type === "price_increase") {
        result.increases.push({
          percent: rule.increasePercent,
          items: rule.affectedItems,
          message: rule.message
        });
        result.warnings.push(rule.message);
      }
    }
  }

  return result;
}

/**
 * محاسبه هزینه ترانسفر از ایران برای هر نفر
 * @param {string} cityKey - کلید شهر (مثلاً "tehran")
 * @param {string} travelType - نوع سفر: "air_air" | "air_land" | "land_land"
 * @param {number} passengers - تعداد مسافر (۱ تا ۴)
 * @returns {{ pricePerPerson: number, totalPrice: number, note: string, error: string|null }}
 */
function calcIranTransfer(cityKey, travelType, passengers) {
  const city = IRAN_TRANSFER[cityKey] || IRAN_TRANSFER["default"];

  // بررسی اینکه این شهر این نوع سفر رو داره یا نه
  if (city.onlyLand && travelType !== "land_land") {
    return {
      pricePerPerson: 0,
      totalPrice: 0,
      note: "",
      error: `شهر ${city.label} فقط سفر زمینی دارد. لطفاً نوع سفر را زمینی انتخاب کنید.`
    };
  }

  let basePrice = 0;
  let note = "";

  if (travelType === "air_air") {
    basePrice = city.air_air.price;
    note = city.air_air.note || "";
  } else if (travelType === "air_land") {
    basePrice = city.air_land.total.price;
    note = city.air_land.total.note || "";
  } else if (travelType === "land_land") {
    basePrice = city.land_land.price;
    note = city.land_land.note || "";
  }

  const count = Math.min(Math.max(passengers, 1), 4);
  const divided = city.divideByPassengers ? basePrice / count : basePrice;

  return {
    pricePerPerson: Math.round(divided),
    totalPrice: basePrice,
    note,
    error: null
  };
}

// ─────────────────────────────────────────────
//  ۵. ترانسفر داخل عراق
//     قیمت‌ها برای یک خودروی ۴ نفره است
//     تقسیم بر تعداد مسافر می‌شود (۱ تا ۴ نفر)
// ─────────────────────────────────────────────

/**
 * ترکیب شهرها و قیمت خودرو داخل عراق
 * کلید = مجموعه شهرهای انتخابی (مرتب‌شده)
 * قیمت = برای کل خودرو (۴ نفر)
 */
const IRAQ_TRANSFER_RULES = [
  {
    id: "najaf_karbala_kazimain",
    cities: ["najaf", "karbala", "kazimain"],   // هر سه شهر
    pricePerCar: 15_000_000,
    note: "نجف + کربلا + کاظمین — هر خودرو ۱۵ میلیون تومان"
  },
  {
    id: "najaf_or_karbala_plus_kazimain_samarra",
    cities: ["najaf", "kazimain"],              // نجف + کاظمین (±سامرا)
    pricePerCar: 12_000_000,
    note: "نجف + کاظمین/سامرا — هر خودرو ۱۲ میلیون تومان"
  },
  {
    id: "karbala_plus_kazimain_samarra",
    cities: ["karbala", "kazimain"],            // کربلا + کاظمین (±سامرا)
    pricePerCar: 12_000_000,
    note: "کربلا + کاظمین/سامرا — هر خودرو ۱۲ میلیون تومان"
  },
  {
    id: "najaf_karbala",
    cities: ["najaf", "karbala"],               // نجف + کربلا
    pricePerCar: 7_000_000,
    note: "نجف + کربلا — هر خودرو ۷ میلیون تومان"
  },
  {
    id: "only_najaf",
    cities: ["najaf"],                          // فقط نجف
    pricePerCar: 5_000_000,
    note: "فقط نجف — هر خودرو ۵ میلیون تومان"
  },
  {
    id: "only_karbala",
    cities: ["karbala"],                        // فقط کربلا
    pricePerCar: 5_000_000,
    note: "فقط کربلا — هر خودرو ۵ میلیون تومان"
  }
];

/**
 * محاسبه هزینه ترانسفر داخل عراق
 * @param {string[]} selectedCities - شهرهای انتخابی ["najaf", "karbala", ...]
 * @param {number} passengers - تعداد مسافر (۱ تا ۴)
 * @returns {{ pricePerPerson: number, pricePerCar: number, note: string, error: string|null }}
 */
function calcIraqTransfer(selectedCities, passengers) {
  if (!selectedCities || selectedCities.length === 0) {
    return { pricePerPerson: 0, pricePerCar: 0, note: "", error: "هیچ شهری انتخاب نشده." };
  }

  const count = Math.min(Math.max(Math.round(passengers), 1), 4);

  // سامرا روی قیمت تأثیر مستقل نداره — فقط نقش «فعال‌کردن» رنج کاظمین رو داره
  const hasSamarra  = selectedCities.includes("samarra");
  const hasKazimain = selectedCities.includes("kazimain");
  const hasNajaf    = selectedCities.includes("najaf");
  const hasKarbala  = selectedCities.includes("karbala");

  // تبدیل سامرا به کاظمین برای منطق قیمت‌گذاری
  const effectiveCities = new Set(selectedCities);
  if (hasSamarra) effectiveCities.add("kazimain"); // سامرا = کاظمین از نظر قیمت

  let matched = null;

  // بررسی از پیچیده به ساده
  if (effectiveCities.has("najaf") && effectiveCities.has("karbala") && effectiveCities.has("kazimain")) {
    matched = IRAQ_TRANSFER_RULES.find(r => r.id === "najaf_karbala_kazimain");
  } else if (effectiveCities.has("najaf") && effectiveCities.has("kazimain")) {
    matched = IRAQ_TRANSFER_RULES.find(r => r.id === "najaf_or_karbala_plus_kazimain_samarra");
  } else if (effectiveCities.has("karbala") && effectiveCities.has("kazimain")) {
    matched = IRAQ_TRANSFER_RULES.find(r => r.id === "karbala_plus_kazimain_samarra");
  } else if (effectiveCities.has("najaf") && effectiveCities.has("karbala")) {
    matched = IRAQ_TRANSFER_RULES.find(r => r.id === "najaf_karbala");
  } else if (effectiveCities.has("najaf")) {
    matched = IRAQ_TRANSFER_RULES.find(r => r.id === "only_najaf");
  } else if (effectiveCities.has("karbala")) {
    matched = IRAQ_TRANSFER_RULES.find(r => r.id === "only_karbala");
  }

  if (!matched) {
    return {
      pricePerPerson: 0,
      pricePerCar: 0,
      note: "",
      error: "ترکیب شهرهای انتخابی در سیستم تعریف نشده است."
    };
  }

  return {
    pricePerPerson: Math.round(matched.pricePerCar / count),
    pricePerCar: matched.pricePerCar,
    note: matched.note,
    error: null
  };
}

// ─────────────────────────────────────────────
//  ۶. Export (برای استفاده در index.html)
// ─────────────────────────────────────────────
// اگر از ES Modules استفاده می‌کنی:
// export { DATE_RULES, TRAVEL_TYPES, IRAN_TRANSFER, checkDateRules, calcIranTransfer };

// اگر از script معمولی استفاده می‌کنی (window global):
// (export در بخش ۸ تعریف شده)

// ─────────────────────────────────────────────
//  ۶. قیمت هتل‌ها (هر شب، هر نفر — تومان)
//     اسم هتل‌ها بعداً تکمیل می‌شود
// ─────────────────────────────────────────────

const HOTELS = {

  karbala: {
    label: "کربلا",
    hotels: [
      { id: "karbala_luxury_1",  label: "هتل لوکس ۱",    category: "luxury",   pricePerPersonPerNight: 3_000_000 },
      { id: "karbala_luxury_2",  label: "هتل لوکس ۲",    category: "luxury",   pricePerPersonPerNight: 4_000_000 },
      { id: "karbala_mid_1",     label: "هتل متوسط ۱",   category: "mid",      pricePerPersonPerNight: 2_000_000 },
      { id: "karbala_mid_2",     label: "هتل متوسط ۲",   category: "mid",      pricePerPersonPerNight: 1_500_000 },
      { id: "karbala_budget_1",  label: "هتل اقتصادی ۱", category: "budget",   pricePerPersonPerNight: 1_000_000 },
      { id: "karbala_budget_2",  label: "هتل اقتصادی ۲", category: "budget",   pricePerPersonPerNight:   900_000 }
    ]
  },

  najaf: {
    label: "نجف",
    hotels: [
      { id: "najaf_luxury_1",   label: "هتل لوکس ۱",    category: "luxury",   pricePerPersonPerNight: 4_000_000 },
      { id: "najaf_luxury_2",   label: "هتل لوکس ۲",    category: "luxury",   pricePerPersonPerNight: 3_000_000 },
      { id: "najaf_mid_1",      label: "هتل متوسط ۱",   category: "mid",      pricePerPersonPerNight: 2_500_000 },
      { id: "najaf_mid_2",      label: "هتل متوسط ۲",   category: "mid",      pricePerPersonPerNight: 1_800_000 },
      { id: "najaf_budget_1",   label: "هتل اقتصادی ۱", category: "budget",   pricePerPersonPerNight: 1_000_000 },
      { id: "najaf_budget_2",   label: "هتل اقتصادی ۲", category: "budget",   pricePerPersonPerNight:   900_000 }
    ]
  },

  kazimain: {
    label: "کاظمین / سامرا",
    hotels: [
      { id: "kaz_luxury_1",  label: "هتل لوکس ۱",    category: "luxury",   pricePerPersonPerNight: 3_000_000 },
      { id: "kaz_luxury_2",  label: "هتل لوکس ۲",    category: "luxury",   pricePerPersonPerNight: 4_000_000 },
      { id: "kaz_mid_1",     label: "هتل متوسط ۱",   category: "mid",      pricePerPersonPerNight: 2_000_000 },
      { id: "kaz_mid_2",     label: "هتل متوسط ۲",   category: "mid",      pricePerPersonPerNight: 1_500_000 },
      { id: "kaz_budget_1",  label: "هتل اقتصادی ۱", category: "budget",   pricePerPersonPerNight: 1_000_000 },
      { id: "kaz_budget_2",  label: "هتل اقتصادی ۲", category: "budget",   pricePerPersonPerNight:   900_000 }
    ]
  }
};

// سامرا از هتل‌های کاظمین استفاده می‌کند
HOTELS.samarra = Object.assign({}, HOTELS.kazimain, { label: "سامرا" });

/**
 * محاسبه هزینه هتل برای یک شهر
 * @param {string}  cityKey       - "najaf" | "karbala" | "kazimain" | "samarra"
 * @param {string}  hotelId       - شناسه هتل انتخابی
 * @param {number}  nights        - تعداد شب
 * @param {number}  passengers    - تعداد مسافر
 * @param {boolean} applyIncrease - افزایش ۵٪ تاسوعا/عاشورا اعمال شود؟
 */
function calcHotelCost(cityKey, hotelId, nights, passengers, applyIncrease) {
  applyIncrease = applyIncrease || false;
  var cityData = HOTELS[cityKey];
  if (!cityData) return { totalCost: 0, perPersonPerNight: 0, note: "", error: 'شهر "' + cityKey + '" یافت نشد.' };

  var hotel = null;
  for (var i = 0; i < cityData.hotels.length; i++) {
    if (cityData.hotels[i].id === hotelId) { hotel = cityData.hotels[i]; break; }
  }
  if (!hotel) return { totalCost: 0, perPersonPerNight: 0, note: "", error: 'هتل "' + hotelId + '" یافت نشد.' };

  var price = hotel.pricePerPersonPerNight;
  if (applyIncrease && (cityKey === "najaf" || cityKey === "karbala")) {
    price = Math.round(price * 1.05);
  }

  return {
    totalCost: price * nights * passengers,
    perPersonPerNight: price,
    nights: nights,
    passengers: passengers,
    note: hotel.label + " — " + cityData.label + " — " + nights + " شب × " + passengers + " نفر" +
          (applyIncrease && (cityKey === "najaf" || cityKey === "karbala") ? " (افزایش ۵٪ تاسوعا/عاشورا)" : ""),
    error: null
  };
}

// ─────────────────────────────────────────────
//  ۷. قانون اختیاری‌بودن ترانسفر
//     ترانسفر ایران و عراق فقط اگر کاربر «می‌خواهم» انتخاب کند
//     محاسبه می‌شود — در غیر این صورت صفر است
// ─────────────────────────────────────────────

const TRANSFER_OPTIONS = {
  iran: {
    label: "ترانسفر داخل ایران",
    optional: true,
    defaultSelected: false
  },
  iraq: {
    label: "ترانسفر داخل عراق",
    optional: true,
    defaultSelected: false
  }
};


// ─────────────────────────────────────────────
//  خدمات جانبی (اختیاری — کاربر انتخاب می‌کند)
// ─────────────────────────────────────────────
const EXTRA_SERVICES = {
  simcard: {
    id: "simcard",
    label: "سیم‌کارت عراقی",
    price: 500000,
    perPerson: true,
    optional: true,
    defaultSelected: false
  },
  insurance: {
    id: "insurance",
    label: "بیمه مسافرتی",
    price: 150000,
    perPerson: true,
    optional: true,
    defaultSelected: false
  }
};

function calcExtraServices(selectedServices, passengers) {
  var breakdown = [];
  var totalCost = 0;
  (selectedServices || []).forEach(function(svcId) {
    var svc = EXTRA_SERVICES[svcId];
    if (!svc) return;
    var cost = svc.perPerson ? svc.price * passengers : svc.price;
    totalCost += cost;
    breakdown.push({ id: svcId, label: svc.label, costPerPerson: svc.price, totalCost: cost });
  });
  return { totalCost: totalCost, breakdown: breakdown };
}

// ─────────────────────────────────────────────
//  ۸. Export نهایی
// ─────────────────────────────────────────────
window.TourData = {
  DATE_RULES:          DATE_RULES,
  TRAVEL_TYPES:        TRAVEL_TYPES,
  IRAN_TRANSFER:       IRAN_TRANSFER,
  IRAQ_TRANSFER_RULES: IRAQ_TRANSFER_RULES,
  HOTELS:              HOTELS,
  TRANSFER_OPTIONS:    TRANSFER_OPTIONS,
  checkDateRules:      checkDateRules,
  calcIranTransfer:    calcIranTransfer,
  calcIraqTransfer:    calcIraqTransfer,
  calcHotelCost:       calcHotelCost,
  calcExtraServices:   calcExtraServices,
  EXTRA_SERVICES:      EXTRA_SERVICES
};
