const ONES: Record<string, number> = {
  صفر: 0,
  یک: 1,
  دو: 2,
  سه: 3,
  چهار: 4,
  پنج: 5,
  شش: 6,
  هفت: 7,
  هشت: 8,
  نه: 9,
};

const TEENS: Record<string, number> = {
  ده: 10,
  یازده: 11,
  دوازده: 12,
  سیزده: 13,
  چهارده: 14,
  پانزده: 15,
  شانزده: 16,
  هفده: 17,
  هجده: 18,
  نوزده: 19,
};

const TENS: Record<string, number> = {
  بیست: 20,
  سی: 30,
  چهل: 40,
  پنجاه: 50,
  شصت: 60,
  هفتاد: 70,
  هشتاد: 80,
  نود: 90,
};

const HUNDREDS: Record<string, number> = {
  صد: 100,
  دویست: 200,
  سیصد: 300,
  چهارصد: 400,
  پانصد: 500,
  ششصد: 600,
  هفتصد: 700,
  هشتصد: 800,
  نهصد: 900,
};

const COLLOQUIAL: Record<string, string> = {
  چلو: "چهل",
  چل: "چهل",
  نوهد: "نود",
  شست: "شصت",
  شیش: "شش",
  چار: "چهار",
  چارده: "چهارده",
  پونزده: "پانزده",
  شونزده: "شانزده",
  هیجده: "هجده",
  نونزده: "نوزده",
  پونصد: "پانصد",
  چارصد: "چهارصد",
  سو: "سه",
};

const AMBIGUOUS: Record<string, string> = {
  صف: "صفر",
  سر: "صد",
  سد: "صد",
  نو: "نه",
  یه: "یک",
};

const UNITS = new Set([
  "ساله",
  "سال",
  "سالش",
  "سالشه",
  "سانت",
  "سانتی",
  "سانتیمتر",
  "کیلو",
  "کیلوگرم",
]);

function isStrong(word: string) {
  return word in TEENS || word in TENS || word in HUNDREDS || word === "هزار" || word === "صفر";
}

function valueOf(word: string) {
  if (word in HUNDREDS) return HUNDREDS[word];
  if (word in TENS) return TENS[word];
  if (word in TEENS) return TEENS[word];
  if (word in ONES) return ONES[word];
  return undefined;
}

function stemToken(raw: string) {
  const word = raw.replace(/[.,،؛:!?؟«»"'()]/g, "");
  if (!word) return "";
  if (word.length > 2 && word.endsWith("ه")) {
    const bare = COLLOQUIAL[word.slice(0, -1)] ?? word.slice(0, -1);
    if (valueOf(bare) != null || bare === "صفر" || bare === "هزار" || bare === "کیلو" || bare === "سانت" || bare === "سانتی") {
      return bare;
    }
  }
  return COLLOQUIAL[word] ?? word;
}

function heardAsNumber(tokens: string[], index: number) {
  const word = tokens[index];
  const next = tokens[index + 1];
  const prev = tokens[index - 1];
  if (word === "سر" || word === "سد") {
    if (next === "و") return isStrong(tokens[index + 2] ?? "");
    return Boolean(next && isStrong(next)) || prev === "نو" || prev === "نه" || (prev != null && prev in ONES && prev !== "صفر" && prev !== "یه");
  }
  if (word === "صف") {
    if (next === "و") return isStrong(tokens[index + 2] ?? "");
    return next === "نو" || next === "نه" || Boolean(next && (isStrong(next) || next in ONES));
  }
  if (word === "نو") {
    if (next === "و") return isStrong(tokens[index + 2] ?? "");
    return next === "سد" || next === "سر" || next === "صد" || next === "هزار" || prev === "صف" || prev === "صفر";
  }
  if (word === "یه") {
    if (next === "و") return isStrong(tokens[index + 2] ?? "");
    return next === "صد" || next === "هزار" || prev === "و" || prev === "صف" || prev === "صفر" || Boolean(next && isStrong(next));
  }
  return false;
}

function resolve(tokens: string[], index: number) {
  const word = tokens[index] ?? "";
  if (word in AMBIGUOUS && heardAsNumber(tokens, index)) return AMBIGUOUS[word];
  return word;
}

function canStart(tokens: string[], index: number) {
  const word = resolve(tokens, index);
  if (!word) return false;
  if (isStrong(word)) return true;
  if (!(word in ONES) || word === "صفر") return false;
  const next = resolve(tokens, index + 1);
  const prev = index > 0 ? resolve(tokens, index - 1) : "";
  if (next === "صد" || next === "هزار" || next === "و" || prev === "و") return true;
  return UNITS.has(tokens[index + 1] ?? "");
}

function readOneNumber(tokens: string[], start: number) {
  if (!canStart(tokens, start)) return null;
  let index = start;
  let current = 0;
  let saw = false;

  while (index < tokens.length) {
    const word = resolve(tokens, index);
    if (word === "و") {
      const upcoming = resolve(tokens, index + 1);
      const after = resolve(tokens, index + 2);
      const continues = valueOf(upcoming) != null || (upcoming in ONES && upcoming !== "صفر" && (after === "صد" || after === "هزار"));
      if (!saw || !continues) break;
      index += 1;
      continue;
    }

    const ones = ONES[word];
    const next = resolve(tokens, index + 1);
    if (ones != null && ones > 0 && (next === "صد" || next === "هزار")) {
      if (saw && tokens[index - 1] !== "و") break;
      current += ones * (next === "هزار" ? 1000 : 100);
      index += 2;
      saw = true;
      continue;
    }

    const value = valueOf(word);
    if (value == null) break;
    if (value === 0) {
      if (saw) break;
      return { value: 0, end: index + 1 };
    }
    if (saw && tokens[index - 1] !== "و") {
      const continues =
        current !== 0 &&
        ((value < 10 && current % 10 === 0) || (value >= 10 && value < 100 && current % 100 === 0));
      if (!continues) break;
    }
    current += value;
    saw = true;
    index += 1;
  }

  if (!saw || index === start) return null;
  return { value: current, end: index };
}

/** عددهای گفتاری، حتی با تلفظ عامیانه، به رقم تبدیل می‌شوند. تکه‌های پشت‌سرهم موبایل به هم می‌چسبند. */
export function embedSpokenNumbers(text: string) {
  const tokens = text.split(" ").map(stemToken).filter(Boolean);
  const output: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    const groups: string[] = [];
    let cursor = index;
    while (cursor < tokens.length) {
      const group = readOneNumber(tokens, cursor);
      if (!group) break;
      groups.push(String(group.value));
      cursor = group.end;
    }
    if (groups.length === 0) {
      output.push(tokens[index]);
      index += 1;
      continue;
    }
    output.push(groups.join(""));
    index = cursor;
  }
  return output.join(" ");
}
