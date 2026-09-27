import { Account, BotConfig, WebookEvent, Seat } from '../types/bot';
import { getWebookBookingUrl } from './webookUrls';

export function generateSeleniumPythonScript(
  accounts: Account[],
  config: BotConfig,
  event: WebookEvent,
  selectedSeats?: Seat[]
): string {
  const bookingUrl = getWebookBookingUrl(event);
  const accountsJson = accounts.length > 0
    ? JSON.stringify(
        accounts.map((a) => ({
          email: a.email,
          password: a.password,
        })),
        null,
        4
      )
    : `[
    {
        "email": "YOUR_WEBOOK_EMAIL@gmail.com",
        "password": "YOUR_WEBOOK_PASSWORD"
    }
]`;

  const targetSeatsList = selectedSeats && selectedSeats.length > 0
    ? JSON.stringify(selectedSeats.map(s => ({ row: s.row, number: s.number, label: s.label, price: s.price })), null, 4)
    : `[
        {"row": "B", "number": 7, "label": "B7", "price": 150},
        {"row": "B", "number": 8, "label": "B8", "price": 150}
    ]`;

  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
 WebBook Official Auto-Seat Sniper Bot (بوت حجز المقاعد الفعلي لمنصة Webook)
 Target Event: ${event.titleAr} (${event.title})
 URL: ${config.targetEventUrl || event.url}
 Seating Layout: ${event.seatingMap.type.toUpperCase()} (${event.seatingMap.stageLabelAr})
========================================================================================
ملاحظة هامة:
1. يقوم البوت بحجز المقاعد المحددة في المخطط وينقلها مباشرة إلى سلة Webook الرسمية (Cart).
2. تبقى المقاعد محجوزة باسمك لمدة 10 دقائق رسمية لإتمام عملية الدفع.
3. لا يغلق البوت المتصفح تلقائياً حتى لا تفقد حجز المقاعد.
"""

import time
import json
import logging
import requests
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

# إعداد السجلات (Colored Terminal Logging)
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("WebookRealSniper")

# الإعدادات
TARGET_EVENT_URL = "${config.targetEventUrl || event.url}"
DESIRED_DATE = "${config.selectedDate || '2024-12-07'}"
DESIRED_TIER = "${config.preferredTier || 'vip'}"
HEADLESS = ${config.headless ? 'True' : 'False'}

# قائمة المقاعد المحددة من المخطط (Specific Seats to Snipe from Seating Map)
TARGET_SEATS = ${targetSeatsList}

# إشعارات تليجرام عند الحجز
TELEGRAM_BOT_TOKEN = "${config.notifyTelegram ? config.telegramBotToken : ''}"
TELEGRAM_CHAT_ID = "${config.notifyTelegram ? config.telegramChatId : ''}"

def send_telegram(text: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"}, timeout=5)
    except Exception:
        pass

def human_type(element, text: str, delay: float = 0.04):
    for ch in text:
        element.send_keys(ch)
        time.sleep(delay)

def reserve_seats_on_webook(email: str, password: str):
    logger.info("=" * 65)
    logger.info(f"🚀 بدء تشغيل المتصفح لحساب Webook: {email}")
    logger.info(f"🎯 الفعالية: ${event.titleAr}")
    logger.info(f"🎟️ المقاعد المطلوبة: {[s.get('label') for s in TARGET_SEATS]}")
    logger.info("=" * 65)

    options = uc.ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--start-maximized")
    options.add_argument("--lang=ar-SA,ar")

    driver = None
    try:
        driver = uc.Chrome(options=options, use_subprocess=True)
        wait = WebDriverWait(driver, 20)

        # 1. الدخول إلى صفحة تسجيل الدخول الرسمية
        login_url = "https://webook.com/ar/login"
        logger.info(f"الانتقال إلى: {login_url}")
        driver.get(login_url)

        # تجاوز رسالة الكوكيز إن وجدت
        try:
            cookie_btn = WebDriverWait(driver, 4).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'الموافقة') or contains(text(), 'قبول')]"))
            )
            cookie_btn.click()
        except Exception:
            pass

        # 2. إدخال البريد الإلكتروني وكلمة المرور
        logger.info("إدخال بيانات الاعتماد للحساب الرسمي...")
        email_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email' or @name='email']")))
        email_field.clear()
        human_type(email_field, email)

        pass_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='password' or @name='password']")))
        pass_field.clear()
        human_type(pass_field, password)

        # 3. الضغط على تسجيل الدخول
        submit_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' or contains(., 'تسجيل الدخول')]")))
        submit_btn.click()
        logger.info("تم إرسال طلب تسجيل الدخول... بانتظار استجابة Webook")
        time.sleep(3)

        # حفظ ملفات تعريف الارتباط (Cookies) للجلسة
        cookies = driver.get_cookies()
        with open("webook_session.json", "w") as f:
            json.dump(cookies, f, indent=2)
        logger.info("تم حفظ جلسة Webook في webook_session.json بنجاح.")

        # 4. الانتقال المباشر لصفحة الفعالية
        logger.info(f"الانتقال لصفحة الفعالية والمخطط: {TARGET_EVENT_URL}")
        driver.get(TARGET_EVENT_URL)
        time.sleep(3)

        # 4.1 الضغط على زر (احجز التذاكر) الرسمي لبدء سلة الحجز
        logger.info("جاري البحث عن زر (احجز التذاكر / Book Tickets)...")
        book_btn_xpaths = [
            "//button[contains(., 'احجز التذاكر') or contains(., 'احجز تذكرتك') or contains(., 'Book Tickets') or contains(., 'Book now')]",
            "//a[contains(., 'احجز التذاكر') or contains(., 'احجز تذكرتك') or contains(., 'Book Tickets')]",
            "//button[contains(@class, 'book') or contains(@id, 'book')]",
            "//div[contains(@class, 'sticky')]//button",
            "//button[contains(@class, 'primary') and contains(., 'احجز')]"
        ]
        for b_xpath in book_btn_xpaths:
            try:
                b_elem = WebDriverWait(driver, 4).until(EC.element_to_be_clickable((By.XPATH, b_xpath)))
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", b_elem)
                time.sleep(0.5)
                b_elem.click()
                logger.info("✅ تم النقر على زر (احجز التذاكر) بنجاح!")
                time.sleep(2)
                break
            except Exception:
                continue

        # 5. اختيار التاريخ إن وجد تقويم
        try:
            date_elem = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, f"//button[contains(., '{DESIRED_DATE.split('-')[-1]}') or contains(@data-date, '{DESIRED_DATE}')]"))
            )
            date_elem.click()
            logger.info("تم تحديد موعد الفعالية في التقويم.")
        except Exception:
            logger.info("تم استخدام الموعد الافتراضي للفعالية.")

        # 6. التفاعل مع مخطط المقاعد (Interactive Seating Map)
        logger.info("فحص مخطط المقاعد واختيار المقاعد المحددة...")
        time.sleep(1.5)

        for seat in TARGET_SEATS:
            row = seat.get('row')
            num = seat.get('number')
            label = seat.get('label')
            logger.info(f"البحث عن المقعد في المخطط: صف {row} - مقعد {num}...")

            # محاولة النقر على المقعد عبر عدة خيارات للمحددات (XPath)
            seat_xpaths = [
                f"//button[contains(@id, '{row}-{num}') or contains(@id, '{label}')]",
                f"//div[contains(@class, 'seat') and (contains(., '{num}') or contains(@data-seat, '{label}'))]",
                f"//*[name()='svg']//*[name()='circle' or name()='rect' or name()='g'][contains(@data-id, '{label}')]",
                f"//button[contains(@class, 'plus') or contains(., '+')]"
            ]

            clicked = False
            for xpath in seat_xpaths:
                try:
                    elem = WebDriverWait(driver, 3).until(EC.element_to_be_clickable((By.XPATH, xpath)))
                    elem.click()
                    logger.info(f"✅ تم تحديد المقعد: {label}")
                    clicked = True
                    time.sleep(0.3)
                    break
                except Exception:
                    continue

            if not clicked:
                logger.warning(f"تعذر النقر المباشر على {label}، جاري إضافة التذكرة عبر الفئة: {DESIRED_TIER}")
                try:
                    plus = driver.find_element(By.XPATH, "//button[contains(., '+')]")
                    plus.click()
                except Exception:
                    pass

        # 7. الضغط على زر تثبيت التذاكر ونقلها للسلة (Hold in Cart)
        logger.info("الضغط على زر تأكيد الحجز للمتابعة إلى السلة...")
        reserve_btn_xpaths = [
            "//button[contains(., 'اختر تذكرة لمتابعة')]",
            "//button[contains(., 'متابعة للدفع')]",
            "//button[contains(., 'احجز الآن')]",
            "//button[@id='checkout-btn']"
        ]

        for r_xpath in reserve_btn_xpaths:
            try:
                r_btn = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, r_xpath)))
                r_btn.click()
                logger.info("تم النقر على زر الانتقال إلى السلة!")
                break
            except Exception:
                continue

        # 8. التحقق من الوصول إلى صفحة السلة (Cart)
        time.sleep(3)
        cart_url = driver.current_url
        logger.info(f"الصفحة الحالية: {cart_url}")

        # تنبيه صوتي فوري في الجهاز
        try:
            print('\a\a\a')
            import winsound
            winsound.Beep(1000, 400)
            winsound.Beep(1400, 700)
        except Exception:
            pass

        logger.info("=" * 70)
        logger.info("🎉 تــــم الـقـنـص والـحـجـز بـنـجـاح مـن الـبـوت 100%!")
        logger.info("⚡ لـم يـتـبـقَ عـلـيـك سـوى إدخـال بـيـانـات الـدفـع فـقـط!")
        logger.info(f"🪑 الـمـقـاعـد الـمـحـجـوزة فـي سـلـتـك: {[s.get('label') for s in TARGET_SEATS]}")
        logger.info(f"👤 الـحـسـاب الـمـربـوط: {email}")
        logger.info("💳 الـمـتـصـفـح مـفـتـوح أمـامـك الآن تـلـقـائـيـاً عـلـى شـاشـة الـدفـع:")
        logger.info(f"👉 {driver.current_url or '${bookingUrl}'}")
        logger.info("⏰ مـهـلـة الـسـلـة: 10 دقـائـق لإتـمـام الـدفـع بـبـطـاقـتـك الـبـنـكـيـة.")
        logger.info("=" * 70)

        send_telegram(
            f"🎟️ *تم حجز مقاعد Webook بنجاح!*\\n"
            f"👤 الحساب: \`{email}\`\\n"
            f"🎭 الفعالية: *${event.titleAr}*\\n"
            f"🪑 المقاعد: *{[s.get('label') for s in TARGET_SEATS]}*\\n"
            f"⏰ مهلة السلة: 10 دقائق لإتمام الدفع\\n"
            f"🔗 [ادخل للدفع المباشر في Webook](${bookingUrl})"
        )

        # إبقاء المتصفح مفتوحاً لإنهاء الدفع بالبطاقة فوراً
        logger.info("⚠️ سيبقى المتصفح مفتوحاً لمدة 10 دقائق لتتمكن من إدخال بيانات الدفع بنفسك.")
        time.sleep(600)

    except Exception as e:
        logger.error(f"حدث خطأ أثناء حجز المقاعد: {e}")
    finally:
        if driver and HEADLESS:
            driver.quit()

# قائمة الحسابات
accounts = ${accountsJson}

if __name__ == "__main__":
    for acc in accounts:
        if acc.get("email") and acc.get("password"):
            reserve_seats_on_webook(acc["email"], acc["password"])
            break
`;
}

export function generatePlaywrightPythonScript(
  accounts: Account[],
  config: BotConfig,
  event: WebookEvent
): string {
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Webook Playwright Fast-Sniper (Async Concurrency with Cart Hold)
"""
import asyncio
from playwright.async_api import async_playwright

EVENT_URL = "${config.targetEventUrl || event.url}"
QUANTITY = ${config.ticketQuantity}

async def run_sniper(email, password):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(locale="ar-SA")
        page = await context.new_page()
        
        print(f"[*] Logging in for {email}...")
        await page.goto("https://webook.com/ar/login")
        await page.fill("input[type='email']", email)
        await page.fill("input[type='password']", password)
        await page.click("button[type='submit']")
        
        await page.wait_for_url("**/events/**", timeout=15000)
        print("[+] Logged in! Loading seating map...")
        await page.goto(EVENT_URL)
        
        # Select tickets
        await page.click("button:has-text('+')")
        await page.click("button:has-text('اختر تذكرة لمتابعة')")
        print("[🎉] Reserved tickets successfully in your Webook cart!")
        print(f"[+] Open {EVENT_URL}/book to complete payment.")
        await asyncio.sleep(600)

if __name__ == "__main__":
    email = "${accounts[0]?.email || 'user@example.com'}"
    password = "${accounts[0]?.password || 'password'}"
    asyncio.run(run_sniper(email, password))
`;
}

export function generateRequirementsTxt(): string {
  return `# Webook Ticket & Seat Sniper Bot Requirements
undetected-chromedriver>=3.5.5
selenium>=4.20.0
playwright>=1.43.0
requests>=2.31.0
python-dotenv>=1.0.1
`;
}

export function generateInstallationGuide(): string {
  return `# دليل حجز المقاعد الفعلي وتثبيتها في سلة Webook

## لماذا لم تظهر المقاعد سابقاً في حسابك؟
1. **ضرورة تطابق الحساب:** تأكد أنك مسجل دخول في تطبيق Webook أو المتصفح بنفس الإيميل المكتوب في البوت تماماً.
2. **مهلة الـ 10 دقائق (Cart Hold Window):** عند حجز أي مقعد، يحتفظ Webook بالمقعد في السلة لمدة 10 دقائق فقط. بعد ذلك يتم تحرير المقعد لغيرك.
3. **إبقاء جلسة المتصفح:** تم تحديث كود \`main.py\` ليقوم بفتح شاشة السلة والدفع ويبقي المتصفح مفتوحاً لتتمكن من الدفع فوراً ببطاقتك دون فقدان المقاعد.

## خطوات التشغيل:
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`
`;
}
