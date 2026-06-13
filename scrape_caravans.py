# -*- coding: utf-8 -*-
"""
اسکریپت استخراج اطلاعات کاروان‌ها از سایت atabatorg.haj.ir
و به‌روزرسانی فایل caravans.json با همان ساختاری که سایت HTML شما می‌خواند.

نحوه اجرا (هر بار - مثلاً روزانه):
    python scrape_caravans.py

اسکریپت یک تصویر کپچا را در همین پوشه ذخیره می‌کند (captcha.png)،
آن را باز کنید، عدد را در ترمینال تایپ کنید و Enter بزنید.
سپس اسکریپت خودش جدول را می‌خواند و caravans.json را می‌سازد/به‌روزرسانی می‌کند.

پیش‌نیاز نصب (فقط یک‌بار):
    pip install playwright --break-system-packages
    playwright install chromium
"""

import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

# ===================== تنظیمات قابل تغییر =====================
URL = "https://atabatorg.haj.ir/KargroupResLockPublic.aspx"

# بازه تاریخ شمسی (به فرمت روی سایت - معمولاً yyyy/mm/dd)
DATE_FROM = "1405/04/01"
DATE_TO   = "1405/04/31"

OUTPUT_JSON = Path(__file__).parent / "caravans.json"
CAPTCHA_IMG = Path(__file__).parent / "captcha.png"

# اگر سایت بازشد و هدلس نبود (مرورگر دیده شد)، False بگذارید تا بتوانید
# دستی هم سایت را چک کنید (برای دیباگ اول مفید است)
HEADLESS = False
# ================================================================


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=HEADLESS)
        page = browser.new_page()
        page.goto(URL, wait_until="networkidle")

        print("\n=== مرحله ۱: صفحه باز شد ===")
        print("لطفاً یک‌بار دستی صفحه را در مرورگری که باز شده بررسی کن:")
        print("  1) فیلدهای تاریخ از/تا را پیدا کن و نام (id یا name) آن‌ها را با Inspect بگیر")
        print("  2) دکمه «جستجو» یا «نمایش» را پیدا کن")
        print("  3) عکس کپچا را پیدا کن")
        print("این اطلاعات را باید در بخش 'SELECTORS' پایین همین فایل وارد کنی (یک‌بار)")
        print("==================================================\n")

        # ---------- SELECTORS (باید بعد از inspect واقعی پر شوند) ----------
        SEL_DATE_FROM = "#txtFromDate"   # نمونه - باید با id واقعی جایگزین شود
        SEL_DATE_TO   = "#txtToDate"     # نمونه - باید با id واقعی جایگزین شود
        SEL_CAPTCHA_IMG = "img#imgCaptcha"  # نمونه
        SEL_CAPTCHA_INPUT = "#txtCaptcha"   # نمونه
        SEL_SUBMIT_BTN = "#btnSearch"        # نمونه
        SEL_RESULT_TABLE = "table#GridView1"  # نمونه
        # --------------------------------------------------------------------

        # پر کردن تاریخ‌ها (اگر selector درست باشد)
        try:
            page.fill(SEL_DATE_FROM, DATE_FROM)
            page.fill(SEL_DATE_TO, DATE_TO)
        except Exception as e:
            print(f"⚠️ پر کردن تاریخ‌ها ناموفق بود ({e}). selector را در فایل اصلاح کن.")

        # ذخیره عکس کپچا
        try:
            page.locator(SEL_CAPTCHA_IMG).screenshot(path=str(CAPTCHA_IMG))
            print(f"✅ تصویر کپچا ذخیره شد: {CAPTCHA_IMG}")
            print("عکس را باز کن و عدد/کد داخل آن را بخوان.")
        except Exception as e:
            print(f"⚠️ ذخیره کپچا ناموفق بود ({e}). selector را اصلاح کن.")

        captcha_value = input("\nکد کپچا را وارد کن: ").strip()

        try:
            page.fill(SEL_CAPTCHA_INPUT, captcha_value)
            page.click(SEL_SUBMIT_BTN)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"⚠️ ارسال فرم ناموفق بود ({e}).")
            browser.close()
            sys.exit(1)

        # ---------- استخراج جدول نتایج ----------
        rows_data = []
        try:
            rows = page.query_selector_all(f"{SEL_RESULT_TABLE} tr")
            print(f"\nتعداد ردیف‌های یافت‌شده: {len(rows)}")
            for r in rows[1:]:  # ردیف اول معمولاً هدر است
                cells = [c.inner_text().strip() for c in r.query_selector_all("td")]
                if cells:
                    rows_data.append(cells)
        except Exception as e:
            print(f"⚠️ استخراج جدول ناموفق بود ({e}).")

        browser.close()

    if not rows_data:
        print("\n❌ هیچ داده‌ای استخراج نشد. لطفاً selectors را با ساختار واقعی سایت تطبیق بده.")
        print("نکته: می‌توانی با گزینه HEADLESS=False ساختار جدول را دستی در مرورگر ببینی")
        print("و سپس map_row_to_trip() را در همین فایل با شماره ستون‌های واقعی پر کنی.")
        return

    trips = [map_row_to_trip(row) for row in rows_data]
    save_json(trips)


def map_row_to_trip(cells):
    """
    این تابع باید بر اساس ترتیب واقعی ستون‌های جدول سایت تنظیم شود.
    فعلاً یک نگاشت نمونه قرار داده شده - باید با ستون‌های واقعی جایگزین کنی.

    ساختار خروجی باید مطابق caravans.json فعلی شما باشد:
    day, departure_date, capacity, trip_type, price, departure_city,
    city, agent, group_id, operator, hotel_najaf, hotel_karbala,
    hotel_kazimain, address
    """
    def get(i):
        return cells[i] if i < len(cells) else ""

    return {
        "day": get(0),
        "departure_date": get(1),
        "capacity": get(2),
        "trip_type": get(3),
        "price": get(4),
        "departure_city": get(5),
        "city": get(6),
        "agent": get(7),
        "group_id": get(8),
        "operator": get(9),
        "hotel_najaf": get(10),
        "hotel_karbala": get(11),
        "hotel_kazimain": get(12),
        "address": get(13),
    }


def save_json(trips):
    data = {
        "source": "سازمان حج و زیارت - عتبات عالیات عراق",
        "updated": DATE_FROM.replace("/", "")[:6],  # مثلاً 140504
        "total": len(trips),
        "trips": trips,
    }
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n✅ فایل ذخیره شد: {OUTPUT_JSON} ({len(trips)} رکورد)")


if __name__ == "__main__":
    main()
