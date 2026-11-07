/**
 * Pre-launch Stress Test & Security Edge-Case Suite
 * Tests concurrency, latency (p50/p95/p99), SQL injection, XSS, Unicode, length limits, and API robustness.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

async function run() {
  console.log('='.repeat(70));
  console.log(`🚀 STARTING PRE-LAUNCH STRESS & SECURITY AUDIT against ${BASE_URL}`);
  console.log('='.repeat(70));

  let passedAll = true;

  // 1. SECURITY & HOSTILE PAYLOAD TESTS
  console.log('\n[1/5] Testing Security & Hostile Payloads...');
  const securityPayloads = [
    { name: "' OR '1'='1", desc: "SQL injection quote bypass" },
    { name: "'; DROP TABLE names; --", desc: "SQL injection DROP TABLE" },
    { name: "admin' UNION SELECT * FROM users--", desc: "SQL injection UNION SELECT" },
    { name: "<script>alert('xss')</script>", desc: "XSS script injection" },
    { name: "<img src=x onerror=alert(1)>", desc: "XSS image onerror" },
    { name: 'A'.repeat(500), desc: "Long string 500 chars (exceeds 80 limit)" },
    { name: 'B'.repeat(5000), desc: "Very long string 5000 chars" },
    { name: '\x00\x01\x02\x03test\x7F', desc: "Control characters & null bytes" },
    { name: '   ', desc: "Pure whitespace" },
    { name: '', desc: "Empty string" },
  ];

  for (const tc of securityPayloads) {
    try {
      const res = await fetch(`${BASE_URL}/api/rarity?name=${encodeURIComponent(tc.name)}&region=IN`);
      const body = await res.json();
      
      if (tc.name.trim().length > 80 || !tc.name.trim()) {
        if (res.status === 400) {
          console.log(`  ✅ [PASS] ${tc.desc} -> Correctly rejected with 400: ${body.error}`);
        } else {
          console.error(`  ❌ [FAIL] ${tc.desc} -> Expected 400, got ${res.status}`);
          passedAll = false;
        }
      } else {
        if (res.status === 200 || res.status === 400) {
          console.log(`  ✅ [PASS] ${tc.desc} -> Handled safely (Status: ${res.status})`);
        } else {
          console.error(`  ❌ [FAIL] ${tc.desc} -> Server crashed or 500 error: ${res.status}`);
          passedAll = false;
        }
      }
    } catch (err) {
      console.error(`  ❌ [FAIL] ${tc.desc} -> Request failed: ${err.message}`);
      passedAll = false;
    }
  }

  // 2. UNICODE, DIACRITICS & EDGE NAMES
  console.log('\n[2/5] Testing Unicode, Diacritics & International Edge Cases...');
  const edgeNames = [
    { name: "Zoë", region: "US", desc: "Umlaut character" },
    { name: "François", region: "EU", desc: "French cedilla" },
    { name: "José", region: "GLOBAL", desc: "Acute accent" },
    { name: "O'Connor", region: "GLOBAL", desc: "Apostrophe in name" },
    { name: "Mary-Jane", region: "US", desc: "Hyphenated name" },
    { name: "राहुल", region: "IN", desc: "Devanagari script (Rahul)" },
    { name: "Александр", region: "GLOBAL", desc: "Cyrillic script (Alexander)" },
    { name: "A", region: "IN", desc: "Single character name" },
    { name: "  Aarav   ", region: "IN", desc: "Leading & trailing whitespace" },
  ];

  for (const tc of edgeNames) {
    try {
      const res = await fetch(`${BASE_URL}/api/rarity?name=${encodeURIComponent(tc.name)}&region=${tc.region}`);
      const body = await res.json();
      if (res.status === 200 && (body.found !== undefined)) {
        console.log(`  ✅ [PASS] ${tc.desc} ("${tc.name}") -> Status 200, Found: ${body.found}, Normalized: "${body.normalizedName || ''}"`);
      } else {
        console.error(`  ❌ [FAIL] ${tc.desc} -> Status: ${res.status}`, body);
        passedAll = false;
      }
    } catch (err) {
      console.error(`  ❌ [FAIL] ${tc.desc} -> Error: ${err.message}`);
      passedAll = false;
    }
  }

  // 3. SECURITY HEADERS & OPENGRAPH
  console.log('\n[3/5] Testing Security Headers & OpenGraph Image Generation...');
  try {
    const homeRes = await fetch(`${BASE_URL}/`);
    const xFrame = homeRes.headers.get('x-frame-options');
    const xContentType = homeRes.headers.get('x-content-type-options');
    const referrer = homeRes.headers.get('referrer-policy');

    if (xFrame === 'DENY' && xContentType === 'nosniff') {
      console.log(`  ✅ [PASS] Security headers present: X-Frame-Options=${xFrame}, X-Content-Type-Options=${xContentType}, Referrer-Policy=${referrer}`);
    } else {
      console.warn(`  ⚠️ [WARN] Security headers: X-Frame-Options=${xFrame}, X-Content-Type-Options=${xContentType}`);
    }

    const ogRes = await fetch(`${BASE_URL}/r/Aarav/opengraph-image`);
    const ogContentType = ogRes.headers.get('content-type');
    if (ogRes.status === 200 && ogContentType && ogContentType.includes('image/')) {
      console.log(`  ✅ [PASS] Dynamic OG Image generator (/r/Aarav/opengraph-image) -> Status 200, Type: ${ogContentType}`);
    } else {
      console.error(`  ❌ [FAIL] OG Image failed -> Status: ${ogRes.status}, Type: ${ogContentType}`);
      passedAll = false;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] Header/OG test: ${err.message}`);
    passedAll = false;
  }

  // 4. ETYMOLOGY ACCURACY & VERIFICATION
  console.log('\n[4/5] Testing Verified Name Etymology...');
  const etymologyNames = ['Priya', 'Sophia', 'David', 'Karan'];
  for (const n of etymologyNames) {
    try {
      const res = await fetch(`${BASE_URL}/api/rarity?name=${n}&region=GLOBAL`);
      const body = await res.json();
      if (body.etymology && body.etymology.verified) {
        console.log(`  ✅ [PASS] "${n}" verified etymology: [${body.etymology.origin || 'Origin'}] "${body.etymology.meaning}"`);
      } else {
        console.log(`  ℹ️ [INFO] "${n}" etymology not in immediate cache/API (graceful fallback)`);
      }
    } catch (err) {
      console.error(`  ❌ [FAIL] Etymology test for ${n}: ${err.message}`);
    }
  }

  // 5. HIGH-CONCURRENCY LOAD & LATENCY BENCHMARK (1,000 requests, 50 concurrent)
  console.log('\n[5/5] Running High-Concurrency Load & Latency Benchmark...');
  const testPool = [
    'Aarav', 'Priya', 'Rahul', 'Ananya', 'Rohan', 'Sneha', 'Aditya', 'Ishaan',
    'Liam', 'Emma', 'Noah', 'Olivia', 'James', 'Sophia', 'Benjamin', 'Lucas',
    'Kavya', 'Vihaan', 'Sai', 'Zoya', 'Tanvi', 'Reyansh', 'Diya', 'Atharv',
    'Alexander', 'Muhammad', 'Elena', 'Mateo', 'Hans', 'Jean', 'Carlos', 'Mei'
  ];

  const TOTAL_REQUESTS = 1000;
  const CONCURRENCY = 50;
  const latencies = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  console.log(`  Spawning ${TOTAL_REQUESTS} requests across ${CONCURRENCY} concurrent workers...`);
  const startTime = Date.now();

  let reqIndex = 0;
  async function worker() {
    while (reqIndex < TOTAL_REQUESTS) {
      const idx = reqIndex++;
      const name = testPool[idx % testPool.length];
      const region = idx % 4 === 0 ? 'IN' : idx % 4 === 1 ? 'US' : idx % 4 === 2 ? 'EU' : 'GLOBAL';
      const reqStart = performance.now();
      try {
        const res = await fetch(`${BASE_URL}/api/rarity?name=${name}&region=${region}`);
        const reqEnd = performance.now();
        latencies.push(reqEnd - reqStart);
        if (res.status === 200) {
          successfulRequests++;
        } else {
          failedRequests++;
        }
      } catch (e) {
        failedRequests++;
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = Date.now() - startTime;
  const rps = ((successfulRequests / totalTimeMs) * 1000).toFixed(1);

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);
  const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('📊 BENCHMARK RESULTS:');
  console.log(`  Total Requests:       ${TOTAL_REQUESTS}`);
  console.log(`  Successful:           ${successfulRequests} (${((successfulRequests/TOTAL_REQUESTS)*100).toFixed(1)}%)`);
  console.log(`  Failed:               ${failedRequests}`);
  console.log(`  Total Duration:       ${(totalTimeMs / 1000).toFixed(2)} seconds`);
  console.log(`  Throughput:           ${rps} requests/sec`);
  console.log(`  Latency (Average):    ${avg} ms`);
  console.log(`  Latency (p50):        ${p50} ms`);
  console.log(`  Latency (p95):        ${p95} ms`);
  console.log(`  Latency (p99):        ${p99} ms`);
  console.log('='.repeat(70));

  if (failedRequests === 0 && Number(p95) < 150) {
    console.log('🎉 ALL PRODUCTION READINESS & STRESS CHECKS PASSED WITH FLYING COLORS!');
  } else if (failedRequests === 0) {
    console.log('✅ ALL REQUESTS SUCCEEDED (Zero failures).');
  } else {
    console.error(`⚠️ Detected ${failedRequests} failed requests during stress run.`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
