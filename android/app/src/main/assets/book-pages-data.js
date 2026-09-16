// ==========================================================================
// MIND FOCUS BOOKS • MULTI-LANGUAGE REAL 3D BOOK PAGES DATA
// ==========================================================================

const BOOK_PAGES_DATA = {
  'hyperfocus': {
    bookNo: 'book 1',
    title: 'Hyperfocus: How to Work Less to Achieve More',
    titleHindi: 'हायपरफ़ोकस: कम प्रयास में अधिक सफलता कैसे प्राप्त करें',
    author: 'Chris Bailey (क्रिस बेली)',
    translator: 'अजय तिवारी (Ajay Tiwari)',
    publisher: 'मंजुल पब्लिशिंग हाउस (Manjul Publishing House)',
    isbn: '978-93-5543-300-8',
    barcode: '9789355433008',
    price: 350,
    cover: 'hyperfocus_cover.jpg',
    backCover: 'hyperfocus_back.jpg',
    languages: {
      hindi: {
        name: 'हिंदी (Hindi)',
        code: 'hi',
        flag: '🇮🇳',
        badge: 'हिंदी संस्करण',
        desc: 'शुद्ध हिंदी अनुवाद एवं मूल पृष्ठ',
        pages: [
          {
            pageNo: 1,
            type: 'title',
            heading: 'हायपरफ़ोकस',
            content: `
<div class="reader-title-page">
  <div class="reader-book-main-title">हायपरफ़ोकस</div>
  <div class="reader-book-subtitle">कम प्रयास में अधिक सफलता कैसे प्राप्त करें</div>
  <div class="reader-divider">✦ ✦ ✦</div>
  <div class="reader-book-author-text">क्रिस बेली</div>
  <div class="reader-book-translator-text">अनुवाद : अजय तिवारी</div>
  <div class="reader-publisher-badge">
    <div class="pub-logo-icon">🦅</div>
    <div class="pub-name">मंजुल पब्लिशिंग हाउस</div>
    <div class="pub-sub">MANJUL PUBLISHING HOUSE</div>
  </div>
</div>
`
          },
          {
            pageNo: 2,
            type: 'praise',
            heading: 'पुस्तक की प्रशस्ति',
            content: `
<div class="reader-page-header">पुस्तक की प्रशस्ति</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“जीवन में जो आवश्यक है उसे हासिल करने के लिए हमें दो तरह के फ़ोकस की आवश्यकता है : एक संज्ञा के रूप में फ़ोकस (हमारे निश्चित इरादे) और एक सर्वनाम के रूप में फ़ोकस (बिंदुओं को जोड़ने की निरंतर प्रक्रिया)। इसे क्रिस बेली की इस नवीनतम पुस्तक में लेखन और ग्राफ़िक्स दोनों के ही माध्यम से बहुत ही शानदार तरीक़े से चित्रित किया गया है। मुझे पुस्तक बहुत पसंद आई।”</p>
  <p class="reader-quote-author">— <strong>ग्रेग मैकक्यूवन</strong>, <em>एसेंशियलिज़्म</em> के लेखक</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“व्यवहारिक, अच्छी तरह लिखी गई और सामयिक। क्रिस बेली ने आज के सबसे महत्त्वपूर्ण विषय को उठाया है क्योंकि हम काम में सफलता चाहते हैं और आधुनिक विश्व में बच्चों की सकारात्मक परवरिश का प्रयास करते हैं। आप जिसमें भाग लेते हैं वह आपकी वास्तविकता बन जाता है। यह पुस्तक एक अनुकूलित वास्तविकता बनाने के लिए हमारे ध्यान का उपयोग करने के लिए एक व्यवहारिक पथ प्रदान करती है। यदि हम महान सफलता और खुशी हासिल करना चाहते हैं, तो हमें इस बात पर फ़ोकस करके शुरुआत करनी होगी कि हमारा दिमाग़ किधर ध्यान दे रहा है।”</p>
  <p class="reader-quote-author">— <strong>शॉन एकोर</strong>, <em>द हैप्पीनेस एडवांटेज एंड बिग पोटेंशियल</em> के लेखक</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“यह पुस्तक एक जीवन रेखा है, एक ऐसी दुनिया में जहां पर हम सभी बहुत कुछ करने के लिए व्यग्र हैं और करने के लिए बहुत समय नहीं है। क्रिस बेली की अभूतपूर्व और सामयिक पुस्तक की बदौलत, मुझे लगता है कि मेरे पास अब, वास्तव में इतने वर्षों में पहली बार, सबसे महत्त्वपूर्ण, मूल्य-निर्मित करने वाली चीज़ों पर फ़ोकस करने की क्षमता आ गई है। यदि आप तनाव से राहत पाने के साथ ही अपनी उत्पादकता और ख़ुशी दोनों में बढ़ोतरी करना चाहते हैं तो इस पुस्तक को अवश्य पढ़ें।”</p>
  <p class="reader-quote-author">— <strong>जेम्स सिट्रिन</strong>, <em>करियर प्लेबुक</em> के लेखक</p>
</div>
`
          },
          {
            pageNo: 3,
            type: 'praise',
            heading: 'विश्वप्रसिद्ध विचारकों की राय',
            content: `
<div class="reader-page-header">विश्वप्रसिद्ध विचारकों की राय</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“एक व्यस्त दुनिया में हायपरफ़ोकस्ड होना एक ऐसा कौशल है जिसे हर प्रोफ़ेशनल व्यक्ति अपने पास चाहता है। क्रिस बेली अपनी इस नई पुस्तक में आपको सिखाएंगे कि किस तरह इसमें महारत हासिल की जाए। सारे नवीनतम विज्ञान का उपयोग करके, बेली ने आपको एक व्यवहारिक और शानदार फ़्रेमवर्क दिया है कि किस तरह आप अपने काम के तरीक़े में बदलाव कर सकते हैं।”</p>
  <p class="reader-quote-author">— <strong>वैनेसा वैन एडवर्ड्स</strong>, <em>कैप्टिवेट</em> की लेखिका</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“इस पर कोई सवाल नहीं है : आपका ध्यान (अटेंशन) ही आपकी सबसे महत्त्वपूर्ण संपत्ति है। आपके जीवन की हर वस्तु-जीवन के आपके अनुभव-आपके ध्यान से ही आते हैं। और यह पुस्तक आपको सिखाएगी कि आप इस उपकरण का इस्तेमाल कैसे करें, इसे कैसे निखारें, कैसे इसका लाभ लें और इसका आनंद भी लें। क्रिस बेली की बातों पर ध्यान दें-यह पुस्तक अवश्य पढ़ने लायक़ है।”</p>
  <p class="reader-quote-author">— <strong>पीटर ब्रेगमैन</strong>, <em>18 मिनट्स</em> के लेखक</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“ध्यान 21 वीं सदी की सबसे महत्त्वपूर्ण संपत्ति हो सकता है। यह किताब दशकों की वैज्ञानिक अंतर्दृष्टि का उपयोग करती है और उसे व्यवहारिक अनुप्रयोग के साथ मिलाती है और दिखाती है कि अपने ध्यान का प्रबंधन और उसे कई गुना करना कितना बेहतरीन है।”</p>
  <p class="reader-quote-author">— <strong>डेविड बुरकुस</strong>, <em>अंडर न्यू मैनेजमेंट और फ्रेंड ऑफ़ ए फ्रेंड</em> के लेखक</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“क्रिस बेली की पुस्तक अपने ध्यान का प्रबंधन करने की एक शानदार गाइड है। उन्होंने एक ऐसी विधि का वर्णन किया है जो हमें फ़ोकस करने और अधिक प्रभावी ढंग से रचना करने में मदद करती है। उनकी पुस्तक महज़ एक सिद्धांत नहीं है, बल्कि प्रैक्टिकल और विस्तृत बेहतरीन अभ्यासों का एक शानदार टूलबॉक्स है। मैं इन आइडिया को आज़माने के लिए इंतज़ार नहीं कर सकता।”</p>
  <p class="reader-quote-author">— <strong>काई-फ़ू ली</strong>, <em>गूगल चाइना के संस्थापक, सिनोवेशन वेंचर्स के चेयरमैन एवं सीईओ</em></p>
</div>
`
          },
          {
            pageNo: 4,
            type: 'summary',
            heading: 'पुस्तक का सार (Back Cover)',
            content: `
<div class="reader-page-header">पुस्तक का सार एवं मुख्य दर्शन</div>
<div class="reader-callout-box">
  <p class="reader-lead-text">“रचनात्मक बनने और सार्थक जीवन जीने के लिए आपके पास जो कुछ है, वह ध्यान ही है।”</p>
</div>
<p class="reader-body-para">ध्यान से हमारी उत्पादकता कैसे बढ़ती है। काम आसान नहीं, बल्कि और अधिक कठिन कैसे करते हैं। हम बेहतरीन कार्य तब कर पाते हैं, जब हम एकाग्र होते हैं।</p>
<p class="reader-body-para">ना ही कभी ध्यान की इतनी कमी रही और न ही कभी उसकी इतनी माँग रही, ऐसा पहले कभी नहीं हुआ कि हम इतने व्यस्त रहे हों और इतना कम काम कर पाए हों।</p>
<div class="reader-highlight-card">
  <div class="reader-highlight-title">दिमाग़ की दो मानसिक प्रणालियाँ:</div>
  <p class="reader-body-para" style="margin-bottom:0.6rem;">क्रिस बेली तर्क करते हैं कि हम अपने ध्यान का प्रबंधन सर्वश्रेष्ठ तरीक़े से कैसे करें, जब हमारा दिमाग़ दो मानसिक प्रणालियों के बीच 'स्विच' करता है :</p>
  <div class="reader-mode-item">
    <span class="mode-badge mode-hyper">1. हायपरफ़ोकस (Hyperfocus)</span>
    <p>यह हमारी <strong>गहन एकाग्रता प्रणाली</strong> होती है। जब हम किसी एक महत्त्वपूर्ण कार्य पर 100% ध्यान लगाकर काम पूरा करते हैं।</p>
  </div>
  <div class="reader-mode-item" style="margin-top:0.6rem;">
    <span class="mode-badge mode-scatter">2. स्कैटरफ़ोकस (Scatterfocus)</span>
    <p>यह हमारी <strong>रचनात्मक और नवोन्मेषी प्रणाली</strong> होती है। जब दिमाग़ आज़ाद होकर विश्राम करता है और नए विचारों को जोड़ता है।</p>
  </div>
  <p style="margin-top:0.8rem; font-weight:700; color:#10b981;">💡 अपने कार्य में सबसे रचनात्मक और कुशल बनने की कुंजी इन दोनों प्रणालियों के संयोजन में निहित है।</p>
</div>
<div class="reader-meta-footer">
  <span>ISBN: 978-93-5543-300-8</span>
  <span>मूल्य: ₹350 (Non-Fiction)</span>
</div>
`
          }
        ]
      },
      hinglish: {
        name: 'Hinglish (हिंग्लिश)',
        code: 'hinglish',
        flag: '💬',
        badge: 'हिंग्लिश संस्करण',
        desc: 'आसान बोलचाल भाषा में पढ़ने के लिए',
        pages: [
          {
            pageNo: 1,
            type: 'title',
            heading: 'HYPERFOCUS',
            content: `
<div class="reader-title-page">
  <div class="reader-book-main-title">HYPERFOCUS</div>
  <div class="reader-book-subtitle">Kam Prayas Mein Adhik Safalta Kaise Prapt Karein</div>
  <div class="reader-divider">✦ ✦ ✦</div>
  <div class="reader-book-author-text">Chris Bailey</div>
  <div class="reader-book-translator-text">Hindi Translation: Ajay Tiwari</div>
  <div class="reader-publisher-badge">
    <div class="pub-logo-icon">🦅</div>
    <div class="pub-name">Manjul Publishing House</div>
    <div class="pub-sub">HOW TO WORK LESS TO ACHIEVE MORE</div>
  </div>
</div>
`
          },
          {
            pageNo: 2,
            type: 'praise',
            heading: 'Pustak Ki Prashasti & Praises',
            content: `
<div class="reader-page-header">Pustak Ki Prashasti</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Life me jo zaroori hai use paane ke liye humein do tarah ke focus ki zaroorat hoti hai: ek definite intention (pakka sankalp) ke roop me aur ek dots ko connect karne ki continuous process ke roop me. Chris Bailey ne is novel concept ko graphics aur writing se behad shandar tareeqe se samjhaya hai. Mujhe ye kitaab bohot pasand aayi.”</p>
  <p class="reader-quote-author">— <strong>Greg McKeown</strong>, <em>Essentialism</em> ke lekhak</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Practical, well-written aur bilkul timely kitaab. Chris Bailey ne aaj ke sabse important mudde ko uthaya hai. Aap jisme participate karte hain wahi aapki reality ban jaata hai. Yeh kitaab humein apne dhyan ko master karne ka seedha practical rasta dikhati hai.”</p>
  <p class="reader-quote-author">— <strong>Shawn Achor</strong>, <em>The Happiness Advantage</em> ke lekhak</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Yeh kitaab ek lifeline ki tarah hai, aisi duniya me jahan hum sab bohot kuch karne ke liye bechain hain par time kisi ke paas nahi hai. Maine pehli baar mehsoos kiya ki sach me deep work aur high-value cheezon par focus kaise kiya jata hai.”</p>
  <p class="reader-quote-author">— <strong>James Citrin</strong>, <em>Career Playbook</em> ke lekhak</p>
</div>
`
          },
          {
            pageNo: 3,
            type: 'praise',
            heading: 'Top Experts Ki Ray',
            content: `
<div class="reader-page-header">Top Experts Ki Ray</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Itni busy aur notifications se bhari duniya me hyperfocused hona ek aisi superpower hai jo har professional apne paas chahta hai. Chris Bailey aapko isme master banne ka practical framework dete hain.”</p>
  <p class="reader-quote-author">— <strong>Vanessa Van Edwards</strong>, <em>Captivate</em> ki lekhika</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Is par koi shak nahi hai: Aapka Dhyan (Attention) hi aapki sabse keemti sampatti hai. Life ka har experience aapke attention se hi create hota hai. Yeh book sikhayegi ki focus ko kaise use karein aur maze se execute karein.”</p>
  <p class="reader-quote-author">— <strong>Peter Bregman</strong>, <em>18 Minutes</em> ke lekhak</p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Attention 21st century ki sabse badi currency hai. Yeh book scientific research aur practical execution ka perfect combination hai.”</p>
  <p class="reader-quote-author">— <strong>David Burkus</strong>, author of <em>Under New Management</em></p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Chris Bailey ki kitaab focus management ki best guide hai. Sirf theory nahi, balki practical exercises ka shandar toolbox hai.”</p>
  <p class="reader-quote-author">— <strong>Kai-Fu Lee</strong>, Google China Founder & Sinovation Chairman</p>
</div>
`
          },
          {
            pageNo: 4,
            type: 'summary',
            heading: 'Core Concept: Dimaag Ke Do Modes',
            content: `
<div class="reader-page-header">Core Concept & Mind Modes</div>
<div class="reader-callout-box">
  <p class="reader-lead-text">“Creative banne aur meaningful life jeene ke liye aapke paas jo sabse keemti cheez hai, wo hai aapka Dhyan (Attention).”</p>
</div>
<p class="reader-body-para">Khabar hai? Na pehle kabhi attention ki itni kami thi, aur na hi itni demand thi. Hum itne busy kabhi nahi rahe, fir bhi din ke aakhir me lagta hai ki kuch khaas kaam hua hi nahi.</p>
<div class="reader-highlight-card">
  <div class="reader-highlight-title">Hamare Dimaag Ke 2 Modes:</div>
  <p class="reader-body-para" style="margin-bottom:0.6rem;">Chris Bailey samjhate hain ki jab hamara mind do systems ke beech switch karta hai:</p>
  <div class="reader-mode-item">
    <span class="mode-badge mode-hyper">1. Hyperfocus (गहन एकाग्रता)</span>
    <p>Jab aap apna poora 100% focus kisi ek high-priority task par lock kar dete ho. Yahan distraction zero hota hai.</p>
  </div>
  <div class="reader-mode-item" style="margin-top:0.6rem;">
    <span class="mode-badge mode-scatter">2. Scatterfocus (रचनात्मक फैलाव)</span>
    <p>Jab aap dimaag ko aazaad ghoomne dete ho taaki subconscious mind naye ideas aur dots connect kar sake.</p>
  </div>
  <p style="margin-top:0.8rem; font-weight:700; color:#10b981;">💡 Kam mehnat me double productivity pane ka raaz in dono modes ko switch karna seekhne me hai.</p>
</div>
<div class="reader-meta-footer">
  <span>ISBN: 978-93-5543-300-8</span>
  <span>Price: ₹350 (Non-Fiction)</span>
</div>
`
          }
        ]
      },
      english: {
        name: 'English',
        code: 'en',
        flag: '🇬🇧',
        badge: 'English Edition',
        desc: 'Original international book text',
        pages: [
          {
            pageNo: 1,
            type: 'title',
            heading: 'HYPERFOCUS',
            content: `
<div class="reader-title-page">
  <div class="reader-book-main-title">HYPERFOCUS</div>
  <div class="reader-book-subtitle">How to Work Less and Achieve More</div>
  <div class="reader-divider">✦ ✦ ✦</div>
  <div class="reader-book-author-text">Chris Bailey</div>
  <div class="reader-publisher-badge">
    <div class="pub-logo-icon">📖</div>
    <div class="pub-name">Manjul Publishing House</div>
    <div class="pub-sub">INTERNATIONAL BESTSELLER</div>
  </div>
</div>
`
          },
          {
            pageNo: 2,
            type: 'praise',
            heading: 'Praise for Hyperfocus',
            content: `
<div class="reader-page-header">Praise for Hyperfocus</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“To do what is essential, we need two kinds of focus: focus as a noun (our fixed intent) and focus as a verb (the ongoing process of connecting dots). Chris Bailey illustrates this brilliantly through clear writing and models. I loved this book.”</p>
  <p class="reader-quote-author">— <strong>Greg McKeown</strong>, author of <em>Essentialism</em></p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Practical, well written, and timely. Chris Bailey tackles one of the most important issues today as we strive for success at work and mindful parenting in the modern world. What you attend to becomes your reality.”</p>
  <p class="reader-quote-author">— <strong>Shawn Achor</strong>, NYT bestselling author of <em>The Happiness Advantage</em></p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“This book is a lifeline in a world where we are all overwhelmed and starved for time. Thanks to Chris Bailey, I have reclaimed my attention for the things that truly create value.”</p>
  <p class="reader-quote-author">— <strong>James Citrin</strong>, author of <em>The Career Playbook</em></p>
</div>
`
          },
          {
            pageNo: 3,
            type: 'praise',
            heading: 'Acclaim from Thought Leaders',
            content: `
<div class="reader-page-header">Acclaim from Thought Leaders</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Being hyperfocused in a busy world is a skill every professional needs. Chris Bailey will show you how to master it with latest cognitive science and actionable frameworks.”</p>
  <p class="reader-quote-author">— <strong>Vanessa Van Edwards</strong>, author of <em>Captivate</em></p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“There is no question: attention is your most valuable asset. Everything in your life flows from it. This book teaches you how to hone this tool and actually enjoy the process.”</p>
  <p class="reader-quote-author">— <strong>Peter Bregman</strong>, author of <em>18 Minutes</em></p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“Attention may be the most valuable asset of the 21st century. This book combines decades of scientific insight with practical execution.”</p>
  <p class="reader-quote-author">— <strong>David Burkus</strong>, author of <em>Under New Management</em></p>
</div>
<div class="reader-praise-block">
  <p class="reader-quote-text">“A fantastic guide to managing attention. It is not just theory, but a rich toolbox of best practices. I can't wait to put these ideas into action.”</p>
  <p class="reader-quote-author">— <strong>Kai-Fu Lee</strong>, Founder of Google China & Chairman of Sinovation</p>
</div>
`
          },
          {
            pageNo: 4,
            type: 'summary',
            heading: 'The Core Premise (Back Cover)',
            content: `
<div class="reader-page-header">The Core Premise</div>
<div class="reader-callout-box">
  <p class="reader-lead-text">“The most important tool you have for becoming productive, creative, and living a meaningful life is your attention.”</p>
</div>
<p class="reader-body-para">Never has focus been in such short supply, and never has its value been so high. We are constantly busy, yet we feel we achieve far less than we could.</p>
<div class="reader-highlight-card">
  <div class="reader-highlight-title">Our Brain Shifts Between Two Modes:</div>
  <p class="reader-body-para" style="margin-bottom:0.6rem;">Chris Bailey explains how we perform at our best when we understand how our brain toggles between two core networks:</p>
  <div class="reader-mode-item">
    <span class="mode-badge mode-hyper">1. Hyperfocus (Deep Concentration)</span>
    <p>The deep immersion mode where you dedicate 100% of your limited working memory to a single critical objective without distraction.</p>
  </div>
  <div class="reader-mode-item" style="margin-top:0.6rem;">
    <span class="mode-badge mode-scatter">2. Scatterfocus (Creative Expansion)</span>
    <p>The exploratory, restorative mode where your mind intentionally wanders, sparking creative ideas and connecting distant concepts.</p>
  </div>
  <p style="margin-top:0.8rem; font-weight:700; color:#10b981;">💡 The master key to extraordinary accomplishment is knowing when and how to seamlessly navigate between both systems.</p>
</div>
<div class="reader-meta-footer">
  <span>ISBN: 978-93-5543-300-8</span>
  <span>Cover Price: ₹350 (Non-Fiction)</span>
</div>
`
          }
        ]
      }
    }
  }
};

// Helper to look up pages for any book
function getBookPagesData(bookOrTitle, lang = 'hindi') {
  if (!bookOrTitle) return null;
  const titleStr = (typeof bookOrTitle === 'string' ? bookOrTitle : (bookOrTitle.title || '')).toLowerCase();
  
  // Check direct key
  let bookEntry = null;
  if (BOOK_PAGES_DATA[titleStr]) {
    bookEntry = BOOK_PAGES_DATA[titleStr];
  } else {
    // Partial match
    const keys = Object.keys(BOOK_PAGES_DATA);
    for (let k of keys) {
      if (titleStr.includes(k) || k.includes(titleStr)) {
        bookEntry = BOOK_PAGES_DATA[k];
        break;
      }
    }
  }

  // Also check custom localStorage user-added pages
  try {
    const customPagesRaw = localStorage.getItem('mindfocus_custom_book_pages');
    if (customPagesRaw) {
      const customStore = JSON.parse(customPagesRaw);
      const matchKey = Object.keys(customStore).find(k => titleStr.includes(k.toLowerCase()) || k.toLowerCase().includes(titleStr));
      if (matchKey && customStore[matchKey]) {
        if (!bookEntry) {
          bookEntry = { title: matchKey, languages: {} };
        }
        // Merge custom pages
        Object.keys(customStore[matchKey]).forEach(l => {
          if (!bookEntry.languages[l]) {
            bookEntry.languages[l] = { name: l.toUpperCase(), pages: [] };
          }
          bookEntry.languages[l].pages = (bookEntry.languages[l].pages || []).concat(customStore[matchKey][l]);
        });
      }
    }
  } catch (e) {}

  if (!bookEntry) return null;
  const langData = bookEntry.languages[lang] || bookEntry.languages['hindi'] || Object.values(bookEntry.languages)[0];
  return {
    bookInfo: bookEntry,
    language: langData,
    pages: (langData && langData.pages) ? langData.pages : []
  };
}

// Check if book has real pages available
function hasBookPagesAvailable(bookOrTitle) {
  const data = getBookPagesData(bookOrTitle);
  return !!(data && data.pages && data.pages.length > 0);
}

if (typeof window !== 'undefined') {
  window.BOOK_PAGES_DATA = BOOK_PAGES_DATA;
  window.getBookPagesData = getBookPagesData;
  window.hasBookPagesAvailable = hasBookPagesAvailable;
}

