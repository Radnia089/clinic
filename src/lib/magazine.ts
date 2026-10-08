import type { MagazineArticle } from "@/lib/types";

export type { MagazineArticle };

export const MAGAZINE_CATEGORIES = [
  "رژیم و تغذیه",
  "خواص مواد غذایی",
  "ورزش و فعالیت",
  "سبک زندگی",
  "دستگاه‌های لاغری",
] as const;

export function sortArticles(items: MagazineArticle[]) {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/gi, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function articleParagraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function defaultArticles(): MagazineArticle[] {
  const now = new Date().toISOString();
  return [
    {
      id: "article-ginger",
      slug: "khawas-zanjabil-baraye-laghari",
      title: "خواص بی‌نظیر زنجبیل برای لاغری",
      excerpt:
        "زنجبیل می‌تواند به متابولیسم و احساس سیری کمک کند؛ در کنار رژیم شخصی تندیس، یک مکمل طبیعی مفید است.",
      body: `زنجبیل از دیرباز در طب سنتی برای بهبود گوارش و کاهش التهاب استفاده می‌شده است. امروز هم بسیاری از برنامه‌های لاغری از آن به‌عنوان یک کمک‌کننده طبیعی یاد می‌کنند.

نوشیدن دمنوش زنجبیل قبل از غذا ممکن است به کنترل اشتها کمک کند. البته زنجبیل به‌تنهایی جایگزین رژیم کالری‌کنترل‌شده نیست؛ نتیجه پایدار وقتی می‌آید که تغذیه، حرکت و پیگیری منظم کنار هم باشند.

در کلینیک تندیس، برنامه غذایی بر اساس هدف، سایز و عادت‌های شما تنظیم می‌شود. افزودن ادویه‌هایی مثل زنجبیل می‌تواند پایبندی به رژیم را راحت‌تر و طعم غذاها را جذاب‌تر کند.

اگر بیماری خاصی دارید یا دارو مصرف می‌کنید، قبل از مصرف زیاد زنجبیل با مشاور یا پزشک هماهنگ کنید.`,
      category: "خواص مواد غذایی",
      coverImage: "/images/articles/article-ginger.jpg",
      views: 1280,
      published: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "article-walking",
      slug: "piaderavi-rozane-baraye-kahesh-vazn",
      title: "پیاده‌روی روزانه چقدر در کاهش وزن مؤثر است؟",
      excerpt:
        "پیاده‌روی منظم یکی از ساده‌ترین راه‌ها برای افزایش مصرف کالری و حفظ انگیزه در مسیر لاغری است.",
      body: `برای شروع، روزی ۳۰ تا ۴۵ دقیقه پیاده‌روی با شدت متوسط کافی است. لازم نیست از روز اول سریع بدوید؛ ثبات مهم‌تر از شدت افراطی است.

ترکیب پیاده‌روی با رژیم شخصی باعث می‌شود هم وزن و هم سایز بهتر تغییر کند. اندازه‌گیری دور کمر هر دو هفته یک‌بار، پیشرفت را واقعی‌تر از فقط نگاه‌کردن به ترازو نشان می‌دهد.

اگر زمان محدود دارید، پیاده‌روی را به دو بازه ۱۵ دقیقه‌ای تقسیم کنید. حتی مسیرهای کوتاه روزانه هم در بلندمدت اثر می‌گذارند.

در تندیس، مشاور مسیر تغذیه را با سطح فعالیت شما هماهنگ می‌کند تا کاهش وزن پایدار بماند، نه فقط کوتاه‌مدت.`,
      category: "ورزش و فعالیت",
      coverImage: "/images/articles/article-walking.jpg",
      views: 980,
      published: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "article-portion",
      slug: "kontrol-andaze-ghaza-dar-regime",
      title: "کنترل اندازه غذا؛ کلید پنهان رژیم موفق",
      excerpt:
        "گاهی مشکل رژیم، نوع غذا نیست؛ اندازه پرس‌هاست. با چند عادت ساده می‌توانید کالری را بدون گرسنگی شدید مدیریت کنید.",
      body: `بشقاب خود را نصف سبزیجات، یک‌چهارم پروتئین و یک‌چهارم کربوهیدرات پیچیده پر کنید. این قانون ساده کمک می‌کند بدون شمارش وسواس‌گونه کالری، تعادل داشته باشید.

غذا خوردن آهسته و جویدن کافی، سیگنال سیری را بهتر به مغز می‌رساند. حداقل ۲۰ دقیقه برای هر وعده در نظر بگیرید.

حذف کامل گروه‌های غذایی معمولاً باعث برگشت وزن می‌شود. بهتر است اندازه را تنظیم کنید تا اینکه لیست ممنوعه طولانی بسازید.

مشاوران تندیس برنامه را طوری می‌چینند که هم کاهش وزن بیاورد، هم در زندگی روزمره قابل اجرا باشد.`,
      category: "رژیم و تغذیه",
      coverImage: "/images/articles/article-portion.jpg",
      views: 1560,
      published: true,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
