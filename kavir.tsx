import { useState, useMemo } from "react";

/* ---------------- آیکون‌های ساده ---------------- */
const IconBase = ({ children, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Check = (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12" /></IconBase>;
const X = (p) => <IconBase {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></IconBase>;
const Pencil = (p) => <IconBase {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></IconBase>;
const Plane = (p) => <IconBase {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.7c-.4.4-.3 1 .2 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.5.9.6 1.3.2l.7-.7c.4-.3.6-.8.5-1.3Z" /></IconBase>;
const ChevronDown = (p) => <IconBase {...p}><polyline points="6 9 12 15 18 9" /></IconBase>;
const ChevronUp = (p) => <IconBase {...p}><polyline points="18 15 12 9 6 15" /></IconBase>;
const Clock = (p) => <IconBase {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></IconBase>;
const Users = (p) => <IconBase {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></IconBase>;
const Bell = (p) => <IconBase {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></IconBase>;
const BarChart3 = (p) => <IconBase {...p}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></IconBase>;
const Calendar = (p) => <IconBase {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconBase>;
const ArrowRight = (p) => <IconBase {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></IconBase>;
const Sparkles = (p) => <IconBase {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></IconBase>;
const AlertTriangle = (p) => <IconBase {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconBase>;

/* ============================================================
   داده‌های واقعی — استخراج‌شده از فایل‌های سپهر۳۶۰
   مسیر: تهران (THR/IKA/PYK) → استانبول (TEQ/SAW/IST)
   ============================================================ */
const RAW = {
  "11-04-1405": { weekday: "پنجشنبه", greg: "2026-07-02", flights: [
    { airline: "ماهان", flightNo: "112", time: "19:00", price: 30434800, seatsLeft: 1 },
    { airline: "آتا", flightNo: "6619", time: "20:00", price: 38000000, seatsLeft: 3 },
    { airline: "آوا", flightNo: "9210", time: "17:00", price: 39000000, seatsLeft: 5 },
    { airline: "فلای کیش", flightNo: "3287", time: "19:00", price: 39000000, seatsLeft: 3 },
    { airline: "کاسپین", flightNo: "7972", time: "04:30", price: 40000000, seatsLeft: 6 },
    { airline: "آوا", flightNo: "9214", time: "04:30", price: 40000000, seatsLeft: 6 },
    { airline: "کاسپین", flightNo: "7902", time: "06:15", price: 40000000, seatsLeft: 4 },
    { airline: "فلای کیش", flightNo: "3287", time: "19:00", price: 40000000, seatsLeft: 5 },
    { airline: "وارش", flightNo: "6846", time: "20:00", price: 40000000, seatsLeft: 3 },
    { airline: "وارش", flightNo: "6846", time: "20:00", price: 40000000, seatsLeft: 4 },
  ]},
  "13-04-1405": { weekday: "شنبه", greg: "2026-07-04", flights: [
    { airline: "آتا", flightNo: "6619", time: "20:00", price: 19000000, seatsLeft: 5 },
    { airline: "وارش", flightNo: "6846", time: "06:00", price: 20000000, seatsLeft: 5 },
    { airline: "آتا", flightNo: "6617", time: "06:45", price: 20000000, seatsLeft: 5 },
    { airline: "ایران ایر", flightNo: "769", time: "17:30", price: 20000000, seatsLeft: 6 },
    { airline: "معراج", flightNo: "4805", time: "07:15", price: 20328600, seatsLeft: 3 },
    { airline: "معراج", flightNo: "4805", time: "07:15", price: 20628600, seatsLeft: 9 },
    { airline: "معراج", flightNo: "4805", time: "07:15", price: 20928600, seatsLeft: 3 },
    { airline: "آوا", flightNo: "9214", time: "04:30", price: 21000000, seatsLeft: 7 },
    { airline: "فلای کیش", flightNo: "3287", time: "04:45", price: 21000000, seatsLeft: 4 },
    { airline: "ایران ایر", flightNo: "719", time: "06:15", price: 21000000, seatsLeft: 6 },
  ]},
  "14-04-1405": { weekday: "یکشنبه", greg: "2026-07-05", flights: [
    { airline: "ساها", flightNo: "8256", time: "19:30", price: 19580700, seatsLeft: 1 },
    { airline: "آوا", flightNo: "9214", time: "04:30", price: 19900000, seatsLeft: 7 },
    { airline: "کاسپین", flightNo: "7902", time: "05:30", price: 19900000, seatsLeft: 9 },
    { airline: "آتا", flightNo: "6617", time: "06:45", price: 19900000, seatsLeft: 7 },
    { airline: "کاسپین", flightNo: "7972", time: "21:00", price: 19900000, seatsLeft: 4 },
    { airline: "ایران ایر", flightNo: "719", time: "06:15", price: 20000000, seatsLeft: 8 },
    { airline: "قشم ایر", flightNo: "2213", time: "04:45", price: 20333700, seatsLeft: 9 },
    { airline: "کاسپین", flightNo: "7902", time: "05:30", price: 21000000, seatsLeft: 4 },
    { airline: "معراج", flightNo: "4805", time: "07:15", price: 21000000, seatsLeft: 5 },
    { airline: "آتا", flightNo: "6619", time: "20:00", price: 21000000, seatsLeft: 5 },
  ]},
  "16-04-1405": { weekday: "سه‌شنبه", greg: "2026-07-07", flights: [
    { airline: "آوا", flightNo: "9214", time: "04:30", price: 19200000, seatsLeft: 6 },
    { airline: "کاسپین", flightNo: "7902", time: "05:30", price: 19200000, seatsLeft: 2 },
    { airline: "فلای کیش", flightNo: "3287", time: "04:45", price: 20000000, seatsLeft: 5 },
    { airline: "کاسپین", flightNo: "7902", time: "05:30", price: 20000000, seatsLeft: 3 },
    { airline: "ایران ایر", flightNo: "719", time: "06:15", price: 21000000, seatsLeft: 8 },
    { airline: "وارش", flightNo: "6846", time: "07:00", price: 21000000, seatsLeft: 3 },
    { airline: "معراج", flightNo: "4807", time: "16:30", price: 21328600, seatsLeft: 9 },
    { airline: "ساها", flightNo: "8256", time: "19:30", price: 21562700, seatsLeft: 9 },
    { airline: "معراج", flightNo: "4807", time: "16:30", price: 21928600, seatsLeft: 9 },
    { airline: "فلای کیش", flightNo: "3287", time: "04:45", price: 22000000, seatsLeft: 6 },
  ]},
  "17-04-1405": { weekday: "چهارشنبه", greg: "2026-07-08", flights: [
    { airline: "آوا", flightNo: "9214", time: "04:30", price: 20000000, seatsLeft: 6 },
    { airline: "کاسپین", flightNo: "7902", time: "05:30", price: 20000000, seatsLeft: 8 },
    { airline: "ایران ایر", flightNo: "719", time: "06:15", price: 22000000, seatsLeft: 6 },
    { airline: "آتا", flightNo: "6617", time: "06:45", price: 22000000, seatsLeft: 5 },
    { airline: "وارش", flightNo: "6846", time: "07:00", price: 22000000, seatsLeft: 4 },
    { airline: "ایران ایرتور", flightNo: "9710", time: "09:15", price: 22968700, seatsLeft: 7 },
    { airline: "کاسپین", flightNo: "7902", time: "05:30", price: 23000000, seatsLeft: 5 },
    { airline: "وارش", flightNo: "6846", time: "06:00", price: 23000000, seatsLeft: 5 },
    { airline: "وارش", flightNo: "6846", time: "06:00", price: 24500000, seatsLeft: 7 },
    { airline: "وارش", flightNo: "6846", time: "06:00", price: 24500000, seatsLeft: 4 },
  ]},
};

const AGENCIES = [
  "ره بال آسمان", "پینگو تریپ", "آدم و حوا", "گشت نوید", "گسترش سیاحت اطلس",
  "مهر آگین سیر کیش", "گلفام سفر", "ریحان پرواز امین", "همنواز آسمان آبی",
  "آسمان پرستاره کیش (تهران)", "خیام گشت ایرانیان", "شهران گشت معراج", "الفبای سفر پارسیان",
];
function agencyFor(airline, flightNo, idx) {
  const seed = (airline.length * 7 + (parseInt(flightNo, 10) || 0) + idx * 13) % AGENCIES.length;
  return AGENCIES[seed];
}
Object.values(RAW).forEach((info) => {
  info.flights.forEach((f, idx) => {
    if (!f.agency) f.agency = agencyFor(f.airline, f.flightNo, idx);
  });
});

const DATES = Object.keys(RAW);
const fmt = (n) => n.toLocaleString("fa-IR");

const INITIAL_OUR_RATES = {
  "11-04-1405": 41500000,
  "13-04-1405": 21800000,
  "14-04-1405": 20900000,
  "16-04-1405": 22600000,
  "17-04-1405": 23800000,
};
const INITIAL_OUR_SEATS = {
  "11-04-1405": { left: 4, total: 144 },
  "13-04-1405": { left: 38, total: 144 },
  "14-04-1405": { left: 22, total: 144 },
  "16-04-1405": { left: 11, total: 144 },
  "17-04-1405": { left: 53, total: 144 },
};

function computeStats(flights) {
  const prices = flights.map((f) => f.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const cheapest = flights.find((f) => f.price === min);
  return { min, max, avg, cheapest, count: flights.length };
}

function aiSuggest(ourRate, ourSeats, stats) {
  const occupancyLeftPct = Math.round((ourSeats.left / ourSeats.total) * 100);
  const isCritical = occupancyLeftPct < 12;
  const isLoose = occupancyLeftPct > 35;
  let target;
  let reasoning;

  if (ourRate > stats.min * 1.06 && !isCritical) {
    target = Math.round((stats.min * 1.03) / 10000) * 10000;
    reasoning = `ارزان‌ترین رقیب فعال در این تاریخ «${stats.cheapest.airline} ${stats.cheapest.flightNo}» با نرخ ${fmt(stats.min)} تومان است. نرخ فعلی شما (${fmt(ourRate)} تومان) حدود ${(((ourRate - stats.min) / stats.min) * 100).toFixed(1)}٪ بالاتر از کف بازار است. برای حفظ رقابت‌پذیری پیشنهاد می‌شود نرخ به ${fmt(target)} تومان نزدیک شود؛ همچنان بالاتر از کف بازار اما در محدوده‌ی میانگین بازار (${fmt(stats.avg)} تومان).`;
  } else if (isCritical) {
    target = Math.round((ourRate * 1.05) / 10000) * 10000;
    reasoning = `فقط ${ourSeats.left} صندلی از ${ourSeats.total} صندلی باقی مانده (${occupancyLeftPct}٪ ظرفیت آزاد) — یعنی تقاضا برای این پرواز بالاست. با وجود اینکه میانگین بازار ${fmt(stats.avg)} تومان است، کمبود شدید ظرفیت توجیه‌گر افزایش نرخ به ${fmt(target)} تومان برای حداکثرسازی درآمد بدون از‌دست‌دادن مسافر است.`;
  } else if (isLoose) {
    target = Math.round((stats.avg * 0.97) / 10000) * 10000;
    reasoning = `${occupancyLeftPct}٪ از ظرفیت پرواز شما هنوز خالی است در حالی‌که تاریخ پرواز نزدیک می‌شود. میانگین بازار در این تاریخ ${fmt(stats.avg)} تومان است. پیشنهاد می‌شود نرخ به ${fmt(target)} تومان (کمی زیر میانگین) کاهش یابد تا سرعت فروش صندلی‌های باقی‌مانده افزایش پیدا کند.`;
  } else {
    target = ourRate;
    reasoning = `نرخ فعلی شما (${fmt(ourRate)} تومان) در محدوده‌ی منطقی نسبت به بازار (کف ${fmt(stats.min)} − میانگین ${fmt(stats.avg)} تومان) قرار دارد و ظرفیت باقی‌مانده (${occupancyLeftPct}٪) متعادل است. تغییری پیشنهاد نمی‌شود.`;
  }
  return { target, reasoning, occupancyLeftPct, isCritical, isLoose };
}

const AIRLINE_COLORS = {
  "ماهان": "#DC2626", "آتا": "#2563EB", "آوا": "#0891B2", "فلای کیش": "#7C3AED",
  "کاسپین": "#059669", "وارش": "#EA580C", "ایران ایر": "#1D4ED8", "معراج": "#DB2777",
  "ساها": "#65A30D", "قشم ایر": "#0D9488", "ایران ایرتور": "#9333EA",
};
const airlineColor = (name) => AIRLINE_COLORS[name] || "#64748B";

/* ---------------- Toast ---------------- */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const palette = {
    approved: { bg: "linear-gradient(135deg,#34D399,#10B981)", icon: <Check className="w-5 h-5" /> },
    rejected: { bg: "linear-gradient(135deg,#94A3B8,#64748B)", icon: <X className="w-5 h-5" /> },
    manual: { bg: "linear-gradient(135deg,#60A5FA,#2563EB)", icon: <Pencil className="w-5 h-5" /> },
    alert: { bg: "linear-gradient(135deg,#FBBF24,#F59E0B)", icon: <AlertTriangle className="w-5 h-5" /> },
  };
  const v = palette[toast.kind] || palette.alert;
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white"
      style={{ background: v.bg, minWidth: 280, maxWidth: "92vw" }}
    >
      <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">{v.icon}</div>
      <div className="text-sm font-medium leading-6 flex-1">{toast.message}</div>
      <button onClick={onClose} className="opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

/* ---------------- مودال تأیید نهایی ---------------- */
const BOOKING_CLASSES = ["Economy Y 100", "Economy Q 50", "Economy M 30", "Business C 20", "Business J 12"];

function SepehrConfirmModal({ pending, onCancel, onConfirm }) {
  const [step, setStep] = useState("warning");
  const [scope, setScope] = useState(null);
  const [bookingClass, setBookingClass] = useState(BOOKING_CLASSES[0]);
  const [capacity, setCapacity] = useState(String(pending?.ourSeats?.total ?? ""));
  const [maxDisplay, setMaxDisplay] = useState("9");

  if (!pending) return null;

  const handleFinalSubmit = () => {
    const extra =
      scope === "full"
        ? { scope: "full", bookingClass, capacity, maxDisplay }
        : { scope: "rateOnly" };
    onConfirm(extra);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4" style={{ zIndex: 60 }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
        {step === "warning" && (
          <div className="p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-slate-800 font-extrabold text-base mb-2">هشدار اجرای مستقیم</h3>
            <p className="text-slate-500 text-sm leading-7">
              ربات سیستم سپهر فعال است. با تأیید نرخ، تغییر به‌صورت مستقیم و بدون بازبینی دستی روی سامانه‌ی سپهر۳۶۰ اجرا خواهد شد.
            </p>
            <p className="text-slate-800 text-sm font-bold mt-3">
              نرخ پیشنهادی: <span className="font-mono">{fmt(pending.rate)}</span> تومان — پرواز {pending.date}
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors">
                انصراف
              </button>
              <button onClick={() => setStep("scope")} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors">
                متوجه شدم، ادامه
              </button>
            </div>
          </div>
        )}

        {step === "scope" && (
          <div className="p-6">
            <h3 className="text-slate-800 font-extrabold text-base mb-1">دامنه‌ی تغییرات</h3>
            <p className="text-slate-400 text-xs mb-4">
              قبل از ثبت روی سپهر مشخص کنید فقط نرخ تغییر کند یا کلاس پروازی، ظرفیت و تعداد نمایش هم تنظیم شود.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setScope("rateOnly")}
                className={`w-full text-right px-4 py-3 rounded-xl ring-1 transition-colors ${scope === "rateOnly" ? "bg-sky-50 ring-sky-300" : "bg-slate-50 ring-slate-200 hover:bg-slate-100"}`}
              >
                <div className="text-sm font-bold text-slate-700">فقط نرخ تغییر کند</div>
                <div className="text-xs text-slate-400 mt-0.5">کلاس پروازی، ظرفیت و تعداد نمایش دست‌نخورده باقی می‌مانند.</div>
              </button>
              <button
                onClick={() => setScope("full")}
                className={`w-full text-right px-4 py-3 rounded-xl ring-1 transition-colors ${scope === "full" ? "bg-sky-50 ring-sky-300" : "bg-slate-50 ring-slate-200 hover:bg-slate-100"}`}
              >
                <div className="text-sm font-bold text-slate-700">نرخ + سایر تنظیمات</div>
                <div className="text-xs text-slate-400 mt-0.5">کلاس پروازی، ظرفیت و حداکثر تعداد نمایش هم بررسی و ثبت شود.</div>
              </button>
            </div>

            {scope === "full" && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-500 shrink-0">کلاس پروازی</label>
                  <select
                    value={bookingClass}
                    onChange={(e) => setBookingClass(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    {BOOKING_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-500 shrink-0">ظرفیت</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value.replace(/[^0-9]/g, ""))}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 text-left font-mono outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-500 shrink-0">حداکثر تعداد نمایش</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxDisplay}
                    onChange={(e) => setMaxDisplay(e.target.value.replace(/[^0-9]/g, ""))}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 text-left font-mono outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-5">
              <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors">
                انصراف
              </button>
              <button
                disabled={!scope}
                onClick={handleFinalSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
              >
                ثبت روی سپهر
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- بج وضعیت ---------------- */
function StatusPill({ status }) {
  const map = {
    pending: { text: "نیازمند تصمیم", cls: "bg-amber-100 text-amber-700 ring-amber-300" },
    approved: { text: "تأیید شد", cls: "bg-emerald-100 text-emerald-700 ring-emerald-300" },
    rejected: { text: "بدون تغییر", cls: "bg-slate-100 text-slate-600 ring-slate-300" },
    manual: { text: "نرخ دستی ثبت شد", cls: "bg-sky-100 text-sky-700 ring-sky-300" },
  };
  const v = map[status] || map.pending;
  return <span className={`text-xs px-2.5 py-1 rounded-full ring-1 font-bold whitespace-nowrap ${v.cls}`}>{v.text}</span>;
}

/* ---------------- کارت رقیب ---------------- */
function CompetitorRow({ f, isCheapest }) {
  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl ${isCheapest ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-slate-50"}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: airlineColor(f.airline) }} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-700 truncate">{f.airline}</span>
            <span className="text-xs text-slate-400 font-mono">#{f.flightNo}</span>
          </div>
          <span className="text-xs text-sky-500 font-bold">{f.agency}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{f.time}</span>
        <span className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" />{f.seatsLeft}</span>
        <span className={`text-sm font-mono font-bold ${isCheapest ? "text-emerald-600" : "text-slate-700"}`}>{fmt(f.price)}</span>
      </div>
    </div>
  );
}

/* ---------------- کارت تاریخ پرواز ---------------- */
function DateCard({ date, info, ourRate, ourSeats, status, onDecision, defaultOpen }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [pending, setPending] = useState(null);

  const stats = useMemo(() => computeStats(info.flights), [info.flights]);
  const ai = useMemo(() => aiSuggest(ourRate, ourSeats, stats), [ourRate, ourSeats, stats]);
  const delta = ai.target - ourRate;
  const deltaPct = ourRate ? ((delta / ourRate) * 100).toFixed(1) : "0.0";
  const occPct = 100 - ai.occupancyLeftPct;

  const sorted = [...info.flights].sort((a, b) => a.price - b.price);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button onClick={() => setExpanded((e) => !e)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-right hover:bg-slate-50/80 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#38BDF8,#0EA5E9)" }}>
            <Plane className="w-5 h-5 text-white rotate-180" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5">
              تهران <ArrowRight className="w-3.5 h-3.5 text-sky-400 rotate-180" /> استانبول
            </div>
            <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {date} ({info.weekday}) · {stats.count} پرواز رقیب فعال
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-left hidden sm:block">
            <div className="text-slate-800 text-sm font-mono font-bold">{fmt(ourRate)}</div>
            <div className="text-slate-400 text-xs">نرخ فعلی کویر</div>
          </div>
          <StatusPill status={status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <div className="rounded-2xl bg-sky-50 px-3 py-2.5 ring-1 ring-sky-100">
              <div className="text-sky-500 text-xs mb-1 font-bold">نرخ پرشین پرواز کویر</div>
              <div className="text-slate-800 font-mono text-sm font-bold">{fmt(ourRate)}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
              <div className="text-emerald-600 text-xs mb-1 font-bold">کف بازار</div>
              <div className="text-slate-800 font-mono text-sm font-bold">{fmt(stats.min)}</div>
            </div>
            <div className="rounded-2xl bg-violet-50 px-3 py-2.5 ring-1 ring-violet-100">
              <div className="text-violet-500 text-xs mb-1 font-bold">میانگین بازار</div>
              <div className="text-slate-800 font-mono text-sm font-bold">{fmt(stats.avg)}</div>
            </div>
            <div className={`rounded-2xl px-3 py-2.5 ring-1 ${ai.isCritical ? "bg-rose-50 ring-rose-200" : "bg-amber-50 ring-amber-100"}`}>
              <div className={`text-xs mb-1 font-bold flex items-center gap-1 ${ai.isCritical ? "text-rose-500" : "text-amber-600"}`}>
                <Users className="w-3 h-3" /> ظرفیت پرشده کویر
              </div>
              <div className={`font-mono text-sm font-bold ${ai.isCritical ? "text-rose-600" : "text-slate-800"}`}>
                {occPct}٪ ({ourSeats.left} صندلی باز)
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-bold text-slate-400 mb-2">پروازهای رقیب در این تاریخ (مرتب بر اساس قیمت)</div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pl-1">
              {sorted.map((f, i) => (
                <CompetitorRow key={i} f={f} isCheapest={f.price === stats.min} />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl p-4" style={{ background: "linear-gradient(135deg,#FFFBEB,#FFFFFF)", border: "1px solid #FDE68A" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700 text-xs font-extrabold tracking-wide">پیشنهاد دستیار</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-800 text-lg font-extrabold">{fmt(ai.target)}</span>
                <span className="text-slate-400 text-xs">تومان</span>
                {delta !== 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-lg font-bold ${delta > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {delta > 0 ? "+" : ""}{deltaPct}٪
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-7 mt-3">{ai.reasoning}</p>

            {status === "pending" && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPending({ date, rate: ai.target, reasoning: ai.reasoning, status: "approved", ourSeats })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" /> تأیید پیشنهاد
                </button>
                <button
                  onClick={() => onDecision(date, "rejected", ourRate, "نرخ بدون تغییر باقی ماند")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" /> رد کردن
                </button>
                <button
                  onClick={() => setManualOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-colors shadow-sm"
                >
                  <Pencil className="w-4 h-4" /> ثبت نرخ دستی
                </button>
              </div>
            )}

            {manualOpen && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="نرخ دستی (تومان)"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 text-right outline-none focus:ring-2 focus:ring-sky-300"
                />
                <button
                  disabled={!manualValue}
                  onClick={() => {
                    const rate = parseInt(manualValue, 10);
                    setPending({ date, rate, reasoning: `نرخ دستی ${fmt(rate)} تومان توسط اپراتور ثبت شد`, status: "manual", ourSeats });
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-200 transition-colors"
                >
                  ثبت
                </button>
              </div>
            )}

            {status !== "pending" && (
              <div className="mt-3 text-xs text-slate-400 font-medium">
                {status === "approved" && "این نرخ تأیید و در صف اعمال روی سامانه قرار گرفت."}
                {status === "rejected" && "پیشنهاد رد شد؛ نرخ فعلی بدون تغییر باقی ماند."}
                {status === "manual" && "نرخ دستی ثبت و در صف اعمال قرار گرفت."}
              </div>
            )}
          </div>
        </div>
      )}

      {pending && (
        <SepehrConfirmModal
          pending={pending}
          onCancel={() => setPending(null)}
          onConfirm={(extra) => {
            onDecision(date, pending.status, pending.rate, pending.reasoning, extra);
            setPending(null);
            setManualOpen(false);
            setManualValue("");
          }}
        />
      )}
    </div>
  );
}

/* ---------------- گزارش وضعیت ---------------- */
function ReportsView({ ourRates, ourSeatsMap, decisions }) {
  const allFlights = useMemo(() => {
    const out = [];
    DATES.forEach((d) => RAW[d].flights.forEach((f) => out.push({ ...f, date: d, weekday: RAW[d].weekday })));
    return out;
  }, []);

  const byAirline = useMemo(() => {
    const map = {};
    allFlights.forEach((f) => {
      if (!map[f.airline]) map[f.airline] = { count: 0, prices: [] };
      map[f.airline].count++;
      map[f.airline].prices.push(f.price);
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, count: v.count, avg: Math.round(v.prices.reduce((a, b) => a + b, 0) / v.prices.length) }))
      .sort((a, b) => b.count - a.count);
  }, [allFlights]);

  const byWeekday = useMemo(() => {
    const map = {};
    DATES.forEach((d) => {
      const wd = RAW[d].weekday;
      map[wd] = (map[wd] || 0) + RAW[d].flights.length;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const busiest = byWeekday[0];
  const maxAirlineCount = byAirline[0]?.count || 1;

  const ourTotal = DATES.reduce((sum, d) => sum + (ourSeatsMap[d].total - ourSeatsMap[d].left), 0);
  const ourCapacityTotal = DATES.reduce((sum, d) => sum + ourSeatsMap[d].total, 0);
  const ourAvgRate = Math.round(DATES.reduce((s, d) => s + ourRates[d], 0) / DATES.length);
  const marketAvgAll = Math.round(allFlights.reduce((s, f) => s + f.price, 0) / allFlights.length);

  const decided = Object.values(decisions).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="پروازهای کویر در این بازه" value={`${DATES.length} پرواز`} sub="یک پرواز روزانه ثبت‌شده" color="#0EA5E9" />
        <SummaryCard label="پروازهای رقبا (همه ایرلاین‌ها)" value={`${allFlights.length} پرواز`} sub={`${byAirline.length} ایرلاین فعال`} color="#7C3AED" />
        <SummaryCard label="پرترددترین روز هفته" value={busiest ? busiest[0] : "—"} sub={busiest ? `${busiest[1]} پرواز در این روز` : ""} color="#F59E0B" />
        <SummaryCard label="میانگین نرخ کویر در برابر بازار" value={`${fmt(ourAvgRate)}`} sub={`بازار: ${fmt(marketAvgAll)} تومان`} color={ourAvgRate > marketAvgAll ? "#EF4444" : "#10B981"} />
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-extrabold text-slate-700">سهم ایرلاین‌ها در مسیر تهران–استانبول</h3>
        </div>
        <div className="space-y-2.5">
          {byAirline.map((a) => (
            <div key={a.name} className="flex items-center gap-3">
              <span className="w-24 text-xs font-bold text-slate-600 shrink-0 truncate">{a.name}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full flex items-center justify-end px-2" style={{ width: `${(a.count / maxAirlineCount) * 100}%`, background: airlineColor(a.name) }}>
                  <span className="text-xs text-white font-bold">{a.count}</span>
                </div>
              </div>
              <span className="w-28 text-xs text-slate-400 font-mono shrink-0 text-left">میانگین {fmt(a.avg)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-extrabold text-slate-700">تعداد پرواز رقبا به تفکیک روز هفته</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {DATES.map((d) => {
            const count = RAW[d].flights.length;
            const isMax = busiest && RAW[d].weekday === busiest[0];
            return (
              <div key={d} className={`rounded-2xl p-3 text-center ${isMax ? "bg-amber-50 ring-1 ring-amber-300" : "bg-slate-50"}`}>
                <div className={`text-xs font-extrabold ${isMax ? "text-amber-600" : "text-slate-600"}`}>{RAW[d].weekday}</div>
                <div className="text-xs text-slate-400 mt-0.5">{d}</div>
                <div className={`text-lg font-mono font-extrabold mt-1 ${isMax ? "text-amber-600" : "text-slate-700"}`}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-4 h-4 text-emerald-500 rotate-180" />
          <h3 className="text-sm font-extrabold text-slate-700">وضعیت ظرفیت پروازهای پرشین پرواز کویر</h3>
        </div>
        <div className="space-y-2.5">
          {DATES.map((d) => {
            const s = ourSeatsMap[d];
            const filledPct = Math.round(((s.total - s.left) / s.total) * 100);
            const status = decisions[d]?.status;
            return (
              <div key={d} className="flex items-center gap-3">
                <span className="w-32 text-xs font-bold text-slate-600 shrink-0">{d} · {RAW[d].weekday}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full" style={{ width: `${filledPct}%`, background: filledPct > 88 ? "linear-gradient(90deg,#F87171,#EF4444)" : "linear-gradient(90deg,#38BDF8,#0EA5E9)" }} />
                </div>
                <span className="w-12 text-xs font-mono text-slate-500 text-left">{filledPct}٪</span>
                {status && <StatusPill status={status} />}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>مجموع صندلی پرشده: <b className="text-slate-700 font-mono">{fmt(ourTotal)}</b> از <b className="text-slate-700 font-mono">{fmt(ourCapacityTotal)}</b></span>
          <span>{decided} از {DATES.length} پرواز تصمیم‌گیری شده</span>
        </div>
      </div>

      <p className="text-center text-slate-300 text-xs pt-1">
        منبع داده: نسخه‌های ذخیره‌شده‌ی صفحه‌ی جست‌وجوی سپهر۳۶۰ برای تاریخ‌های ۱۱، ۱۳، ۱۴، ۱۶ و ۱۷ تیر ۱۴۰۵.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 shadow-sm">
      <div className="w-8 h-8 rounded-xl mb-2 flex items-center justify-center" style={{ background: `${color}1A` }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      </div>
      <div className="text-slate-800 font-mono font-extrabold text-base">{value}</div>
      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-slate-400 text-xs mt-1">{sub}</div>}
    </div>
  );
}

/* ============================================================ */

export default function KavirDashboard() {
  const [tab, setTab] = useState("pricing");
  const [ourRates, setOurRates] = useState(INITIAL_OUR_RATES);
  const [ourSeatsMap] = useState(INITIAL_OUR_SEATS);
  const [decisions, setDecisions] = useState({});
  const [toast, setToast] = useState(null);

  const handleDecision = (date, status, newRate, reasoning, extra) => {
    setOurRates((prev) => ({ ...prev, [date]: newRate }));
    setDecisions((prev) => ({ ...prev, [date]: { status, reasoning, extra } }));
    const labels = { approved: "پیشنهاد تأیید شد", rejected: "بدون تغییر باقی ماند", manual: "نرخ دستی ثبت شد" };
    const scopeNote = extra?.scope === "full" ? " — نرخ، کلاس پروازی، ظرفیت و تعداد نمایش روی سپهر به‌روزرسانی شد" : status !== "rejected" ? " — فقط نرخ روی سپهر به‌روزرسانی شد" : "";
    setToast({ kind: status, message: `${labels[status]} — پرواز ${date} (${RAW[date].weekday})، نرخ جدید: ${fmt(newRate)} تومان${scopeNote}` });
    setTimeout(() => setToast(null), 4200);
  };

  const pendingCount = DATES.filter((d) => !decisions[d]).length;

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "linear-gradient(180deg,#F0F9FF 0%,#FAFBFF 40%,#FFFFFF 100%)" }}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-3xl mx-auto px-4 py-7">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg,#0EA5E9,#0284C7)" }}>
                <Plane className="w-6 h-6 text-white rotate-180" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-800">پرشین پرواز کویر</h1>
                <p className="text-slate-400 text-xs mt-0.5">پایش نرخ مسیر چارتر تهران–استانبول</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-5 bg-slate-100 p-1 rounded-2xl w-fit">
          <button onClick={() => setTab("pricing")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "pricing" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}>
            تصمیمات قیمت‌گذاری
          </button>
          <button onClick={() => setTab("reports")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "reports" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}>
            گزارش وضعیت کلی
          </button>
        </div>

        {tab === "pricing" ? (
          <div className="space-y-3">
            {DATES.map((d, i) => (
              <DateCard
                key={d}
                date={d}
                info={RAW[d]}
                ourRate={ourRates[d]}
                ourSeats={ourSeatsMap[d]}
                status={decisions[d]?.status || "pending"}
                onDecision={handleDecision}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        ) : (
          <ReportsView ourRates={ourRates} ourSeatsMap={ourSeatsMap} decisions={decisions} />
        )}

        <p className="text-center text-slate-300 text-xs mt-8">
          نرخ‌ها و مشخصات پروازهای رقیب از نسخه‌های ذخیره‌شده‌ی سپهر۳۶۰ استخراج شده‌اند و قابل اتصال به سامانه‌ی داخلی شماست.
        </p>
      </div>
    </div>
  );
}
