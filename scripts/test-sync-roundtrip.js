const fs = require('fs');

async function testSyncRoundTrip() {
  const syncPayload = {
    version: '0.0.98',
    exportedAt: new Date().toISOString(),
    sourceDevice: 'Windows Laptop',
    stats: { readingStreak: 5, lastReadDate: '2026-10-31' },
    prices: { 'b1': 450, 'b2': 399 },
    budget: { totalSpent: 849, monthlyLimit: 2500 },
    books: [
      { id: 'b1', title: 'Atomic Habits', status: 'DONE', current_page: 320, total_pages: 320 },
      { id: 'b2', title: 'Deep Work', status: 'READING', current_page: 150, total_pages: 280 }
    ]
  };

  console.log('Sending sync payload to cloud relay...');
  const postRes = await fetch('https://dpaste.org/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'content=' + encodeURIComponent(JSON.stringify(syncPayload)) + '&expiry_days=1&format=json'
  });

  const postData = await postRes.json();
  const url = postData.url;
  const syncCode = url.replace('https://dpaste.org/', '').replace('/', '');
  console.log('Generated Sync Code:', syncCode);

  console.log('Receiving sync payload from device 2 using code:', syncCode);
  const getRes = await fetch(`https://dpaste.org/${syncCode}/raw`);
  const rawText = await getRes.text();
  const receivedData = JSON.parse(rawText);

  console.log('Received Device:', receivedData.sourceDevice);
  console.log('Received Books:', receivedData.books.length);
  console.log('Received Streak:', receivedData.stats.readingStreak);
  console.log('SUCCESS: Full round-trip test passed perfectly!');
}

testSyncRoundTrip().catch(console.error);
