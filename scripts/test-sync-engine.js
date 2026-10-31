const fs = require('fs');

// Test data
const sampleBooksDevice1 = [
  { id: 'b1', title: 'Atomic Habits', status: 'DONE', current_page: 320, total_pages: 320, price: 450 },
  { id: 'b2', title: 'Deep Work', status: 'READING', current_page: 150, total_pages: 280, price: 399 }
];

const sampleBooksDevice2 = [
  { id: 'b2', title: 'Deep Work', status: 'READING', current_page: 200, total_pages: 280, price: 399 }, // more progress on device 2
  { id: 'b3', title: 'Psychology of Money', status: 'AVAILABLE', current_page: 0, total_pages: 250, price: 299 }
];

// Smart merge function
function smartMergeBooks(localList, incomingList) {
  const merged = [...localList];
  incomingList.forEach(incoming => {
    const existingIdx = merged.findIndex(b => (b.id && b.id === incoming.id) || (b.title && b.title.toLowerCase().trim() === incoming.title.toLowerCase().trim()));
    if (existingIdx >= 0) {
      const existing = merged[existingIdx];
      // Keep highest reading progress
      const maxPage = Math.max(existing.current_page || 0, incoming.current_page || 0);
      const isDone = (existing.status === 'DONE' || incoming.status === 'DONE');
      merged[existingIdx] = Object.assign({}, existing, incoming, {
        current_page: maxPage,
        status: isDone ? 'DONE' : (maxPage > 0 ? 'READING' : existing.status)
      });
    } else {
      merged.push(incoming);
    }
  });
  return merged;
}

const result = smartMergeBooks(sampleBooksDevice1, sampleBooksDevice2);
console.log('Merged total books:', result.length);
console.log('Deep Work page after merge:', result.find(b => b.id === 'b2').current_page);
console.log('Merged books titles:', result.map(b => b.title));
