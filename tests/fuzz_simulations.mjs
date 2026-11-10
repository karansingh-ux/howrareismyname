/**
 * High-Throughput Simulation & Fuzz Testing Suite (1,000+ test cases)
 * Target: http://localhost:3000
 * Uses a concurrent worker pool (concurrency = 15) to execute 1,000+ test simulations swiftly.
 */

import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const CONCURRENCY = 15;

const categories = {
  // 1. Accented / Diacritic Latin Names (European & Global)
  diacritics: [
    'Renée', 'José', 'François', 'Søren', 'Müller', 'Zoë', 'Noël', 'Chloë',
    'André', 'Inês', 'Hélène', 'Björn', 'Jürgen', 'Siobhán', 'Álvaro', 'Léa',
    'Māris', 'Kārlis', 'Łukasz', 'Michał', 'Agnieszka', 'Paweł', 'Göran', 'Åsa',
    'Benoît', 'Loïc', 'Käthe', 'Jérôme', 'Amélie', 'Cédric', 'Gaël'
  ],

  // 2. Cultural Punctuation & Compound Names
  punctuationCompound: [
    "O'Connor", "D'Souza", "N'Golo", "M'Baku", "d'Artagnan",
    "Mary-Jane", "Jean-Luc", "Anne-Marie", "Dev-Anand", "Al-Mansoor",
    "Abu-Bakr", "Ibn-Battuta", "McDonald", "MacDonald", "De La Cruz",
    "Van Der Bilt", "St. John", "O’Neill", "D’Angelo", "Al-Fayed",
    "Jean-Paul", "Smith-Jones", "O'Reilly", "D'Angelo"
  ],

  // 3. Indian Language Scripts (Devanagari, Tamil, Telugu, Bengali, Gurmukhi, Gujarati)
  indicScripts: [
    'करण', 'राहुल', 'प्रिया', 'अमित', 'सुनीता', 'रोहित', 'अंजलि', 'दीपक',
    'कबीर', 'विकास', 'संजय', 'पूजा',
    'கரன்', 'பிரியா', 'முருகன்', 'செல்வி', 'கார்த்திக்',
    'కరణ్', 'ప్రియ', 'రాహుల్', 'సురేష్', 'వెంకట్',
    'করণ', 'রাহুল', 'প্রিয়া', 'অমিত', 'দেব',
    'ਕਰਨ', 'ਸਿੰਘ', 'ਪ੍ਰੀਤ', 'ਕੌਰ', 'ਹਰਪ੍ਰੀਤ',
    'કરણ', 'પટેલ', 'દિપક', 'ભાવના', 'જિગ્નેશ'
  ],

  // 4. International Scripts (Arabic, Cyrillic, Chinese, Japanese, Korean, Greek, Hebrew)
  internationalScripts: [
    'محمد', 'فاطمة', 'علي', 'أحمد', 'نور', 'عمر',
    'Александр', 'Елена', 'Дмитрий', 'Ольга', 'Иван', 'Сергей',
    '李雷', '王伟', '张伟', '陈静', '刘洋',
    'たろう', 'はなこ', 'けんじ', 'さくら',
    '민준', '서연', '도윤', '하은',
    'Γιώργος', 'Ελένη', 'Νίκος', 'Μαρία',
    'דוד', 'שרה', 'יוסף', 'רחל'
  ],

  // 5. Titles, Honorifics & Prefixes
  honorifics: [
    'Dr. Karan', 'Dr Karan', 'Mr. Sharma', 'Mr Rajesh', 'Mrs. Gupta',
    'Ms. Priya', 'Prof. Verma', 'Colonel Singh', 'Captain Miller',
    'Sir Alex', 'Lady Gaga', 'Sheikh Mohammed', 'Shri Narendra',
    'Smt. Indira', 'Pandit Ravi', 'Ustad Zakir', 'Lord Krishna', 'Saint John',
    'Master Bruce', 'King Charles', 'Queen Elizabeth', 'Prince William'
  ],

  // 6. Extreme Whitespace & Multi-Word Full Names
  whitespaceAndFullNames: [
    '  Karan  ', 'Karan   ', '   Karan', '\tKaran\t', '\nKaran\n',
    'Karan Singh', 'Karan Singh Chauhan', 'Mohammad Azharuddin Ansari',
    'Mary Jane Watson Parker', 'Karan\tSingh', 'Karan\nSingh',
    'Karan  \t  Singh', 'Karan\u00A0Singh',
    'Karan\u200BSingh', 'Karan\u200CSingh', 'Karan\u200DSingh', 'Karan\u200E',
    'John Doe', 'Jean Claude Van Damme', 'Alexander The Great'
  ],

  // 7. Length Extremes & Boundary Sizes
  lengthBoundaries: [
    'A', 'K', 'X', '1', '!',
    'Om', 'Al', 'Bo', 'Ed', 'Jo', 'Li', 'Ty', 'An', 'Ek', 'Pi',
    'Christopher', 'Bartholomew', 'Constantinople', 'Alexandros',
    'Wolfeschlegelsteinhausenbergerdorff',
    'A'.repeat(50), 'A'.repeat(79), 'A'.repeat(80), 'A'.repeat(81),
    'A'.repeat(100), 'A'.repeat(255), 'A'.repeat(1000)
  ],

  // 8. Reserved Words, JS Keywords & Type Casting Traps
  reservedWords: [
    'null', 'undefined', 'NaN', 'true', 'false', '0', '-1', 'Infinity',
    '[object Object]', 'constructor', 'prototype', '__proto__',
    'hasOwnProperty', 'toString', 'valueOf', 'default', 'void',
    'function', 'return', 'yield', 'async', 'await', 'import', 'export',
    'isPrototypeOf', 'propertyIsEnumerable'
  ],

  // 9. SQL Injection, Path Traversal, Format Strings & Script Payloads
  injectionPayloads: [
    "'", "''", '"', '`', ';', '--', '/*', '*/',
    "' OR '1'='1", "' OR '1'='1' --", "admin' --",
    "'; DROP TABLE names; --", "'; DROP TABLE names_us; --",
    "UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12--",
    "../../../../etc/passwd", "..%2f..%2f..%2f",
    "<script>alert(1)</script>", "<img src=x onerror=alert(1)>",
    "javascript:alert(1)", "${7*7}", "{{7*7}}",
    "%00", "%20", "%2e%2e%2f", "\\0", "\\x00",
    "SELECT * FROM names WHERE 1=1", "SLEEP(5)"
  ],

  // 10. Numbers, Alphanumeric & Leetspeak
  numbersAndLeet: [
    '007', '12345', '777', 'Karan2', 'K4ran', 'R4hul', 'Pr1ya',
    'ElonMuskX12', 'X-AE-A-12', 'Karan_99', '2pac', '50cent',
    '3D', '4k', 'V2', 'K@ran', 'P#iya', 'S$m', '100%', 'No.1'
  ],

  // 11. Emojis, Symbols & Non-Text Graphics
  emojisAndSymbols: [
    '👑', '❤️', '🔥', '✨Karan✨', 'Karan 🙏', '🚀 Space', 'Karan #1',
    'Karan 🇮🇳', '🇺🇸 Sam', '✨', '⚡', '💯', '😊', '🎉', '🌟',
    '#@!$%', '???', '...', '---', '***', '===', '___',
    '🧿', '🕉️', '☬', '✝️', '☪️', '✡️'
  ],

  // 12. Phonetic Variants & Custom Spellings across Regions
  phoneticVariants: [
    'Karan', 'Karanveer', 'Karran', 'Karon', 'Karin',
    'Jenal', 'Jeanal', 'Jeanel', 'Jinal', 'Jeenal',
    'Rahul', 'Raaahul', 'Rahool', 'Raahul',
    'Vikram', 'Wickram', 'Vickram', 'Bikram',
    'Pooja', 'Puja', 'Poojah',
    'Rishi', 'Hrishi', 'Richi',
    'Siddharth', 'Sidharth', 'Siddhartha',
    'Aarav', 'Arav', 'Ahrav',
    'Mohammed', 'Muhammad', 'Mohamad', 'Mohammad', 'Muhammed',
    'Ayesha', 'Aisha', 'Ayisha',
    'Gaurav', 'Gourav', 'Gorav',
    'Ananya', 'Ananyaa', 'Annanya',
    'Deepak', 'Dipak', 'Dheepak',
    'Kavita', 'Kaveeta', 'Kavitha'
  ],

  // 13. Common Real-World Names across All Regions
  diverseNames: [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer',
    'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara',
    'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
    'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
    'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily',
    'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy',
    'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
    'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca'
  ]
};

async function testFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    let body = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, headers: res.headers, body };
  } catch (err) {
    clearTimeout(timeout);
    return { status: 0, error: err.message };
  }
}

async function runPool(tasks, concurrency) {
  let index = 0;
  const results = [];
  async function worker() {
    while (index < tasks.length) {
      const cur = index++;
      try {
        const res = await tasks[cur]();
        results[cur] = res;
      } catch (err) {
        results[cur] = { error: err.message };
      }
    }
  }
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('====================================================');
  console.log('🚀 EXECUTING 1,000+ SIMULATIONS ON LOCAL WEBSITE');
  console.log(`Target: ${BASE_URL} | Concurrency: ${CONCURRENCY}`);
  console.log('====================================================\n');

  const stats = {
    total: 0,
    passed: 0,
    errors500: 0,
    errors400: 0,
    errors404: 0,
    otherStatus: 0,
    crashes: 0,
    anomalies: []
  };

  const tasks = [];

  function recordAnomaly(category, subType, input, detail) {
    stats.anomalies.push({ category, subType, input, detail });
  }

  // 1. Build tasks for /api/rarity
  for (const [catName, list] of Object.entries(categories)) {
    for (const name of list) {
      for (const region of ['IN', 'US', 'EU', 'GLOBAL']) {
        tasks.push(async () => {
          stats.total++;
          const encName = encodeURIComponent(name);
          const url = `${BASE_URL}/api/rarity?name=${encName}&region=${region}`;
          const res = await testFetch(url);

          if (res.status === 500) {
            stats.errors500++;
            recordAnomaly(catName, 'API_500_CRASH', { name, region }, `Internal Server Error: ${JSON.stringify(res.body)}`);
          } else if (res.status === 400) {
            stats.errors400++;
            if (name.length <= 80 && name.trim().length > 0) {
              recordAnomaly(catName, 'API_400_REJECTION', { name, region }, `Returned 400 for input: ${JSON.stringify(res.body)}`);
            }
          } else if (res.status === 200) {
            stats.passed++;
            const data = res.body;
            if (typeof data === 'object' && data !== null) {
              // Check empty display
              if (!data.name || data.name.trim() === '') {
                recordAnomaly(catName, 'EMPTY_NAME_OUTPUT', { name, region }, `Returned empty name: ${JSON.stringify(data)}`);
              }
              // Normalization stripped non-latin completely
              if (data.normalizedName === '' && name.trim().length > 0) {
                recordAnomaly(catName, 'NORMALIZATION_STRIPPED_ALL', { name, region }, `Input "${name}" produced empty normalizedName`);
              }
              // Diacritic drop (e.g. Renée -> ren)
              if (catName === 'diacritics' && data.normalizedName && !data.normalizedName.includes('e') && name.includes('é')) {
                recordAnomaly(catName, 'DIACRITIC_LOSS', { name, region }, `Normalized "${name}" to "${data.normalizedName}" (dropped accented character)`);
              }
              // Non-Latin script dropped
              if ((catName === 'indicScripts' || catName === 'internationalScripts') && !data.found && data.displayStatistic?.includes('Please enter a valid first name')) {
                recordAnomaly(catName, 'SCRIPT_UNSUPPORTED', { name, region }, `Native script input "${name}" rejected as invalid name`);
              }
              // Honorific title swallowed
              if (catName === 'honorifics' && data.name && data.name.toLowerCase() === 'dr' && name.includes('Karan')) {
                recordAnomaly(catName, 'TITLE_OVERRIDE', { name, region }, `"Dr. Karan" evaluated as name "${data.name}" instead of "Karan"`);
              }
            }
          } else if (res.status === 0) {
            stats.crashes++;
            recordAnomaly(catName, 'CONNECTION_FAIL', { name, region }, res.error);
          } else {
            stats.otherStatus++;
            recordAnomaly(catName, `STATUS_${res.status}`, { name, region }, JSON.stringify(res.body));
          }
        });
      }
    }
  }

  // 2. Build tasks for Regional Fuzzing
  const regionFuzzList = [
    '', 'IN', 'US', 'EU', 'GLOBAL', 'in', 'us', 'eu', 'global',
    'FR', 'DE', 'UK', 'JP', 'XYZ', '123', '<script>', "IN' OR '1'='1",
    '../../etc/passwd', 'null', 'undefined', '%00', '%20', 'A'.repeat(50)
  ];
  for (const reg of regionFuzzList) {
    tasks.push(async () => {
      stats.total++;
      const res = await testFetch(`${BASE_URL}/api/rarity?name=Karan&region=${encodeURIComponent(reg)}`);
      if (res.status === 500) {
        stats.errors500++;
        recordAnomaly('regionFuzzing', 'REGION_500', { region: reg }, JSON.stringify(res.body));
      } else if (res.status === 200) {
        stats.passed++;
      } else {
        stats.otherStatus++;
      }
    });
  }

  // 3. Build tasks for /r/[name] shared routes & OG images
  const sharedSample = [
    'Karan', 'Jenal', 'Jeanal', "O'Connor", 'Mary-Jane', 'Renée',
    'करण', 'محمد', 'A', 'Om', 'Xyzzzy', 'null', 'undefined',
    '<script>alert(1)</script>', "' OR '1'='1", 'Dr. Karan',
    'A'.repeat(80), 'A'.repeat(120), '✨Karan✨', '123',
    'Vikram', 'Pooja', 'Aarav', 'Rahul', 'John', 'Sarah'
  ];
  for (const sName of sharedSample) {
    tasks.push(async () => {
      stats.total++;
      const enc = encodeURIComponent(sName);
      const res = await testFetch(`${BASE_URL}/r/${enc}`);
      if (res.status === 500) {
        stats.errors500++;
        recordAnomaly('sharedPage', 'PAGE_500_CRASH', { name: sName }, 'Shared page SSR crashed');
      } else if (res.status === 200) {
        stats.passed++;
        const html = typeof res.body === 'string' ? res.body : '';
        if (html.includes('<script>alert(1)</script>')) {
          recordAnomaly('sharedPage', 'XSS_INJECTION_LEAK', { name: sName }, 'Raw script tag reflected in HTML!');
        }
      } else if (res.status === 404) {
        stats.errors404++;
      } else {
        stats.otherStatus++;
      }
    });

    tasks.push(async () => {
      stats.total++;
      const enc = encodeURIComponent(sName);
      const ogRes = await testFetch(`${BASE_URL}/r/${enc}/opengraph-image`);
      if (ogRes.status === 500) {
        stats.errors500++;
        recordAnomaly('ogImage', 'OG_IMAGE_500_CRASH', { name: sName }, 'OG Image generator crashed on input');
      } else if (ogRes.status === 200) {
        stats.passed++;
      } else {
        stats.otherStatus++;
        recordAnomaly('ogImage', `OG_STATUS_${ogRes.status}`, { name: sName }, JSON.stringify(ogRes.body));
      }
    });
  }

  // 4. Build tasks for Secondary APIs
  const subscribeEmails = [
    '', '   ', 'notanemail', 'test@', '@domain.com', 'test@domain',
    'karan@gmail.com', 'test.valid+tag@company.co.in',
    "admin' --@evil.com", "'; DROP TABLE subscribers; --@evil.com",
    '<script>@x.com', 'a'.repeat(255) + '@gmail.com', 'a'.repeat(1000) + '@gmail.com',
    null, 12345
  ];
  for (const em of subscribeEmails) {
    tasks.push(async () => {
      stats.total++;
      const res = await testFetch(`${BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, name: 'Karan', region: 'IN' })
      });
      if (res.status === 500) {
        stats.errors500++;
        recordAnomaly('subscribeApi', 'SUBSCRIBE_500', { email: em }, JSON.stringify(res.body));
      } else if (res.status === 200 || res.status === 400) {
        stats.passed++;
      } else {
        stats.otherStatus++;
      }
    });
  }

  // Analytics tests
  const analyticsEvents = [
    {}, { eventName: 'test' },
    { eventName: "' OR 1=1; --", sessionId: "' DROP TABLE analytics; --" },
    { eventName: 'name_submitted', metadata: { deep: { nested: { array: [1, 2, 3] } } } },
    { eventName: 'A'.repeat(500) }
  ];
  for (const ev of analyticsEvents) {
    tasks.push(async () => {
      stats.total++;
      const res = await testFetch(`${BASE_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev)
      });
      if (res.status === 500) {
        stats.errors500++;
        recordAnomaly('analyticsApi', 'ANALYTICS_500', ev, JSON.stringify(res.body));
      } else {
        stats.passed++;
      }
    });
  }

  // Leaderboard tests
  const leaderboardList = [
    '', '?region=IN', '?region=US', '?region=EU', '?region=GLOBAL',
    '?region=INVALID', "?region=' OR 1=1 --", '?limit=10', '?limit=999999',
    '?limit=-1', '?limit=abc'
  ];
  for (const lb of leaderboardList) {
    tasks.push(async () => {
      stats.total++;
      const res = await testFetch(`${BASE_URL}/api/leaderboard${lb}`);
      if (res.status === 500) {
        stats.errors500++;
        recordAnomaly('leaderboardApi', 'LEADERBOARD_500', { lb }, JSON.stringify(res.body));
      } else {
        stats.passed++;
      }
    });
  }

  console.log(`Prepared ${tasks.length} simulation tasks. Executing across ${CONCURRENCY} workers...\n`);

  const startTime = Date.now();
  await runPool(tasks, CONCURRENCY);
  const durationMs = Date.now() - startTime;

  console.log('====================================================');
  console.log('📊 SIMULATION & STRESS TEST SUMMARY');
  console.log('====================================================');
  console.log(`Total Simulations Executed : ${stats.total}`);
  console.log(`Successful Responses       : ${stats.passed}`);
  console.log(`400 Client Rejections      : ${stats.errors400}`);
  console.log(`404 Not Found              : ${stats.errors404}`);
  console.log(`500 Server Errors (Crashes): ${stats.errors500}`);
  console.log(`Other Status Codes         : ${stats.otherStatus}`);
  console.log(`Connection Drops / Timeouts: ${stats.crashes}`);
  console.log(`Execution Duration         : ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`Total Anomalies Detected   : ${stats.anomalies.length}`);
  console.log('====================================================\n');

  // Group anomalies
  const grouped = {};
  for (const a of stats.anomalies) {
    const key = `${a.category} :: ${a.subType}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  }

  console.log('--- DETAILED ANOMALIES BREAKDOWN ---');
  for (const [key, items] of Object.entries(grouped)) {
    console.log(`\n🔴 [${key}] (${items.length} occurrences)`);
    console.log(`Sample: Input=${JSON.stringify(items[0].input)} -> Detail: ${items[0].detail}`);
  }

  fs.writeFileSync('tests/fuzz_results.json', JSON.stringify({ stats, grouped, anomalies: stats.anomalies }, null, 2));
  console.log('\nFull results saved to tests/fuzz_results.json');
}

main().catch(console.error);
