import type { CategoryId } from "./shop";
import { hashText, tooSimilar } from "./dedupe";

export type Lang = "en" | "hinglish" | "mr";

export type Review = {
  id: string;
  cat: CategoryId | "all";
  lang: Lang;
  text: string;
};

type CategoryCore = Exclude<CategoryId, "all">;

function pick<T>(arr: readonly T[], rng = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickTwo<T>(arr: readonly T[], rng = Math.random): [T, T] {
  const i = Math.floor(rng() * arr.length);
  let j = Math.floor(rng() * (arr.length - 1));
  if (j >= i) j++;
  return [arr[i], arr[j]];
}

function pickThree<T>(arr: readonly T[], rng = Math.random): [T, T, T] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return [copy[0], copy[1], copy[2]];
}

// ============================================================================
// 1. ENGLISH KNOWLEDGE BASE — MOBILE EXCHANGE WALA (ASHOK NAGAR, NASHIK)
//    Covers: Buy • Sell • Exchange, Unused Demo Phones up to 50% Discount,
//    Sell Old Phone & Get Instant Cash, 6 Months Brand Warranty,
//    2nd Hand Smartphones, and Staff/Owner Service.
// ============================================================================

const EN_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "Visited Mobile Exchange Wala in Ashok Nagar today",
    "Stopped by Mobile Exchange Wala this evening to check their smartphone deals",
    "Best place in Ashok Nagar for buying, selling and exchanging smartphones",
    "Walked into Mobile Exchange Wala after seeing their Instagram reels",
    "Very reliable store in Ashok Nagar for unused demo phones and second-hand smartphones",
    "Had a really smooth experience at Mobile Exchange Wala Ashok Nagar",
    "Came to Mobile Exchange Wala for a phone upgrade and was thoroughly impressed",
    "If you want unused demo phones at up to 50% discount or instant cash for old phones, this is the place",
    "Great local mobile exchange hub in Ashok Nagar with honest pricing",
    "Drop by Mobile Exchange Wala if you want genuine 2nd hand and box-open phones with warranty",
    "Superb experience at Mobile Exchange Wala Ashok Nagar this weekend",
    "One-stop shop in Ashok Nagar to Buy, Sell or Exchange smartphones at the best price",
    "Purchased from Mobile Exchange Wala recently and had a five-star experience",
    "Checked a few shops around Nashik and found Mobile Exchange Wala in Ashok Nagar to be the most genuine",
    "Hands down the most trusted second-hand and demo mobile shop in Ashok Nagar, Nashik",
    "Went to Mobile Exchange Wala with a tight budget and came back with a flagship-level deal",
  ],
  buy_demo: [
    "Bought an unused demo smartphone at almost 50% discount from Mobile Exchange Wala Ashok Nagar",
    "Just picked up a box-open demo phone from Mobile Exchange Wala today",
    "Purchased a like-new 2nd hand iPhone from Mobile Exchange Wala in Ashok Nagar",
    "Got an unused demo 5G handset at an unbelievable discount at Mobile Exchange Wala",
    "Came in looking for a clean second-hand phone and found a brand-new condition demo unit at Mobile Exchange Wala",
    "Picked up a premium Samsung demo unit at nearly half price from Mobile Exchange Wala Ashok Nagar",
    "Bought a spotless pre-owned 5G smartphone from Mobile Exchange Wala today",
    "Checked multiple stores in Nashik and found the best unused demo phone deal at Mobile Exchange Wala",
    "Got a top-condition OnePlus demo phone from Mobile Exchange Wala Ashok Nagar with huge savings",
    "Bought a second-hand smartphone for my brother from Mobile Exchange Wala and it looks 100% brand new",
    "Picked up an unused demo phone with up to 50% off at Mobile Exchange Wala Ashok Nagar",
    "Found the exact iPhone model I wanted in mint demo condition at Mobile Exchange Wala",
  ],
  sell_cash: [
    "Sold my old smartphone at Mobile Exchange Wala Ashok Nagar and got instant cash on the spot",
    "Came to Mobile Exchange Wala to sell my used handset and received instant cash within 10 minutes",
    "Needed urgent cash for my old phone and Mobile Exchange Wala gave me the best price in Ashok Nagar",
    "Sold two of our old family phones at Mobile Exchange Wala today for instant cash",
    "Best place in Ashok Nagar to sell your old phone and walk out with instant cash in hand",
    "Got a much higher cash payout for my old phone at Mobile Exchange Wala than online apps",
    "Visited Mobile Exchange Wala to sell my spare handset and the instant payment was super fast",
    "Sold my used iPhone at Mobile Exchange Wala Ashok Nagar and got instant cash without any hassle",
    "If you want to sell your old phone and get instant cash immediately, Mobile Exchange Wala is the best",
    "Walked into Mobile Exchange Wala with my old Android phone and got instant cash at a very fair rate",
  ],
  exchange: [
    "Exchanged my old smartphone for an unused demo 5G model at Mobile Exchange Wala Ashok Nagar",
    "Traded in my used phone at Mobile Exchange Wala today and got a massive upgrade",
    "Got the highest exchange value on my old handset at Mobile Exchange Wala",
    "Upgraded my old phone through instant exchange at Mobile Exchange Wala Ashok Nagar",
    "Came to Mobile Exchange Wala to exchange my 2-year-old phone for a latest model",
    "Smooth buy-sell-exchange experience at Mobile Exchange Wala in Ashok Nagar",
    "Swapped my old Android for a mint-condition iPhone at Mobile Exchange Wala Ashok Nagar",
    "Got the best exchange price for my old handset at Mobile Exchange Wala compared to any other shop",
    "Traded in my old 4G handset for a 5G demo smartphone at Mobile Exchange Wala",
    "Even with minor usage marks on my old phone, Mobile Exchange Wala gave a very decent exchange rate",
  ],
  warranty: [
    "Bought a certified demo phone with 6 months brand warranty from Mobile Exchange Wala Ashok Nagar",
    "Got complete peace of mind buying a pre-owned phone here because of their 6 months brand warranty",
    "Picked up a 100% original unused demo handset with 6 months warranty at Mobile Exchange Wala",
    "Visited Mobile Exchange Wala because they provide proper bill and up to 6 months brand warranty",
    "Unlike risky online classifieds, Mobile Exchange Wala gives 6 months warranty and verified phones",
    "Every phone at Mobile Exchange Wala Ashok Nagar is thoroughly tested and comes with warranty support",
    "Bought a second-hand flagship phone with 6 months warranty assurance from Mobile Exchange Wala",
    "Checked battery health, display and original parts at Mobile Exchange Wala — 100% genuine stock",
  ],
  staff: [
    "Really impressed by the staff behaviour and owner's guidance at Mobile Exchange Wala Ashok Nagar",
    "The team at Mobile Exchange Wala treats every customer with genuine respect and transparency",
    "Polite staff, honest valuation and super quick billing at Mobile Exchange Wala",
    "Customer service at Mobile Exchange Wala Ashok Nagar is truly top notch",
    "The counter staff at Mobile Exchange Wala are patient, knowledgeable and genuinely helpful",
    "Avinash Dugdhe sir and Anil Kajalkar sir make sure every customer gets the best deal at Mobile Exchange Wala",
    "Loved how patiently the staff let me test multiple demo and 2nd hand phones without rushing",
    "Zero attitude, honest suggestions and transparent buy-sell-exchange dealing at Mobile Exchange Wala",
  ],
};

const EN_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  buy_demo: [
    "their unused demo units are in 100% scratchless condition with up to 50% discount off MRP",
    "they had a huge variety of iPhone, Samsung, OnePlus, Vivo, Oppo and Realme demo and 2nd hand phones ready",
    "the phone looks and feels completely brand new, with original display, camera and 100% working parts",
    "they let me inspect the battery health, IMEI, cameras and speakers thoroughly before buying",
    "I saved almost half the price of a new phone by picking an unused demo handset here",
    "they transferred all my WhatsApp chats, contacts and photos to the phone patiently",
    "they did not push expensive models and suggested the best value-for-money demo phone for my budget",
    "getting a flagship phone at up to 50% discount with proper bill made my day",
  ],
  sell_cash: [
    "they checked my old phone on the counter and handed over instant cash in less than 10 minutes",
    "there were no hidden deductions or last-minute excuses after quoting the cash price",
    "they gave me instant cash / UPI payment on the spot as soon as the check was done",
    "got a much better cash value for my old phone here than what online buyback sites were offering",
    "they helped me back up my data and factory-reset my old phone safely in front of me",
    "the entire process of selling my old phone for instant cash was transparent, safe and paper-clean",
    "they evaluate old phones honestly based on real condition without unfair price cuts",
  ],
  exchange: [
    "they inspected my old phone on the counter and gave a fair, transparent exchange valuation within minutes",
    "the exchange amount was deducted straight from the new purchase bill with zero confusion",
    "combining my old phone's exchange value with their unused demo discount saved me a lot of money",
    "the whole upgrade from my old phone to a newer 5G model took barely fifteen minutes",
    "they transferred my SIM, contacts and data to the upgraded phone before wiping the old one",
    "got the highest buyback bonus on my old phone compared to three other shops I checked in Nashik",
    "upgrading here is super pocket-friendly because they value your old phone fairly",
  ],
  warranty: [
    "getting up to 6 months brand warranty on an unused demo phone gives complete peace of mind",
    "every handset is multi-point checked so there is zero worry about repaired or duplicate parts",
    "they provided a proper store invoice and clear warranty coverage details right on the bill",
    "the battery health was excellent and all original accessories were neatly included",
    "buying a second-hand or demo phone feels 100% safe when backed by their 6 months warranty",
    "they verified the IMEI and original display in front of me before completing the billing",
  ],
  staff: [
    "the staff answered all my questions patiently and let me test 4–5 phones side by side",
    "billing and documentation were 100% transparent with every detail clearly mentioned",
    "they speak politely and treat every customer fairly whether you come to buy, sell or exchange",
    "Avinash Dugdhe sir and Anil Kajalkar sir personally ensure every customer gets genuine phones and honest rates",
    "they communicate comfortably in Marathi, Hindi and English so everyone feels welcome",
    "even after the purchase, they helped set up all my apps and Google account with a smile",
  ],
};

const EN_EXTRAS: readonly string[] = [
  "Their unused demo phones with up to 50% discount are truly the best deal in Nashik.",
  "Whether you want to buy, sell or exchange, they offer instant cash and 6 months brand warranty.",
  "Selling your old phone here gets you instant cash on the spot without any online waiting.",
  "Everything comes with proper billing, verified IMEI and genuine condition assurance.",
  "Located right near Ashok Nagar Police Chowki, the shop is super easy to reach.",
  "It is rare to find a store that gives both up to 50% off on demo units and top instant cash for old phones.",
  "All major brands like Apple iPhone, Samsung, OnePlus, Vivo, Oppo and Realme are available under one roof.",
];

const EN_CLOSERS: readonly string[] = [
  "Definitely my go-to shop in Ashok Nagar to Buy, Sell or Exchange phones!",
  "Highly recommended for unused demo phones, 2nd hand smartphones and instant cash.",
  "Will surely come back to Mobile Exchange Wala for our next family upgrade.",
  "Great to have such a trustworthy mobile exchange showroom in Ashok Nagar, Nashik.",
  "Five stars for their transparency, instant cash payout and 6 months warranty support.",
  "Much safer and better value buying from Mobile Exchange Wala than dealing with random online sellers.",
  "10/10 service — thank you team Mobile Exchange Wala!",
  "Do visit Mobile Exchange Wala Ashok Nagar before buying or selling any phone elsewhere.",
];

// ============================================================================
// 2. HINGLISH KNOWLEDGE BASE — MOBILE EXCHANGE WALA (ASHOK NAGAR, NASHIK)
// ============================================================================

const HI_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "Mobile Exchange Wala Ashok Nagar par aaj visit kiya, bahut hi badhiya experience raha",
    "Ashok Nagar mein phone Buy, Sell aur Exchange karne ke liye Mobile Exchange Wala sabse bharosemand dukaan hai",
    "Instagram reel dekh kar Mobile Exchange Wala aaya tha aur sach mein deal ekdum first class mili",
    "Agar Ashok Nagar Nashik mein unused demo phone ya 2nd hand mobile lena ho toh Mobile Exchange Wala best hai",
    "Aaj Mobile Exchange Wala se phone liya, staff ka vyavhaar aur pricing dono dil khush karne wale hain",
    "Purana phone bechna ho ya 50% discount tak unused demo phone lena ho, Mobile Exchange Wala sabse top hai",
    "Online OLX ke chakkar mein padne se achha Mobile Exchange Wala Ashok Nagar jaakar warranty wala phone lo",
    "Mobile Exchange Wala Ashok Nagar mein hamesha best exchange offers aur original phones milte hain",
    "Nashik ke Ashok Nagar area mein Buy, Sell aur Exchange ke liye Mobile Exchange Wala number 1 shop hai",
    "Sahi rate, 6 months warranty aur instant cash chahiye toh Mobile Exchange Wala zaroor visit karein",
  ],
  buy_demo: [
    "Mobile Exchange Wala Ashok Nagar se unused demo phone liya, lagbhag 50% discount mein naye jaisa phone mil gaya",
    "Aaj Mobile Exchange Wala se box-open demo smartphone kharida, condition ekdum 100% brand new hai",
    "Second hand iPhone lene Mobile Exchange Wala Ashok Nagar gaya tha, market se sabse sasta aur saaf piece mila",
    "Kam budget mein flagship phone chahiye tha, Mobile Exchange Wala par unused demo unit best rate mein mil gaya",
    "Mobile Exchange Wala se 2nd hand 5G smartphone liya, ek bhi scratch nahi hai aur Makkhan jaisa chalta hai",
    "Samsung aur OnePlus ke unused demo phones par upto 50% discount dekh kar turant final kar diya",
    "Brother ke liye Mobile Exchange Wala Ashok Nagar se box-open phone liya, bilkul seal pack jaisa nikla",
    "iPhone, Vivo, Oppo aur Realme ke best condition 2nd hand phones Mobile Exchange Wala par ready stock mein mile",
  ],
  sell_cash: [
    "Apna purana phone Mobile Exchange Wala Ashok Nagar par becha aur haatho-haath instant cash mil gaya",
    "Old phone sell karke instant cash lene ke liye Mobile Exchange Wala Ashok Nagar sabse best jagah hai",
    "Urgent cash ki zaroorat thi, Mobile Exchange Wala ne 10 minute mein mera purana phone check karke instant cash de diya",
    "Ghar mein pade do purane smartphones Mobile Exchange Wala par sell kiye aur turant cash payment mila",
    "Online apps se kahin zyada achha rate aur instant cash mujhe Mobile Exchange Wala Ashok Nagar par mila",
    "Apna used phone bechne Mobile Exchange Wala aaya tha, bina kisi jhanjhat ke turant cash haath mein mil gaya",
    "Sell your old phone & get instant cash — sach mein Mobile Exchange Wala par 5 minute mein payment ho gaya",
  ],
  exchange: [
    "Apna purana phone Mobile Exchange Wala Ashok Nagar par exchange karke naya jaisa 5G demo phone liya",
    "Old mobile dekar upgrade karne ke liye Mobile Exchange Wala best jagah hai",
    "Purane handset ki bahut badiya exchange value mili Mobile Exchange Wala par",
    "Mobile Exchange Wala Ashok Nagar mein phone exchange ka process ekdum simple aur fast tha",
    "2 saal purana phone exchange kiya Mobile Exchange Wala par, poore market se sabse achha rate mila",
    "Used phone dekar unused demo iPhone liya Mobile Exchange Wala se, bahut paise bach gaye",
    "Purane 4G phone ke badle 5G smartphone Mobile Exchange Wala se zabardast exchange offer mein mila",
  ],
  warranty: [
    "Mobile Exchange Wala Ashok Nagar se 6 months brand warranty ke saath demo phone liya, poori tasalli hai",
    "Second hand ya demo phone lene mein dar lagta tha par yahan 6 months warranty aur pakka bill mila",
    "100% original display aur battery health wala phone 6 mahine ki warranty ke saath Mobile Exchange Wala se liya",
    "Har phone poora check kiya hua hota hai aur saath mein 6 months brand warranty milti hai",
    "Pakke bill aur 6 months warranty ki wajah se Mobile Exchange Wala par aankh band karke bharosa kar sakte ho",
  ],
  staff: [
    "Mobile Exchange Wala Ashok Nagar ke staff aur Avinash Dugdhe bhai aur Anil Kajalkar bhai ka behaviour bahut hi polite hai",
    "Yahan ke staff customer ki baat dhyan se sunte hain aur budget ke hisaab se sahi phone suggest karte hain",
    "Mobile Exchange Wala par dealing ekdum transparent hai, koi chhupi hui baat nahi rakhte",
    "Counter par baithe bhaiya ne 4-5 demo phones aaram se check karwaye aur saare doubts clear kiye",
    "Avinash Dugdhe sir aur Anil Kajalkar sir khud dhyan dete hain ki har customer ko best deal mile",
  ],
};

const HI_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  buy_demo: [
    "unused demo phone par upto 50% tak discount mil gaya jisse aadhe daam mein top model aa gaya",
    "phone ekdum scratchless aur 100% original condition mein hai, koi bol nahi sakta ki box-open hai",
    "mere saamne camera, speaker, display aur battery health check karwa ke poori tasalli karwayi",
    "iPhone, Samsung, OnePlus, Vivo aur Oppo ke dher saare demo aur 2nd hand models ready stock mein the",
    "purane phone se saara data, WhatsApp aur contacts naye phone mein aaram se transfer bhi kar diya",
    "bina mehnga model push kiye mere budget mein sabse best demo phone suggest kiya",
  ],
  sell_cash: [
    "counter par hi purana phone check kiya aur bina faltu kamiyan nikaale turant instant cash haath mein de diya",
    "sirf 10 minute ke andar old phone ka valuation aur instant cash / UPI payment dono ho gaya",
    "online exchange apps jitna dikha rahe the usse kaafi zyada paisa mujhe yahan haatho-haath mil gaya",
    "mera data backup lene ke baad mere saamne hi old phone factory reset karwaya jisse privacy 100% safe rahi",
    "jo rate bolte hain wahi dete hain, baad mein koi hidden deduction nahi karte",
  ],
  exchange: [
    "purane phone ka daam seedha naye phone ke bill mein minus ho gaya, bilkul asaan hisaab raha",
    "old phone ki best buyback value aur upar se demo phone ka discount mila kar bahut badi bachat ho gayi",
    "15 minute ke andar purana phone dekar upgraded 5G phone haath mein aa gaya",
    "purane phone mein halka scratch hone ke baad bhi bahut sahi exchange rate lagaya",
  ],
  warranty: [
    "6 months brand warranty aur pakka bill milne se second-hand/demo phone lene ki koi tension nahi rahi",
    "phone ka har part 100% original hai aur IMEI bhi bill ke saath match karke dikhaya",
    "battery backup aur charging speed showroom mein hi test karwayi, ekdum naye jaisa performance hai",
    "6 mahine ki warranty milne ki wajah se ghar wale bhi poori tarah khush aur tension-free hain",
  ],
  staff: [
    "itne sawaal poochne aur 5-6 phones check karne par bhi staff ne muskura kar poora saath diya",
    "Buy, Sell ya Exchange — har kaam mein 100% imandari aur saaf vyavhaar rakhte hain",
    "Marathi, Hindi aur English teeno mein aaram se samjha dete hain",
    "Avinash Dugdhe bhai aur Anil Kajalkar bhai ki team customer ko hamesha best rate deti hai",
  ],
};

const HI_EXTRAS: readonly string[] = [
  "Yahan unused demo phones par upto 50% discount aur 6 months brand warranty dono milti hai.",
  "Agar purana phone bechna ho toh yahan turant instant cash mil jata hai.",
  "Buy ● Sell ● Exchange ke liye Ashok Nagar mein isse badiya aur bharosemand jagah koi nahi hai.",
  "Pakka bill aur 100% original tested phones milte hain toh poora bharosa rehta hai.",
  "Ashok Nagar Police Chowki ke paas hi shop hai toh aana-jaana bhi ekdum aasan hai.",
];

const HI_CLOSERS: readonly string[] = [
  "Ashok Nagar mein phone Buy, Sell ya Exchange karna ho toh aankh band karke Mobile Exchange Wala jao!",
  "Dil se 5 star, agli baar bhi phone upgrade yahin se karenge.",
  "Sahi daam, instant cash, 6 months warranty aur badiya vyavhaar — aur kya chahiye!",
  "Apne doston aur family ko bhi main Mobile Exchange Wala Ashok Nagar hi recommend karunga.",
  "Paisa vasool experience raha, poori tarah satisfied hoon.",
  "Thank you Mobile Exchange Wala team itni badiya deal dene ke liye!",
];

// ============================================================================
// 3. MARATHI KNOWLEDGE BASE — मोबाईल एक्सचेंज वाला (अशोक नगर, नाशिक)
// ============================================================================

const MR_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "आज अशोक नगर मधील Mobile Exchange Wala (मोबाईल एक्सचेंज वाला) ला भेट दिली, अनुभव अतिशय उत्तम होता",
    "अशोक नगर, नाशिक मध्ये मोबाईल Buy, Sell आणि Exchange साठी Mobile Exchange Wala हे सर्वात खात्रीशीर दुकान आहे",
    "इंस्टाग्राम रील पाहून Mobile Exchange Wala मध्ये आलो होतो आणि खरोखरच खूप छान डील मिळाली",
    "अशोक नगर मध्ये अनयुज्ड डेमो फोन्स आणि सेकंड हँड मोबाईल घेण्यासाठी Mobile Exchange Wala सर्वोत्तम पर्याय आहे",
    "जुना फोन विकून लगेच रोख पैसे (Instant Cash) मिळवण्यासाठी किंवा नवीन फोन घेण्यासाठी एक नंबर ठिकाण",
    "ऑनलाईन फसवणुकीपेक्षा Mobile Exchange Wala अशोक नगर मधून वॉरंटीसह फोन घेणे कधीही चांगले",
    "कमी बजेटमध्ये ५०% पर्यंत डिस्काउंटवर भारी स्मार्टफोन देणारे अशोक नगरमधील हक्काचे दुकान म्हणजे Mobile Exchange Wala",
  ],
  buy_demo: [
    "आज Mobile Exchange Wala अशोक नगर मधून जवळपास ५०% डिस्काउंटमध्ये अनयुज्ड डेमो (Unused Demo) स्मार्टफोन घेतला",
    "माझा सेकंड हँड iPhone मी Mobile Exchange Wala मधून घेतला, कंडिशन अगदी नवीन बॉक्स पॅक फोनसारखी आहे",
    "बॉक्स-ओपन डेमो 5G फोन घेण्यासाठी Mobile Exchange Wala मध्ये गेलो होतो, मार्केटपेक्षा खूपच कमी रेटमध्ये मिळाला",
    "कमी किमतीत फ्लॅगशिप फोन हवा होता, Mobile Exchange Wala मध्ये अनयुज्ड डेमो युनिटवर मस्त ऑफर मिळाली",
    "Samsung, OnePlus आणि iPhone चे एकदम क्लीन कंडिशनमधील फोन्स येथे अर्ध्या किमतीत पाहायला मिळाले",
    "भावासाठी Mobile Exchange Wala अशोक नगर मधून सेकंड हँड 5G मोबाईल घेतला, एकही स्क्रॅच नाही",
  ],
  sell_cash: [
    "माझा जुना मोबाईल Mobile Exchange Wala अशोक नगर मध्ये विकला आणि लगेच हातात Instant Cash मिळाली",
    "जुना फोन विकून ताबडतोब कॅश मिळवण्यासाठी अशोक नगरमध्ये Mobile Exchange Wala सारखे दुसरे दुकान नाही",
    "अर्जंट पैशांची गरज होती, Mobile Exchange Wala मध्ये १० मिनिटांत जुना फोन तपासून लगेच रोख पैसे दिले",
    "घरातील दोन जुने फोन्स आज Mobile Exchange Wala मध्ये विकले आणि ऑनलाईनपेक्षा जास्त किंमत व लगेच कॅश मिळाली",
    "कोणतीही कटकट न करता जुन्या फोनचे योग्य पैसे लगेच हातात देणारे खात्रीशीर ठिकाण म्हणजे Mobile Exchange Wala",
  ],
  exchange: [
    "माझा जुना फोन Mobile Exchange Wala अशोक नगर मध्ये एक्सचेंज करून भारी 5G डेमो फोन घेतला",
    "जुना मोबाईल देऊन दुसरा फोन घेण्यासाठी Mobile Exchange Wala ही सर्वात उत्तम जागा आहे",
    "जुन्या हँडसेटला Mobile Exchange Wala मध्ये खूप चांगली एक्सचेंज किंमत मिळाली",
    "माझा २ वर्ष जुना फोन येथे एक्सचेंज केला, इतर दुकानांपेक्षा खूप जास्त रेट मिळाला",
    "जुना 4G फोन देऊन कमी खर्चात नवीनसारखा 5G स्मार्टफोन घरी नेला",
  ],
  warranty: [
    "Mobile Exchange Wala अशोक नगर मधून ६ महिने ब्रँड वॉरंटीसह (6 Months Warranty) डेमो फोन घेतला",
    "सेकंड हँड किंवा डेमो फोन घेताना ६ महिन्यांची वॉरंटी आणि पक्के बिल मिळाल्यामुळे पूर्ण खात्री वाटली",
    "येथील प्रत्येक मोबाईल पूर्णपणे चेक केलेला असतो आणि १००% ओरिजिनल पार्ट्सची गॅरंटी मिळते",
    "बॅटरी हेल्थ, कॅमेरा आणि डिस्प्ले समोरच चेक करून ६ महिने वॉरंटीसह फोन दिला",
  ],
  staff: [
    "Mobile Exchange Wala अशोक नगर मधील स्टाफ आणि अविनाश दुग्धे सर व अनिल काजळकर सर यांचे बोलणे अतिशय नम्र आहे",
    "येथील स्टाफ ग्राहकांचे बजेट समजून घेऊन सर्वात चांगला डेमो किंवा सेकंड हँड फोन सुचवतो",
    "काउंटरवरील स्टाफने खूप शांतपणे ४-५ फोन्स दाखवले आणि सर्व माहिती दिली",
    "ग्राहक सेवेच्या आणि पारदर्शक व्यवहाराच्या बाबतीत Mobile Exchange Wala अशोक नगर ला १० पैकी १० गुण!",
  ],
};

const MR_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  buy_demo: [
    "अनयुज्ड डेमो फोन्सवर ५०% पर्यंत डिस्काउंट मिळाल्यामुळे खूपच कमी पैशात भारी मॉडेल मिळाले",
    "फोन अगदी नवीनसारखा चकाचक आहे, ओरिजिनल डिस्प्ले आणि कॅमेरा क्वालिटी एक नंबर आहे",
    "माझ्यासमोरच बॅटरी हेल्थ, IMEI, स्पीकर आणि कॅमेरा व्यवस्थित चेक करून दिला",
    "जुन्या फोनमधील सर्व कॉन्टॅक्ट्स, फोटो आणि WhatsApp डेटा नवीन फोनमध्ये ट्रान्सफर करून दिला",
    "सर्व नामांकित ब्रँड्सचे डेमो आणि सेकंड हँड फोन्स एकाच छताखाली उपलब्ध होते",
  ],
  sell_cash: [
    "काउंटरवरच माझा जुना फोन चेक करून अवघ्या १० मिनिटांत लगेच रोख पैसे (Instant Cash) दिले",
    "ऑनलाईन अ‍ॅप्सपेक्षा मला येथे जुन्या फोनची खूप चांगली किंमत मिळाली",
    "ठरलेल्या किमतीतून कोणतेही विनाकारण पैसे कापले नाहीत, व्यवहार एकदम चोख झाला",
    "माझा सर्व डेटा बॅकअप घेऊन समोरच जुना फोन सुरक्षितपणे फॉरमॅट करून दिला",
  ],
  exchange: [
    "जुन्या फोनचे पैसे थेट नवीन फोनच्या बिलातून वजा केले, कोणताही गोंधळ झाला नाही",
    "जुन्या फोनची उत्तम एक्सचेंज किंमत आणि डेमो फोनवरील डिस्काउंट यामुळे खूप मोठी बचत झाली",
    "अवघ्या १५ मिनिटांत जुना फोन देऊन अपग्रेड केलेला स्मार्टफोन हातात मिळाला",
  ],
  warranty: [
    "६ महिन्यांची ब्रँड वॉरंटी आणि पक्के बिल मिळाल्यामुळे मनात कोणतीही शंका राहिली नाही",
    "फोन कधीही रिपेअर झालेला नाही आणि १००% ओरिजिनल आहे याची पूर्ण खात्री करून दिली",
    "वॉरंटी असल्यामुळे सेकंड हँड किंवा बॉक्स-ओपन फोन घेताना पूर्ण सुरक्षित वाटते",
  ],
  staff: [
    "खूप प्रश्न विचारूनही स्टाफने हसतमुखाने उत्तरे दिली आणि फोन टेस्ट करू दिला",
    "फोन घ्यायचा असो, विकायचा असो किंवा एक्सचेंज करायचा असो — प्रत्येक ग्राहकाला योग्य मान दिला जातो",
    "अविनाश दुग्धे सर व अनिल काजळकर सर स्वतः प्रत्येक ग्राहकाला योग्य डील मिळतेय का याकडे लक्ष देतात",
  ],
};

const MR_EXTRAS: readonly string[] = [
  "येथे अनयुज्ड डेमो फोन्सवर ५०% पर्यंत सूट आणि ६ महिन्यांची ब्रँड वॉरंटी मिळते.",
  "तसेच तुमचा जुना फोन विकून लगेच रोख पैसे (Instant Cash) मिळवण्याची सोय आहे.",
  "Buy ● Sell ● Exchange साठी अशोक नगरमधील सर्वात विश्वासू ठिकाण म्हणजे Mobile Exchange Wala.",
  "पक्के बिल आणि १००% ओरिजिनल चेक केलेले फोन्स मिळत असल्यामुळे पूर्ण खात्री राहते.",
];

const MR_CLOSERS: readonly string[] = [
  "अशोक नगर मध्ये फोन घ्यायचा, विकायचा किंवा एक्सचेंज करायचा असेल तर नक्कीच Mobile Exchange Wala ला भेट द्या!",
  "मनापासून ५ स्टार! पुढच्या वेळीही इथूनच फोन घेणार.",
  "योग्य दर, Instant Cash, ६ महिने वॉरंटी आणि आपुलकीची सेवा — अजून काय हवे!",
  "माझ्या सर्व मित्रांना आणि नातेवाईकांना मी Mobile Exchange Wala अशोक नगरच सुचवेन.",
  "उत्तम सेवेबद्दल Mobile Exchange Wala टीमचे खूप खूप आभार!",
];

// ============================================================================
// Curated standalone reviews
// ============================================================================

const STANDALONE_EN: readonly Review[] = [
  { id: "s-en-1", cat: "buy_demo", lang: "en", text: "Bought an unused demo 5G smartphone from Mobile Exchange Wala Ashok Nagar at almost 50% discount! Condition is 100% brand new with 6 months warranty. Best deal in Nashik." },
  { id: "s-en-2", cat: "sell_cash", lang: "en", text: "Sold my old phone at Mobile Exchange Wala Ashok Nagar today and got instant cash in hand within 10 minutes. Very honest valuation and zero hassle." },
  { id: "s-en-3", cat: "exchange", lang: "en", text: "Exchanged my old handset for a mint condition iPhone at Mobile Exchange Wala. Got a much higher buyback price than online apps and smooth counter service." },
  { id: "s-en-4", cat: "warranty", lang: "en", text: "Purchased a box-open demo phone with 6 months brand warranty and proper bill at Mobile Exchange Wala Ashok Nagar. 100% genuine and tested device." },
  { id: "s-en-5", cat: "staff", lang: "en", text: "What stands out at Mobile Exchange Wala Ashok Nagar is how transparently Avinash Dugdhe sir, Anil Kajalkar sir and the staff deal with customers for Buy, Sell & Exchange." },
];

const STANDALONE_HI: readonly Review[] = [
  { id: "s-hi-1", cat: "buy_demo", lang: "hinglish", text: "Mobile Exchange Wala Ashok Nagar se unused demo phone liya upto 50% discount mein! Condition ekdum seal pack jaisi hai aur 6 months brand warranty bhi mili. Full 5 star!" },
  { id: "s-hi-2", cat: "sell_cash", lang: "hinglish", text: "Apna purana phone sell karne Mobile Exchange Wala Ashok Nagar gaya tha. 10 minute mein check karke best rate aur haatho-haath instant cash de diya." },
  { id: "s-hi-3", cat: "exchange", lang: "hinglish", text: "Purana mobile dekar Mobile Exchange Wala se upgraded 5G phone liya. Counter par hi achha exchange rate diya aur seedha bill mein minus kar diya." },
  { id: "s-hi-4", cat: "warranty", lang: "hinglish", text: "2nd hand aur unused demo phones par 6 months brand warranty aur pakka bill milta hai. Ashok Nagar mein sabse bharosemand mobile exchange shop!" },
  { id: "s-hi-5", cat: "staff", lang: "hinglish", text: "Mobile Exchange Wala Ashok Nagar ka staff bahut tameez se baat karta hai. Buy, Sell ya Exchange — har cheez mein sahi rate aur badhiya service dete hain." },
];

const STANDALONE_MR: readonly Review[] = [
  { id: "s-mr-1", cat: "buy_demo", lang: "mr", text: "आज Mobile Exchange Wala अशोक नगर मधून ५०% पर्यंत डिस्काउंटवर अनयुज्ड डेमो स्मार्टफोन घेतला. फोन अगदी नवीनसारखा आहे आणि ६ महिने वॉरंटी सुद्धा मिळाली!" },
  { id: "s-mr-2", cat: "sell_cash", lang: "mr", text: "माझा जुना मोबाईल Mobile Exchange Wala अशोक नगर मध्ये विकला आणि १० मिनिटांत लगेच हातात रोख पैसे (Instant Cash) मिळाले. खूपच पारदर्शक व्यवहार!" },
  { id: "s-mr-3", cat: "exchange", lang: "mr", text: "जुना मोबाईल एक्सचेंज करून Mobile Exchange Wala मधून भारी फोन घेतला. ऑनलाईनपेक्षा जास्त एक्सचेंज किंमत मिळाली आणि १५ मिनिटांत काम झाले." },
  { id: "s-mr-4", cat: "warranty", lang: "mr", text: "सेकंड हँड आणि डेमो फोनवर ६ महिने ब्रँड वॉरंटी आणि पक्के बिल देणारे अशोक नगरमधील सर्वात खात्रीशीर दुकान म्हणजे Mobile Exchange Wala!" },
  { id: "s-mr-5", cat: "staff", lang: "mr", text: "Mobile Exchange Wala अशोक नगर मधील स्टाफ आणि अविनाश दुग्धे व अनिल काजळकर सर खूप आपुलकीने मार्गदर्शन करतात. Buy, Sell आणि Exchange साठी नक्की भेट द्या!" },
];

function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function synthesizeSmartReview(
  cat: CategoryId,
  lang: Lang,
  usedIds: Set<string>,
  usedTexts: string[]
): { text: string; id: string } {
  const allCats: CategoryCore[] = [
    "buy_demo",
    "sell_cash",
    "exchange",
    "warranty",
    "staff",
  ];

  for (let attempt = 0; attempt < 60; attempt++) {
    const primaryCat: CategoryCore = cat === "all" ? pick(allCats) : cat;
    const useGeneralOpener = cat === "all" ? Math.random() < 0.45 : Math.random() < 0.22;
    const style = Math.floor(Math.random() * 8);

    let text = "";

    if (lang === "en") {
      const openerPool = useGeneralOpener ? EN_OPENERS.general : EN_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(EN_CLOSERS);
      const extra = pick(EN_EXTRAS);

      if (style === 0) {
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}, and ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(EN_EXPERIENCES[c1]);
        const e2 = pick(EN_EXPERIENCES[c2]);
        text = `${opener}. Whether you want to buy, sell or exchange, ${e1}, and ${e2}. ${closer}`;
      } else if (style === 2) {
        const [e1, e2] = pickTwo(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. First off, ${e1}. Also, ${e2}. ${closer}`;
      } else if (style === 3) {
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${extra} ${closer}`;
      } else if (style === 4) {
        const [e1, e2] = pickTwo(EN_EXPERIENCES[primaryCat]);
        text = `${opener} — ${e1}, plus ${e2}. ${extra} ${closer}`;
      } else if (style === 5) {
        const secondaryCat = pick(allCats.filter((c) => c !== primaryCat));
        const e1 = pick(EN_EXPERIENCES[primaryCat]);
        const e2 = pick(EN_EXPERIENCES[secondaryCat]);
        text = `${opener}. ${capFirst(e1)}. On top of that, ${e2}. ${closer}`;
      } else if (style === 6) {
        const [e1, e2, e3] = pickThree(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. What I liked most is that ${e1}, ${e2}, and ${e3}. ${closer}`;
      } else {
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${closer}`;
      }
    } else if (lang === "mr") {
      const openerPool = useGeneralOpener ? MR_OPENERS.general : MR_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(MR_CLOSERS);
      const extra = pick(MR_EXTRAS);

      if (style === 0) {
        const exp = pick(MR_EXPERIENCES[primaryCat]);
        text = `${opener}, आणि ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(MR_EXPERIENCES[c1]);
        const e2 = pick(MR_EXPERIENCES[c2]);
        text = `${opener}. येथे ${e1}, तसेच ${e2}. ${closer}`;
      } else if (style === 2) {
        const [e1, e2] = pickTwo(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. सर्वात महत्त्वाचे म्हणजे ${e1}. याशिवाय ${e2}. ${closer}`;
      } else if (style === 3) {
        const exp = pick(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. ${exp}. ${extra} ${closer}`;
      } else if (style === 4) {
        const [e1, e2] = pickTwo(MR_EXPERIENCES[primaryCat]);
        text = `${opener} — ${e1}, आणि सोबतच ${e2}. ${extra} ${closer}`;
      } else if (style === 5) {
        const secondaryCat = pick(allCats.filter((c) => c !== primaryCat));
        const e1 = pick(MR_EXPERIENCES[primaryCat]);
        const e2 = pick(MR_EXPERIENCES[secondaryCat]);
        text = `${opener}. ${e1}. तसेच ${e2}. ${closer}`;
      } else if (style === 6) {
        const [e1, e2] = pickTwo(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. मला सर्वात जास्त आवडलेली गोष्ट म्हणजे ${e1}, आणि ${e2}. ${closer}`;
      } else {
        const exp = pick(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. विशेष म्हणजे ${exp}. ${closer}`;
      }
    } else {
      const openerPool = useGeneralOpener ? HI_OPENERS.general : HI_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(HI_CLOSERS);
      const extra = pick(HI_EXTRAS);

      if (style === 0) {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        text = `${opener}, aur ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(HI_EXPERIENCES[c1]);
        const e2 = pick(HI_EXPERIENCES[c2]);
        text = `${opener}. Yahan ${e1}, aur saath hi ${e2}. ${closer}`;
      } else if (style === 2) {
        const [e1, e2] = pickTwo(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. Sabse achhi baat yeh lagi ki ${e1}. Iske alawa ${e2}. ${closer}`;
      } else if (style === 3) {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${extra} ${closer}`;
      } else if (style === 4) {
        const [e1, e2] = pickTwo(HI_EXPERIENCES[primaryCat]);
        text = `${opener} — ${e1}, aur saath mein ${e2}. ${extra} ${closer}`;
      } else if (style === 5) {
        const secondaryCat = pick(allCats.filter((c) => c !== primaryCat));
        const e1 = pick(HI_EXPERIENCES[primaryCat]);
        const e2 = pick(HI_EXPERIENCES[secondaryCat]);
        text = `${opener}. ${capFirst(e1)}. Aur sabse badiya baat ki ${e2}. ${closer}`;
      } else if (style === 6) {
        const [e1, e2, e3] = pickThree(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. Yahan ${e1}, ${e2}, aur ${e3}. ${closer}`;
      } else {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${closer}`;
      }
    }

    const id = hashText(text);
    if (!usedIds.has(id) && !tooSimilar(text, usedTexts.slice(-35))) {
      return { text, id };
    }
  }

  const primaryCat: CategoryCore = cat === "all" ? pick(allCats) : cat;
  const opener =
    lang === "en"
      ? pick(EN_OPENERS[primaryCat])
      : lang === "mr"
      ? pick(MR_OPENERS[primaryCat])
      : pick(HI_OPENERS[primaryCat]);
  const exp =
    lang === "en"
      ? pick(EN_EXPERIENCES[primaryCat])
      : lang === "mr"
      ? pick(MR_EXPERIENCES[primaryCat])
      : pick(HI_EXPERIENCES[primaryCat]);
  const closer =
    lang === "en" ? pick(EN_CLOSERS) : lang === "mr" ? pick(MR_CLOSERS) : pick(HI_CLOSERS);
  const text = `${opener}. ${capFirst(exp)}. ${closer}`;
  return { text, id: hashText(text + Date.now()) };
}

export function listReviews(cat: string, lang: Lang): Review[] {
  const base =
    lang === "hinglish" ? STANDALONE_HI : lang === "mr" ? STANDALONE_MR : STANDALONE_EN;
  return base.filter((r) => cat === "all" || r.cat === cat || r.cat === "all");
}

export function normalizeLang(raw: string | null): Lang {
  if (raw === "mr" || raw === "marathi") return "mr";
  if (raw === "hinglish" || raw === "hi") return "hinglish";
  return "en";
}

export function normalizeCat(raw: string | null): CategoryId {
  const ids: CategoryId[] = [
    "all",
    "buy_demo",
    "sell_cash",
    "exchange",
    "warranty",
    "staff",
  ];
  return ids.includes(raw as CategoryId) ? (raw as CategoryId) : "all";
}
