// Mind Focus Books • A-Z English-Hindi Comprehensive Vocabulary Lexicon
const DICTIONARY_WORDS = [
  // A
  { word: "Abandon", phonetic: "अबैंडन", type: "verb", hindi: "त्याग देना, छोड़ देना", definition: "To give up completely; desert or leave behind.", example: "Never abandon your reading habits.", exampleHindi: "अपनी पढ़ने की आदतों को कभी मत छोड़ो।", syn: "Desert, Discard, Renounce" },
  { word: "Ability", phonetic: "एबिलिटी", type: "noun", hindi: "क्षमता, योग्यता, सामर्थ्य", definition: "Possession of the means or skill to do something.", example: "Reading books improves your thinking ability.", exampleHindi: "किताबें पढ़ने से आपकी सोचने की क्षमता बढ़ती है।", syn: "Capability, Competence, Skill" },
  { word: "Abundant", phonetic: "अबंडेंट", type: "adjective", hindi: "प्रचुर, भरपूर, अत्यधिक", definition: "Existing or available in large quantities; plentiful.", example: "There is abundant knowledge in books.", exampleHindi: "किताबों में ज्ञान का प्रचुर भंडार है।", syn: "Plentiful, Copious, Ample" },
  { word: "Accomplish", phonetic: "अकम्प्लिश", type: "verb", hindi: "सफलतापूर्वक पूरा करना, हासिल करना", definition: "To achieve or complete successfully.", example: "You can accomplish great goals with daily focus.", exampleHindi: "आप रोज़ाना फोकस करके बड़े लक्ष्य हासिल कर सकते हैं।", syn: "Achieve, Fulfill, Complete" },
  { word: "Accurate", phonetic: "एक्यूरेट", type: "adjective", hindi: "सटीक, बिल्कुल सही, शुद्ध", definition: "Correct in all details; exact.", example: "Keep an accurate track of your daily pages.", exampleHindi: "अपने रोज़ाना पढ़े गए पेजों का सटीक हिसाब रखें।", syn: "Precise, Exact, Correct" },
  { word: "Adapt", phonetic: "अडैप्ट", type: "verb", hindi: "अनुकूल बनाना, ढल जाना", definition: "To make something suitable for a new use or purpose; adjust.", example: "Successful people adapt quickly to change.", exampleHindi: "सफल लोग बदलाव के अनुसार जल्दी ढल जाते हैं।", syn: "Adjust, Acclimate, Modify" },
  { word: "Ambition", phonetic: "एम्बिशन", type: "noun", hindi: "महत्वाकांक्षा, बड़ा लक्ष्य", definition: "A strong desire to do or achieve something.", example: "Her ambition is to read 50 books this year.", exampleHindi: "उसकी महत्वाकांक्षा इस साल 50 किताबें पढ़ने की है।", syn: "Aspiration, Goal, Desire" },
  { word: "Analyze", phonetic: "एनालाइज़", type: "verb", hindi: "विश्लेषण करना, गहराई से समझना", definition: "Examine methodically and in detail.", example: "Analyze what you learn from each chapter.", exampleHindi: "हर अध्याय से जो सीखा है उसका विश्लेषण करें।", syn: "Examine, Inspect, Investigate" },
  { word: "Authentic", phonetic: "ऑथेंटिक", type: "adjective", hindi: "प्रामाणिक, सच्चा, असली", definition: "Of undisputed origin; genuine and real.", example: "Always be authentic in your character and thoughts.", exampleHindi: "अपने चरित्र और विचारों में हमेशा सच्चे रहें।", syn: "Genuine, Real, Original" },

  // B
  { word: "Balance", phonetic: "बैलेंस", type: "noun/verb", hindi: "संतुलन, सामंजस्य", definition: "An even distribution of weight enabling someone to remain steady.", example: "Maintain a healthy balance between work and reading.", exampleHindi: "काम और पढ़ाई के बीच स्वस्थ संतुलन बनाए रखें।", syn: "Equilibrium, Harmony, Stability" },
  { word: "Barrier", phonetic: "बैरियर", type: "noun", hindi: "बाधा, रुकावट", definition: "An obstacle that prevents movement or access.", example: "Distraction is the biggest barrier to deep focus.", exampleHindi: "भटकाव गहरे फोकस के लिए सबसे बड़ी बाधा है।", syn: "Obstacle, Hurdle, Impediment" },
  { word: "Belief", phonetic: "बिलीफ", type: "noun", hindi: "विश्वास, आस्था, धारणा", definition: "An acceptance that a statement is true or that something exists.", example: "Strong self-belief leads to great achievements.", exampleHindi: "मजबूत आत्मविश्वास बड़ी उपलब्धियों की ओर ले जाता है।", syn: "Faith, Trust, Conviction" },
  { word: "Beneficial", phonetic: "बेनेफिशियल", type: "adjective", hindi: "फायदेमंद, लाभदायक", definition: "Favorable or advantageous; resulting in good.", example: "Morning reading is highly beneficial for the mind.", exampleHindi: "सुबह पढ़ना दिमाग के लिए बेहद फायदेमंद है।", syn: "Advantageous, Helpful, Useful" },
  { word: "Bold", phonetic: "बोल्ड", type: "adjective", hindi: "साहसी, निडर, बेबाक", definition: "Showing an ability to take risks; confident and courageous.", example: "Take bold steps towards your lifelong dreams.", exampleHindi: "अपने सपनों की दिशा में साहसी कदम उठाएं।", syn: "Courageous, Daring, Brave" },
  { word: "Boundary", phonetic: "बाउंड्री", type: "noun", hindi: "सीमा, दायरा", definition: "A line that marks the limits of an area.", example: "Set boundaries to protect your focus hours.", exampleHindi: "अपने फोकस के समय की सुरक्षा के लिए सीमाएं तय करें।", syn: "Limit, Border, Perimeter" },
  { word: "Brave", phonetic: "ब्रेव", type: "adjective", hindi: "बहादुर, शूरवीर", definition: "Ready to face and endure danger or pain.", example: "Brave readers explore challenging ideas.", exampleHindi: "बहादुर पाठक चुनौतीपूर्ण विचारों को समझते हैं।", syn: "Valiant, Fearless, Heroic" },
  { word: "Brilliant", phonetic: "ब्रिलियंट", type: "adjective", hindi: "शानदार, प्रतिभाशाली, प्रखर", definition: "Exceptionally clever, talented, or bright.", example: "That book contains brilliant insights on psychology.", exampleHindi: "उस किताब में मनोविज्ञान पर शानदार विचार हैं।", syn: "Smart, Genius, Exceptional" },

  // C
  { word: "Calm", phonetic: "काम", type: "adjective", hindi: "शांत, स्थिर, धीर", definition: "Not showing or feeling nervousness, anger, or other strong emotions.", example: "A calm mind absorbs concepts much faster.", exampleHindi: "शांत दिमाग बातों को बहुत तेजी से ग्रहण करता है।", syn: "Peaceful, Serene, Tranquil" },
  { word: "Capability", phonetic: "कैपेबिलिटी", type: "noun", hindi: "सामर्थ्य, कार्यकुशलता", definition: "The power or ability to do something.", example: "Never underestimate your learning capability.", exampleHindi: "अपनी सीखने की क्षमता को कभी कम मत आंकिए।", syn: "Potential, Ability, Capacity" },
  { word: "Challenge", phonetic: "चैलेंज", type: "noun/verb", hindi: "चुनौती, मुकाबला", definition: "A task or situation that tests someone's abilities.", example: "Accept the 30-day reading challenge.", exampleHindi: "30 दिन की रीडिंग चुनौती स्वीकार करें।", syn: "Obstacle, Test, Trial" },
  { word: "Clarity", phonetic: "क्लैरिटी", type: "noun", hindi: "स्पष्टता, साफ विचार", definition: "The quality of being certain, coherent, or easy to understand.", example: "Reading books brings immense clarity to your thoughts.", exampleHindi: "किताबें पढ़ने से आपके विचारों में अपार स्पष्टता आती है।", syn: "Lucidity, Precision, Transparency" },
  { word: "Commitment", phonetic: "कमिटमेंट", type: "noun", hindi: "प्रतिबद्धता, पक्का वादा", definition: "The state or quality of being dedicated to a cause or activity.", example: "Success requires daily commitment and discipline.", exampleHindi: "सफलता के लिए रोज़ाना प्रतिबद्धता और अनुशासन चाहिए।", syn: "Dedication, Devotion, Loyalty" },
  { word: "Compassion", phonetic: "कम्पैशन", type: "noun", hindi: "सहानुभूति, दया, करुणा", definition: "Sympathetic pity and concern for the sufferings or misfortunes of others.", example: "Great leaders lead with wisdom and compassion.", exampleHindi: "महान नेता ज्ञान और करुणा के साथ नेतृत्व करते हैं।", syn: "Empathy, Kindness, Sympathy" },
  { word: "Concentrate", phonetic: "कॉन्सन्ट्रेट", type: "verb", hindi: "ध्यान केंद्रित करना, एकाग्र होना", definition: "Focus one's full attention or mental effort on a particular object or activity.", example: "Put your phone away to concentrate on your book.", exampleHindi: "किताब पर एकाग्र होने के लिए फोन दूर रखें।", syn: "Focus, Direct, Center" },
  { word: "Confidence", phonetic: "कॉन्फिडेंस", type: "noun", hindi: "आत्मविश्वास, भरोसा", definition: "A feeling of self-assurance arising from one's appreciation of one's own abilities.", example: "Knowledge builds unbreakable confidence.", exampleHindi: "ज्ञान से अटूट आत्मविश्वास का निर्माण होता है।", syn: "Assurance, Courage, Self-reliance" },
  { word: "Consistency", phonetic: "कंसिस्टेंसी", type: "noun", hindi: "निरंतरता, नियमितता", definition: "Conformity in the application of something, typically that which is necessary for the sake of logic, accuracy, or fairness.", example: "Consistency is more important than intensity.", exampleHindi: "तीव्रता से ज्यादा निरंतरता महत्वपूर्ण है।", syn: "Regularity, Persistence, Constancy" },
  { word: "Courage", phonetic: "करेज", type: "noun", hindi: "हिम्मत, साहस", definition: "The ability to do something that frightens one.", example: "It takes courage to choose reading over social media.", exampleHindi: "सोशल मीडिया छोड़कर किताब चुनने में हिम्मत चाहिए।", syn: "Bravery, Valor, Grit" },
  { word: "Curiosity", phonetic: "क्यूरियोसिटी", type: "noun", hindi: "जिज्ञासा, उत्सुकता", definition: "A strong desire to know or learn something.", example: "Keep your child-like curiosity alive through reading.", exampleHindi: "पढ़ने के माध्यम से अपनी बच्चों जैसी जिज्ञासा जीवित रखें।", syn: "Inquisitiveness, Wonder, Interest" },

  // D
  { word: "Dedication", phonetic: "डेडीकेशन", type: "noun", hindi: "समर्पण, निष्ठा", definition: "The quality of being dedicated or committed to a task or purpose.", example: "Her dedication to self-improvement is inspiring.", exampleHindi: "आत्म-सुधार के प्रति उनका समर्पण प्रेरणादायक है।", syn: "Devotion, Commitment, Zeal" },
  { word: "Determination", phonetic: "डिटर्मिनेशन", type: "noun", hindi: "दृढ़ संकल्प, पक्का इरादा", definition: "Firmness of purpose; resoluteness.", example: "With strong determination, you can master any skill.", exampleHindi: "दृढ़ संकल्प के साथ आप कोई भी हुनर सीख सकते हैं।", syn: "Resolve, Willpower, Persistence" },
  { word: "Discipline", phonetic: "डिसिप्लिन", type: "noun", hindi: "अनुशासन, संयम", definition: "The practice of training people to obey rules or a code of behavior.", example: "Discipline will take you where motivation cannot.", exampleHindi: "अनुशासन आपको वहां ले जाएगा जहां प्रेरणा नहीं ले जा सकती।", syn: "Self-control, Order, Restraint" },
  { word: "Distraction", phonetic: "डिस्ट्रैक्शन", type: "noun", hindi: "भटकाव, ध्यान भंग", definition: "A thing that prevents someone from giving full attention to something else.", example: "Turn off notifications to eliminate distraction.", exampleHindi: "भटकाव खत्म करने के लिए नोटिफिकेशन्स बंद करें।", syn: "Diversion, Interruption, Interference" },
  { word: "Diversity", phonetic: "डाइवर्सिटी", type: "noun", hindi: "विविधता, भिन्नता", definition: "The state of being diverse; a range of different things.", example: "Read across a wide diversity of genres.", exampleHindi: "विभिन्न विषयों और शैलियों की किताबें पढ़ें।", syn: "Variety, Multiplicity, Difference" },

  // E
  { word: "Efficiency", phonetic: "एफिशिएंसी", type: "noun", hindi: "कार्यकुशलता, दक्षता", definition: "The state or quality of being efficient.", example: "Pomodoro technique boosts reading efficiency.", exampleHindi: "पोमोडोरो तकनीक पढ़ने की कार्यकुशलता बढ़ाती है।", syn: "Competence, Productivity, Skill" },
  { word: "Empathy", phonetic: "एम्पैथी", type: "noun", hindi: "सहानुभूति, परानुभूति (दूसरों का दर्द समझना)", definition: "The ability to understand and share the feelings of another.", example: "Fiction books increase your empathy towards others.", exampleHindi: "कहानियों की किताबें दूसरों के प्रति आपकी सहानुभूति बढ़ाती हैं।", syn: "Understanding, Compassion, Sensitivity" },
  { word: "Encourage", phonetic: "एनकरेज", type: "verb", hindi: "प्रोत्साहित करना, हिम्मत बढ़ाना", definition: "Give support, confidence, or hope to someone.", example: "Encourage your friends to build a reading habit.", exampleHindi: "अपने दोस्तों को पढ़ने की आदत बनाने के लिए प्रोत्साहित करें।", syn: "Inspire, Motivate, Support" },
  { word: "Endurance", phonetic: "एंड्योरेंस", type: "noun", hindi: "सहनशीलता, सहनशक्ति", definition: "The ability to endure an unpleasant or difficult process or situation.", example: "Mental endurance grows with deep focus sessions.", exampleHindi: "गहरे फोकस से मानसिक सहनशक्ति बढ़ती है।", syn: "Stamina, Resilience, Fortitude" },
  { word: "Enthusiasm", phonetic: "एंथूज़ियाज़्म", type: "noun", hindi: "उत्साह, उमंग, जोश", definition: "Intense and eager enjoyment, interest, or approval.", example: "He started the new book with great enthusiasm.", exampleHindi: "उसने बड़े उत्साह के साथ नई किताब शुरू की।", syn: "Eagerness, Passion, Excitement" },
  { word: "Evaluate", phonetic: "इवैल्यूएट", type: "verb", hindi: "मूल्यांकन करना, परखना", definition: "Form an idea of the amount, number, or value of; assess.", example: "Evaluate your monthly reading progress regularly.", exampleHindi: "अपनी मासिक पढ़ने की प्रगति का नियमित मूल्यांकन करें।", syn: "Assess, Gauge, Appraise" },

  // F
  { word: "Focus", phonetic: "फोकस", type: "noun/verb", hindi: "एकाग्रता, ध्यान लगाना", definition: "The center of interest or activity; concentrate attention.", example: "Deep focus is the superpower of the 21st century.", exampleHindi: "गहरा फोकस 21वीं सदी की महाशक्ति है।", syn: "Concentration, Attention, Center" },
  { word: "Fortitude", phonetic: "फॉर्टिट्यूड", type: "noun", hindi: "धैर्य, आंतरिक साहस", definition: "Courage in pain or adversity.", example: "Books provide the fortitude needed in tough times.", exampleHindi: "किताबें कठिन समय में आवश्यक आंतरिक साहस देती हैं।", syn: "Courage, Bravery, Grit" },
  { word: "Fulfill", phonetic: "फुलफिल", type: "verb", hindi: "पूरा करना, संतुष्ट करना", definition: "Bring to completion or reality; achieve or realize.", example: "Fulfill your promise to read 10 pages daily.", exampleHindi: "रोज़ाना 10 पेज पढ़ने का अपना वादा पूरा करें।", syn: "Achieve, Complete, Realize" },
  { word: "Fundamental", phonetic: "फंडामेंटल", type: "adjective", hindi: "बुनियादी, मौलिक, आधारभूत", definition: "Forming a necessary base or core; of central importance.", example: "Habits are the fundamental unit of personal growth.", exampleHindi: "आदतें व्यक्तिगत विकास की बुनियादी इकाई हैं।", syn: "Basic, Essential, Core" },

  // G
  { word: "Generosity", phonetic: "जेनेरोसिटी", type: "noun", hindi: "उदारता, दरियादिली", definition: "The quality of being kind and generous.", example: "Share your book notes with generosity.", exampleHindi: "अपने नोट्स उदारतापूर्वक दूसरों के साथ साझा करें।", syn: "Benevolence, Kindness, Charity" },
  { word: "Genuine", phonetic: "जेन्युइन", type: "adjective", hindi: "वास्तविक, सच्चा, खरा", definition: "Truly what something is said to be; authentic.", example: "She has a genuine passion for self-help books.", exampleHindi: "किताबों के प्रति उसका सच्चा लगाव है।", syn: "Authentic, Sincere, Real" },
  { word: "Gratitude", phonetic: "ग्रैटिट्यूड", type: "noun", hindi: "कृतज्ञता, आभार, धन्यवाद भाव", definition: "The quality of being thankful; readiness to show appreciation.", example: "Practice daily gratitude to attract peace of mind.", exampleHindi: "मानसिक शांति पाने के लिए रोज़ाना आभार व्यक्त करें।", syn: "Thankfulness, Appreciation, Recognition" },
  { word: "Guidance", phonetic: "गाइडेंस", type: "noun", hindi: "मार्गदर्शन, दिशा-निर्देश", definition: "Advice or information aimed at resolving a problem or difficulty.", example: "Books offer timeless guidance from great thinkers.", exampleHindi: "किताबें महान विचारकों से अमूल्य मार्गदर्शन प्रदान करती हैं।", syn: "Counsel, Advice, Direction" },

  // H
  { word: "Habit", phonetic: "हैबिट", type: "noun", hindi: "आदत, स्वभाव", definition: "A settled or regular tendency or practice, especially one that is hard to give up.", example: "Small daily habits create massive lifelong changes.", exampleHindi: "छोटी-छोटी रोज़मर्रा की आदतें बड़े बदलाव लाती हैं।", syn: "Custom, Routine, Practice" },
  { word: "Harmony", phonetic: "हार्मनी", type: "noun", hindi: "सामंजस्य, तालमेल, शांति", definition: "The combination of simultaneously sounded musical notes to produce chords and chord progressions having a pleasing effect.", example: "Live in harmony with your core personal values.", exampleHindi: "अपने बुनियादी मूल्यों के साथ तालमेल बनाकर जिएं।", syn: "Peace, Accord, Agreement" },
  { word: "Honesty", phonetic: "ऑनेस्टी", type: "noun", hindi: "ईमानदारी, सच्चाई", definition: "The quality of being honest; truthfulness.", example: "Be honest with yourself about your reading pace.", exampleHindi: "अपनी पढ़ने की रफ्तार के बारे में खुद से ईमानदार रहें।", syn: "Integrity, Truthfulness, Sincerity" },
  { word: "Humility", phonetic: "ह्यूमिलिटी", type: "noun", hindi: "विनम्रता, सादगी", definition: "A modest or low view of one's own importance; humbleness.", example: "True knowledge always brings deep humility.", exampleHindi: "सच्चा ज्ञान हमेशा गहरी विनम्रता लेकर आता है।", syn: "Modesty, Humbleness, Meekness" },

  // I
  { word: "Illuminate", phonetic: "इल्युमिनेट", type: "verb", hindi: "प्रकाशित करना, स्पष्ट करना", definition: "Help to clarify or explain; light up.", example: "Great authors illuminate dark corners of our thinking.", exampleHindi: "महान लेखक हमारी सोच के अंधकार को प्रकाशित करते हैं।", syn: "Light up, Brighten, Clarify" },
  { word: "Impact", phonetic: "इम्पैक्ट", type: "noun/verb", hindi: "प्रभाव, असर", definition: "A marked effect or influence.", example: "One good book can have a lifelong positive impact.", exampleHindi: "एक अच्छी किताब जीवनभर सकारात्मक प्रभाव डाल सकती है।", syn: "Influence, Effect, Impression" },
  { word: "Incredible", phonetic: "इन्क्रेडिबल", type: "adjective", hindi: "अविश्वसनीय, अद्भुत, लाजवाब", definition: "Impossible to believe; extraordinary.", example: "The book offers incredible strategies for wealth.", exampleHindi: "यह किताब धन कमाने की अद्भुत रणनीतियां सिखाती है।", syn: "Extraordinary, Amazing, Unbelievable" },
  { word: "Insight", phonetic: "इनसाइट", type: "noun", hindi: "गहरी समझ, अंतर्दृष्टि", definition: "An accurate and deep understanding of someone or something.", example: "He gained valuable insights from Thinking Fast and Slow.", exampleHindi: "उसने इस किताब से मूल्यवान अंतर्दृष्टि प्राप्त की।", syn: "Perception, Understanding, Wisdom" },
  { word: "Inspire", phonetic: "इन्स्पायर", type: "verb", hindi: "प्रेरित करना, हौसला बढ़ाना", definition: "Fill someone with the urge or ability to do or feel something.", example: "Biography books inspire us to overcome difficulties.", exampleHindi: "जीवनियां हमें मुश्किलों से उबरने की प्रेरणा देती हैं।", syn: "Motivate, Encourage, Stimulate" },
  { word: "Integrity", phonetic: "इंटेग्रिटी", type: "noun", hindi: "सत्यनिष्ठा, ईमानदारी, अखंडता", definition: "The quality of being honest and having strong moral principles.", example: "Never compromise your integrity for short-term gain.", exampleHindi: "क्षणिक लाभ के लिए अपनी सत्यनिष्ठा से समझौता न करें।", syn: "Honesty, Uprightness, Morality" },

  // J
  { word: "Journey", phonetic: "जर्नी", type: "noun", hindi: "यात्रा, सफर", definition: "An act of traveling from one place to another; a passage through life.", example: "Reading is a lifelong journey of self-discovery.", exampleHindi: "पढ़ना खुद को खोजने का एक जीवनभर का सफर है।", syn: "Voyage, Expedition, Passage" },
  { word: "Judgment", phonetic: "जजमेंट", type: "noun", hindi: "निर्णय, विवेक, फैसला", definition: "The ability to make considered decisions or come to sensible conclusions.", example: "Wisdom improves your decision-making judgment.", exampleHindi: "ज्ञान आपके निर्णय लेने के विवेक को बेहतर बनाता है।", syn: "Discernment, Decision, Opinion" },
  { word: "Justice", phonetic: "जस्टिस", type: "noun", hindi: "न्याय, निष्पक्षता", definition: "Just behavior or treatment; fairness.", example: "Philosophy books explore the meaning of true justice.", exampleHindi: "दर्शनशास्त्र की किताबें सच्चे न्याय के अर्थ को समझाती हैं।", syn: "Fairness, Equity, Impartiality" },

  // K
  { word: "Knowledge", phonetic: "नॉलेज", type: "noun", hindi: "ज्ञान, विद्या, जानकारी", definition: "Facts, information, and skills acquired through experience or education.", example: "Knowledge is potential power; action makes it real.", exampleHindi: "ज्ञान संभावित शक्ति है; कर्म इसे वास्तविक बनाता है।", syn: "Wisdom, Learning, Expertise" },
  { word: "Kindness", phonetic: "काइन्डनेस", type: "noun", hindi: "दयालुता, मेहरबानी", definition: "The quality of being friendly, generous, and considerate.", example: "A simple act of kindness can change someone's day.", exampleHindi: "दयालुता का एक छोटा सा काम किसी का दिन बदल सकता है।", syn: "Goodwill, Generosity, Warmth" },

  // L
  { word: "Leadership", phonetic: "लीडरशिप", type: "noun", hindi: "नेतृत्व, अगुआई", definition: "The action of leading a group of people or an organization.", example: "Good books teach authentic, humble leadership.", exampleHindi: "अच्छी किताबें सच्चा और विनम्र नेतृत्व सिखाती हैं।", syn: "Guidance, Direction, Management" },
  { word: "Legacy", phonetic: "लेगेसी", type: "noun", hindi: "विरासत, धरोहर", definition: "Something left or handed down by a predecessor.", example: "Great books leave an everlasting intellectual legacy.", exampleHindi: "महान किताबें एक चिरस्थायी बौद्धिक विरासत छोड़ती हैं।", syn: "Heritage, Inheritance, Gift" },
  { word: "Limitless", phonetic: "लिमिटलेस", type: "adjective", hindi: "असीमित, असीम", definition: "Without end, limit, or boundary.", example: "Your brain potential is truly limitless.", exampleHindi: "आपके मस्तिष्क की क्षमता वास्तव में असीमित है।", syn: "Boundless, Infinite, Endless" },
  { word: "Logic", phonetic: "लॉजिक", type: "noun", hindi: "तर्क, तर्कशास्त्र", definition: "Reasoning conducted or assessed according to strict principles of validity.", example: "Use sound logic to evaluate arguments in books.", exampleHindi: "किताबों में दिए गए तर्कों को समझने के लिए ठोस विवेक का उपयोग करें।", syn: "Reasoning, Rationale, Sense" },

  // M
  { word: "Mastery", phonetic: "मास्टरी", type: "noun", hindi: "महारत, निपुणता, प्रभुत्व", definition: "Comprehensive knowledge or skill in a subject or accomplishment.", example: "Mastery comes from thousands of hours of deliberate practice.", exampleHindi: "महारत हज़ारों घंटों के समर्पित अभ्यास से आती है।", syn: "Expertise, Proficiency, Skill" },
  { word: "Mindset", phonetic: "माइंडसेट", type: "noun", hindi: "मानसिकता, दृष्टिकोण", definition: "The established set of attitudes held by someone.", example: "A growth mindset turns obstacles into opportunities.", exampleHindi: "सकारात्मक मानसिकता बाधाओं को अवसरों में बदल देती है।", syn: "Attitude, Outlook, Perspective" },
  { word: "Motivation", phonetic: "मोटिवेशन", type: "noun", hindi: "प्रेरणा, प्रोत्साहन", definition: "The reason or reasons one has for acting or behaving in a particular way.", example: "Motivation gets you going, but habit keeps you growing.", exampleHindi: "प्रेरणा शुरुआत कराती है, पर आदत आगे बढ़ाती है।", syn: "Drive, Inspiration, Incentive" },

  // N
  { word: "Navigate", phonetic: "नेविगेट", type: "verb", hindi: "मार्गदर्शन करना, रास्ता खोजना", definition: "Plan and direct the route or course; manage successfully.", example: "Wisdom helps you navigate through life's complex dilemmas.", exampleHindi: "ज्ञान आपको जीवन की जटिल उलझनों से निकलने का रास्ता दिखाता है।", syn: "Steer, Guide, Direct" },
  { word: "Noble", phonetic: "नोबल", type: "adjective", hindi: "महान, कुलीन, नेक", definition: "Having or showing fine personal qualities or high moral principles.", example: "Pursuing wisdom is a noble endeavor.", exampleHindi: "ज्ञान की खोज करना एक नेक और महान काम है।", syn: "Magnanimous, Honorable, Righteous" },
  { word: "Nourish", phonetic: "नरिश", type: "verb", hindi: "पोषण देना, संवारना", definition: "Provide with the food or other substances necessary for growth and health.", example: "Reading good books nourishes the mind and soul.", exampleHindi: "अच्छी किताबें पढ़ना मन और आत्मा को पोषण देता है।", syn: "Feed, Cultivate, Foster" },

  // O
  { word: "Obstacle", phonetic: "ऑब्स्टेकल", type: "noun", hindi: "रुकावट, बाधा, अड़चन", definition: "A thing that blocks one's way or prevents or hinders progress.", example: "The obstacle in your path often becomes the way.", exampleHindi: "आपके रास्ते की बाधा ही अक्सर आगे का रास्ता बन जाती है।", syn: "Hurdle, Barrier, Impediment" },
  { word: "Opportunity", phonetic: "अपॉर्चुनिटी", type: "noun", hindi: "अवसर, मौका", definition: "A set of circumstances that makes it possible to do something.", example: "Every morning brings a new opportunity to learn.", exampleHindi: "हर सुबह सीखने का एक नया अवसर लेकर आती है।", syn: "Chance, Opening, Occasion" },
  { word: "Optimism", phonetic: "ऑप्टिमिज्म", type: "noun", hindi: "आशावाद, सकारात्मक दृष्टिकोण", definition: "Hopefulness and confidence about the future or the success of something.", example: "Optimism fuels the courage to persevere.", exampleHindi: "आशावाद लगातार आगे बढ़ने की हिम्मत देता है।", syn: "Hopefulness, Positivity, Cheerfulness" },

  // P
  { word: "Patience", phonetic: "पेशेंस", type: "noun", hindi: "धैर्य, सब्र", definition: "The capacity to accept or tolerate delay, trouble, or suffering without getting angry or upset.", example: "Patience is required to read thick, profound books.", exampleHindi: "गंभीर और बड़ी किताबें पढ़ने के लिए धैर्य जरूरी है।", syn: "Tolerance, Endurance, Forbearance" },
  { word: "Perseverance", phonetic: "पर्सिवियरेंस", type: "noun", hindi: "दृढ़ता, निरंतर लगन", definition: "Persistence in doing something despite difficulty or delay in achieving success.", example: "Perseverance guarantees mastery over time.", exampleHindi: "निरंतर लगन समय के साथ महारत की गारंटी देती है।", syn: "Persistence, Tenacity, Grit" },
  { word: "Perspective", phonetic: "पर्सपेक्टिव", type: "noun", hindi: "दृष्टिकोण, नज़रिया", definition: "A particular attitude toward or way of regarding something; a point of view.", example: "Reading biographies gives you a broad perspective on life.", exampleHindi: "जीवनियां पढ़ने से जीवन के प्रति व्यापक नज़रिया मिलता है।", syn: "Point of view, Outlook, Angle" },
  { word: "Potential", phonetic: "पोटेंशियल", type: "noun/adj", hindi: "संभावना, आंतरिक क्षमता", definition: "Having or showing the capacity to become or develop into something in the future.", example: "Unleash your true intellectual potential with books.", exampleHindi: "किताबों से अपनी वास्तविक बौद्धिक क्षमता को जगाएं।", syn: "Capability, Capacity, Possibility" },

  // Q
  { word: "Quality", phonetic: "क्वालिटी", type: "noun", hindi: "गुणवत्ता, विशेषता", definition: "The standard of something as measured against other things of a similar kind.", example: "Focus on the quality of your reading, not just speed.", exampleHindi: "सिर्फ रफ्तार पर नहीं, पढ़ने की गुणवत्ता पर ध्यान दें।", syn: "Standard, Excellence, Value" },
  { word: "Quest", phonetic: "क्वेस्ट", type: "noun", hindi: "तलाश, खोज", definition: "A long or arduous search for something.", example: "A reader is always on a quest for truth and wisdom.", exampleHindi: "एक पाठक हमेशा सत्य और ज्ञान की खोज में रहता है।", syn: "Search, Pursuit, Mission" },

  // R
  { word: "Reflection", phonetic: "रिफ्लेक्शन", type: "noun", hindi: "चिंतन, मनन, आत्म-निरीक्षण", definition: "Serious thought or consideration.", example: "Take 5 minutes of quiet reflection after each chapter.", exampleHindi: "हर अध्याय के बाद 5 मिनट शांत चिंतन करें।", syn: "Contemplation, Thought, Deliberation" },
  { word: "Resilience", phonetic: "रेज़िलिएंस", type: "noun", hindi: "लचीलापन, विपरीत परिस्थितियों से उबरने की क्षमता", definition: "The capacity to withstand or recover quickly from difficulties; toughness.", example: "Mental resilience helps you bounce back from failures.", exampleHindi: "मानसिक मजबूती असफलताओं से उबरने में मदद करती है।", syn: "Toughness, Endurance, Flexibility" },
  { word: "Routine", phonetic: "रूटीन", type: "noun", hindi: "दिनचर्या, नित्यक्रम", definition: "A sequence of actions regularly followed.", example: "A 20-minute evening reading routine calms your brain.", exampleHindi: "शाम को 20 मिनट पढ़ने की दिनचर्या दिमाग को शांत करती है।", syn: "Schedule, Pattern, Practice" },

  // S
  { word: "Serenity", phonetic: "सेरेनिटी", type: "noun", hindi: "परम शांति, सुकून, स्थिरता", definition: "The state of being calm, peaceful, and untroubled.", example: "Find serenity in the pages of a meaningful book.", exampleHindi: "एक अर्थपूर्ण किताब के पन्नों में सुकून खोजें।", syn: "Tranquility, Peace, Calmness" },
  { word: "Strategy", phonetic: "स्ट्रैटेजी", type: "noun", hindi: "रणनीति, कार्ययोजना", definition: "A plan of action designed to achieve a long-term or overall aim.", example: "Apply the strategies you learn to your daily life.", exampleHindi: "किताबों से सीखी गई रणनीतियों को अपने जीवन में लागू करें।", syn: "Plan, Tactics, Scheme" },
  { word: "Strength", phonetic: "स्ट्रेंथ", type: "noun", hindi: "ताकत, बल, मजबूती", definition: "The quality or state of being physically or mentally strong.", example: "Knowledge provides inner mental strength.", exampleHindi: "ज्ञान आंतरिक मानसिक शक्ति प्रदान करता है।", syn: "Power, Vigor, Resilience" },
  { word: "Success", phonetic: "सक्सेस", type: "noun", hindi: "सफलता, कामयाबी", definition: "The accomplishment of an aim or purpose.", example: "Consistent daily effort is the secret recipe for success.", exampleHindi: "नियमित दैनिक प्रयास ही सफलता का असली राज़ है।", syn: "Achievement, Triumph, Victory" },

  // T
  { word: "Tenacity", phonetic: "टेनेसिटी", type: "noun", hindi: "दृढ़ता, हठ, न हार मानने की जिद्द", definition: "The quality or fact of being very determined; determination.", example: "Tenacity turns hard goals into accomplished milestones.", exampleHindi: "अडिग लगन कठिन लक्ष्यों को उपलब्धियों में बदल देती है।", syn: "Persistence, Grit, Resolution" },
  { word: "Transform", phonetic: "ट्रांसफॉर्म", type: "verb", hindi: "पूरी तरह बदल देना, कायापलट करना", definition: "Make a thorough or dramatic change in the form, appearance, or character of.", example: "The ideas in this book can transform your perspective.", exampleHindi: "इस किताब के विचार आपके नज़रिए का कायापलट कर सकते हैं।", syn: "Convert, Metamorphose, Revolutionize" },
  { word: "Tranquility", phonetic: "ट्रैंक्विलिटी", type: "noun", hindi: "प्रशांतता, निस्तब्धता", definition: "The quality or state of being tranquil; calm.", example: "Deep reading offers a sanctuary of tranquility.", exampleHindi: "गहराई से पढ़ना परम शांति का अनुभव कराता है।", syn: "Peace, Serenity, Quietude" },

  // U
  { word: "Ultimate", phonetic: "अल्टीमेट", type: "adjective", hindi: "सर्वोत्तम, अंतिम, सर्वश्रेष्ठ", definition: "Being or happening at the end of a process; final or highest.", example: "Self-realization is the ultimate goal of wisdom.", exampleHindi: "आत्म-साक्षात्कार ही ज्ञान का अंतिम और सर्वोत्तम लक्ष्य है।", syn: "Final, Supreme, Highest" },
  { word: "Unbreakable", phonetic: "अनब्रेकेबल", type: "adjective", hindi: "अटूट, जिसे तोड़ा न जा सके", definition: "Not able to be broken; extremely tough.", example: "Build an unbreakable 100-day reading streak.", exampleHindi: "100 दिनों की एक अटूट रीडिंग स्ट्रीक बनाएं।", syn: "Indestructible, Solid, Tough" },
  { word: "Understand", phonetic: "अंडरस्टैंड", type: "verb", hindi: "समझना, जानना", definition: "Perceive the intended meaning of words, language, or people.", example: "Read slowly to fully understand the author's logic.", exampleHindi: "लेखक के तर्क को पूरी तरह समझने के लिए धीमे पढ़ें।", syn: "Comprehend, Grasp, Fathom" },

  // V
  { word: "Valuable", phonetic: "वैल्युएबल", type: "adjective", hindi: "मूल्यवान, कीमती", definition: "Worth a great deal of money; of great worth or importance.", example: "Time spent with a good book is always valuable.", exampleHindi: "अच्छी किताब के साथ बिताया समय हमेशा मूल्यवान होता है।", syn: "Precious, Worthwhile, Invaluable" },
  { word: "Vibrant", phonetic: "वाइब्रेंट", type: "adjective", hindi: "ऊर्जावान, जीवंत, प्रफुल्लित", definition: "Full of energy and enthusiasm.", example: "A vibrant vocabulary enriches your communication skills.", exampleHindi: "समृद्ध शब्दकोश आपकी बातचीत को प्रभावशाली बनाता है।", syn: "Lively, Energetic, Dynamic" },
  { word: "Vision", phonetic: "विज़न", type: "noun", hindi: "दृष्टि, दूरदर्शिता, भविष्य की कल्पना", definition: "The ability to think about or plan the future with imagination or wisdom.", example: "Books expand your vision beyond your current circumstances.", exampleHindi: "किताबें आपके वर्तमान से परे आपकी दूरदर्शिता को बढ़ाती हैं।", syn: "Foresight, Dream, Perception" },

  // W
  { word: "Wisdom", phonetic: "विज़डम", type: "noun", hindi: "ज्ञान, प्रज्ञा, बुद्धिमत्ता", definition: "The quality of having experience, knowledge, and good judgment.", example: "Wisdom cannot be inherited; it must be acquired through study.", exampleHindi: "ज्ञान विरासत में नहीं मिलता; इसे अध्ययन से अर्जित करना होता है।", syn: "Sagacity, Insight, Understanding" },
  { word: "Willpower", phonetic: "विलपावर", type: "noun", hindi: "इच्छाशक्ति, मनोबल", definition: "Control exerted to do something or restrain impulses.", example: "Daily reading strengthens your mental willpower.", exampleHindi: "रोज़ाना पढ़ना आपकी मानसिक इच्छाशक्ति को मजबूत करता है।", syn: "Self-control, Resolve, Drive" },

  // Z
  { word: "Zeal", phonetic: "ज़ील", type: "noun", hindi: "उत्साह, लगन, भारी जोश", definition: "Great energy or enthusiasm in pursuit of a cause or an objective.", example: "He reads every book with genuine zeal and curiosity.", exampleHindi: "वह हर किताब पूरी लगन और जिज्ञासा के साथ पढ़ता है।", syn: "Passion, Eagerness, Devotion" },
  { word: "Zenith", phonetic: "ज़ेनिथ", type: "noun", hindi: "शीर्ष, पराकाष्ठा, शिखर", definition: "The time at which something is most powerful or successful.", example: "Reaching the zenith of knowledge requires continuous learning.", exampleHindi: "ज्ञान के शिखर पर पहुंचने के लिए निरंतर सीखते रहना जरूरी है।", syn: "Peak, Pinnacle, Apex" }
];

// Helper to paginate dictionary into Real Book Pages (4 words per page)
const WORDS_PER_PAGE = 4;
function getDictionaryTotalPages() {
  return Math.ceil(DICTIONARY_WORDS.length / WORDS_PER_PAGE);
}

function getDictionaryPageWords(pageNumber) {
  const p = Math.max(1, Math.min(pageNumber, getDictionaryTotalPages()));
  const start = (p - 1) * WORDS_PER_PAGE;
  return DICTIONARY_WORDS.slice(start, start + WORDS_PER_PAGE);
}

// Export for window and module
if (typeof window !== 'undefined') {
  window.DICTIONARY_WORDS = DICTIONARY_WORDS;
  window.getDictionaryTotalPages = getDictionaryTotalPages;
  window.getDictionaryPageWords = getDictionaryPageWords;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DICTIONARY_WORDS, getDictionaryTotalPages, getDictionaryPageWords };
}
