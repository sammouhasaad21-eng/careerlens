// i18n.js — نظام اللغات لـ CareerLens
// يدعم: العربية (ar) والألمانية (de) والإنجليزية (en)

const TRANSLATIONS = {
  en: {
    dir: 'ltr',
    nav_how: 'How it works',
    nav_features: 'Features',
    nav_faq: 'FAQ',
    nav_try: 'Try free →',
    hero_eyebrow: 'Free for IT professionals',
    hero_h1: 'Find out exactly why<br/>you didn\'t get<br/>the interview.',
    hero_sub: 'Paste your CV and a job description. Get your match score, missing skills, CV improvements, interview questions, and a personalized learning roadmap — in under 30 seconds.',
    hero_btn: 'Analyze my CV — it\'s free',
    hero_note: 'No signup required. No CV stored.',
    stat1_val: '30 sec',
    stat1_label: 'Average analysis time',
    stat2_val: '10 insights',
    stat2_label: 'Per analysis',
    stat3_val: '100% IT-focused',
    stat3_label: 'Built for tech roles',
    problem_label: 'The problem',
    problem_h2: 'You\'re applying in the dark.',
    problem_title: 'What most job seekers experience',
    problem_1: 'Apply to dozens of roles with the same generic CV',
    problem_2: 'Get rejected with zero feedback',
    problem_3: 'Don\'t know if ATS systems are filtering them out',
    problem_4: 'Waste months learning the wrong skills',
    problem_5: 'Pay €200+ for a professional CV writer',
    solution_title: 'What CareerLens gives you',
    solution_1: 'An exact match score for every role you apply to',
    solution_2: 'The precise skills the employer is looking for',
    solution_3: 'Sentence-level CV improvements with before/after',
    solution_4: 'A 6-week learning roadmap for your gaps',
    solution_5: '5 tailored interview questions to prepare for',
    howitworks_label: 'How it works',
    howitworks_h2: 'Three steps. Thirty seconds.',
    step1_h: 'Paste your CV',
    step1_p: 'Copy and paste your CV as plain text. No file upload, no account needed.',
    step2_h: 'Paste the job description',
    step2_p: 'Copy the full job posting — requirements, responsibilities, everything.',
    step3_h: 'Get your analysis',
    step3_p: 'In 30 seconds, you receive your match score, missing skills, CV improvements, interview questions, and a learning roadmap.',
    features_label: 'What you get',
    features_h2: 'Ten insights per analysis.',
    f1_h: 'Match score', f1_p: 'A 0–100 score showing how well your CV aligns with this specific role.',
    f2_h: 'Missing skills', f2_p: 'The exact skills in the job description that aren\'t in your CV.',
    f3_h: 'CV improvements', f3_p: 'Before/after rewrites for specific lines in your CV.',
    f4_h: 'Interview questions', f4_p: '5 questions the interviewer is likely to ask.',
    f5_h: 'Learning roadmap', f5_p: 'A prioritized 6-week plan: which skills to learn first.',
    f6_h: 'Portfolio projects', f6_p: 'Two concrete project ideas that demonstrate the skills this employer wants.',
    analyzer_label: 'The tool',
    analyzer_h2: 'Analyze your CV now.',
    analyzer_intro: 'Paste your CV and the job description below. No signup, no email, no CV stored.',
    cv_label: 'Your CV',
    cv_hint: 'Paste as plain text. Include all sections.',
    cv_placeholder: 'Paste your full CV here...',
    jd_label: 'Job description',
    jd_hint: 'Paste the full posting including requirements.',
    jd_placeholder: 'Paste the full job description here...',
    analyze_btn: 'Analyze my CV →',
    free_note: 'Free · 3 analyses per day · No signup',
    score_title: 'Match score',
    tab_skills: 'Missing skills',
    tab_improvements: 'CV improvements',
    tab_questions: 'Interview questions',
    tab_roadmap: 'Learning roadmap',
    tab_projects: 'Portfolio ideas',
    share_btn: 'Share your score',
    new_btn: 'New analysis',
    faq_label: 'Questions',
    faq_h2: 'Frequently asked.',
    faq1_q: 'Is my CV stored anywhere?',
    faq1_a: 'No. Your CV and job description are sent directly to the AI for analysis and are never stored on our servers.',
    faq2_q: 'How accurate is the match score?',
    faq2_a: 'The score reflects how well your CV language matches the job description\'s requirements. Use it as a guide, not a verdict.',
    faq3_q: 'Does it work for non-IT jobs?',
    faq3_a: 'CareerLens is specifically designed for IT roles — software engineering, DevOps, data science, cloud, QA, and related fields.',
    faq4_q: 'How many analyses can I run for free?',
    faq4_a: '3 per day on the free plan. Upgrade to Pro for unlimited analyses.',
    cta_h2: 'Stop guessing. Start improving.',
    cta_sub: 'Paste your CV and a job description. Get your honest score in 30 seconds. Free to start.',
    cta_btn: 'Analyze my CV now →',
    footer_desc: 'AI-powered CV analysis for IT professionals.',
    footer_copy: '© 2025 CareerLens. Made with ☕ and zero budget.',
  },

  de: {
    dir: 'ltr',
    nav_how: 'Wie es funktioniert',
    nav_features: 'Funktionen',
    nav_faq: 'FAQ',
    nav_try: 'Kostenlos testen →',
    hero_eyebrow: 'Kostenlos für IT-Fachleute',
    hero_h1: 'Finde heraus, warum du<br/>keine Einladung<br/>bekommen hast.',
    hero_sub: 'Füge deinen Lebenslauf und eine Stellenbeschreibung ein. Erhalte deinen Match-Score, fehlende Skills, CV-Verbesserungen, Interviewfragen und einen Lernplan — in unter 30 Sekunden.',
    hero_btn: 'Meinen CV analysieren — kostenlos',
    hero_note: 'Keine Registrierung. Kein CV gespeichert.',
    stat1_val: '30 Sek',
    stat1_label: 'Durchschnittliche Analysezeit',
    stat2_val: '10 Einblicke',
    stat2_label: 'Pro Analyse',
    stat3_val: '100% IT-fokussiert',
    stat3_label: 'Für Tech-Berufe',
    problem_label: 'Das Problem',
    problem_h2: 'Du bewirbst dich im Dunkeln.',
    problem_title: 'Was die meisten Bewerber erleben',
    problem_1: 'Mit demselben generischen CV auf Dutzende Stellen bewerben',
    problem_2: 'Ohne Feedback abgelehnt werden',
    problem_3: 'Nicht wissen, ob ATS-Systeme sie herausfiltern',
    problem_4: 'Monate damit verschwenden, die falschen Skills zu lernen',
    problem_5: '€200+ für einen professionellen CV-Schreiber bezahlen',
    solution_title: 'Was CareerLens dir gibt',
    solution_1: 'Einen genauen Match-Score für jede Stelle',
    solution_2: 'Die genauen Skills, die der Arbeitgeber sucht',
    solution_3: 'CV-Verbesserungen mit Vorher/Nachher',
    solution_4: 'Einen 6-Wochen-Lernplan für deine Lücken',
    solution_5: '5 maßgeschneiderte Interviewfragen zur Vorbereitung',
    howitworks_label: 'So funktioniert es',
    howitworks_h2: 'Drei Schritte. Dreißig Sekunden.',
    step1_h: 'CV einfügen',
    step1_p: 'Kopiere deinen CV als einfachen Text. Kein Datei-Upload, kein Konto nötig.',
    step2_h: 'Stellenbeschreibung einfügen',
    step2_p: 'Kopiere die vollständige Stellenanzeige — Anforderungen, Aufgaben, alles.',
    step3_h: 'Analyse erhalten',
    step3_p: 'In 30 Sekunden erhältst du deinen Match-Score, fehlende Skills, CV-Verbesserungen, Interviewfragen und einen Lernplan.',
    features_label: 'Was du bekommst',
    features_h2: 'Zehn Einblicke pro Analyse.',
    f1_h: 'Match-Score', f1_p: 'Ein 0–100 Score, der zeigt, wie gut dein CV zur Stelle passt.',
    f2_h: 'Fehlende Skills', f2_p: 'Die genauen Skills in der Stellenbeschreibung, die in deinem CV fehlen.',
    f3_h: 'CV-Verbesserungen', f3_p: 'Vorher/Nachher-Umschreibungen für bestimmte Zeilen in deinem CV.',
    f4_h: 'Interviewfragen', f4_p: '5 Fragen, die der Interviewer wahrscheinlich stellen wird.',
    f5_h: 'Lernplan', f5_p: 'Ein priorisierter 6-Wochen-Plan: Welche Skills du zuerst lernen solltest.',
    f6_h: 'Portfolio-Projekte', f6_p: 'Zwei konkrete Projektideen, die genau die Skills zeigen, die der Arbeitgeber möchte.',
    analyzer_label: 'Das Tool',
    analyzer_h2: 'Analysiere deinen CV jetzt.',
    analyzer_intro: 'Füge deinen CV und die Stellenbeschreibung unten ein. Keine Registrierung, keine E-Mail, kein CV gespeichert.',
    cv_label: 'Dein Lebenslauf',
    cv_hint: 'Als einfachen Text einfügen. Alle Abschnitte einschließen.',
    cv_placeholder: 'Füge deinen vollständigen CV hier ein...',
    jd_label: 'Stellenbeschreibung',
    jd_hint: 'Die vollständige Anzeige einschließlich Anforderungen einfügen.',
    jd_placeholder: 'Füge die vollständige Stellenbeschreibung hier ein...',
    analyze_btn: 'Meinen CV analysieren →',
    free_note: 'Kostenlos · 3 Analysen pro Tag · Keine Registrierung',
    score_title: 'Match-Score',
    tab_skills: 'Fehlende Skills',
    tab_improvements: 'CV-Verbesserungen',
    tab_questions: 'Interviewfragen',
    tab_roadmap: 'Lernplan',
    tab_projects: 'Portfolio-Ideen',
    share_btn: 'Score teilen',
    new_btn: 'Neue Analyse',
    faq_label: 'Fragen',
    faq_h2: 'Häufig gestellte Fragen.',
    faq1_q: 'Wird mein CV gespeichert?',
    faq1_a: 'Nein. Dein CV und die Stellenbeschreibung werden direkt an die KI zur Analyse gesendet und niemals auf unseren Servern gespeichert.',
    faq2_q: 'Wie genau ist der Match-Score?',
    faq2_a: 'Der Score zeigt, wie gut die Sprache deines CVs mit den Anforderungen der Stellenbeschreibung übereinstimmt. Nutze ihn als Orientierung.',
    faq3_q: 'Funktioniert es auch für Nicht-IT-Jobs?',
    faq3_a: 'CareerLens ist speziell für IT-Berufe entwickelt — Softwareentwicklung, DevOps, Data Science, Cloud, QA und verwandte Bereiche.',
    faq4_q: 'Wie viele Analysen kann ich kostenlos durchführen?',
    faq4_a: '3 pro Tag im kostenlosen Plan. Upgrade auf Pro für unbegrenzte Analysen.',
    cta_h2: 'Hör auf zu raten. Fang an zu verbessern.',
    cta_sub: 'Füge deinen CV und eine Stellenbeschreibung ein. Erhalte deinen ehrlichen Score in 30 Sekunden.',
    cta_btn: 'Meinen CV jetzt analysieren →',
    footer_desc: 'KI-gestützte CV-Analyse für IT-Fachleute.',
    footer_copy: '© 2025 CareerLens. Mit ☕ und null Budget gebaut.',
  },

  ar: {
    dir: 'rtl',
    nav_how: 'كيف يعمل',
    nav_features: 'المميزات',
    nav_faq: 'الأسئلة',
    nav_try: '← جرب مجاناً',
    hero_eyebrow: 'مجاني لمحترفي IT',
    hero_h1: 'اكتشف بالضبط لماذا<br/>لم تحصل<br/>على المقابلة.',
    hero_sub: 'الصق CV تاعك ووصف الوظيفة. احصل على درجة التوافق، المهارات الناقصة، تحسينات CV، أسئلة المقابلة، وخطة تعلم مخصصة — في أقل من 30 ثانية.',
    hero_btn: 'حلل CV تاعي — مجاناً',
    hero_note: 'لا تسجيل. لا CV محفوظ.',
    stat1_val: '30 ثانية',
    stat1_label: 'متوسط وقت التحليل',
    stat2_val: '10 نتائج',
    stat2_label: 'لكل تحليل',
    stat3_val: '100% IT',
    stat3_label: 'للأدوار التقنية',
    problem_label: 'المشكلة',
    problem_h2: 'أنت تتقدم في الظلام.',
    problem_title: 'ما يعانيه معظم الباحثين عن عمل',
    problem_1: 'التقديم لعشرات الوظائف بنفس CV العام',
    problem_2: 'الرفض دون أي تغذية راجعة',
    problem_3: 'عدم معرفة ما إذا كانت أنظمة ATS تفلترهم',
    problem_4: 'إضاعة أشهر في تعلم المهارات الخاطئة',
    problem_5: 'دفع €200+ لكاتب CV محترف',
    solution_title: 'ما يقدمه CareerLens',
    solution_1: 'درجة توافق دقيقة لكل وظيفة تتقدم لها',
    solution_2: 'المهارات التي يبحث عنها صاحب العمل',
    solution_3: 'تحسينات CV مع قبل وبعد',
    solution_4: 'خطة تعلم 6 أسابيع لسد الفجوات',
    solution_5: '5 أسئلة مقابلة مخصصة للتحضير',
    howitworks_label: 'كيف يعمل',
    howitworks_h2: 'ثلاث خطوات. ثلاثون ثانية.',
    step1_h: 'الصق CV تاعك',
    step1_p: 'انسخ والصق CV تاعك كنص عادي. لا رفع ملفات، لا حساب مطلوب.',
    step2_h: 'الصق وصف الوظيفة',
    step2_p: 'انسخ الإعلان الكامل — المتطلبات، المسؤوليات، كل شيء.',
    step3_h: 'احصل على التحليل',
    step3_p: 'في 30 ثانية، تحصل على درجة التوافق، المهارات الناقصة، تحسينات CV، أسئلة المقابلة، وخطة تعلم.',
    features_label: 'ما تحصل عليه',
    features_h2: 'عشر نتائج لكل تحليل.',
    f1_h: 'درجة التوافق', f1_p: 'درجة من 0 إلى 100 تظهر مدى توافق CV تاعك مع هذا الدور.',
    f2_h: 'المهارات الناقصة', f2_p: 'المهارات الدقيقة في وصف الوظيفة غير الموجودة في CV تاعك.',
    f3_h: 'تحسينات CV', f3_p: 'إعادة كتابة قبل/بعد لأسطر معينة في CV تاعك.',
    f4_h: 'أسئلة المقابلة', f4_p: '5 أسئلة من المرجح أن يسألها المحاور.',
    f5_h: 'خطة التعلم', f5_p: 'خطة 6 أسابيع مرتبة حسب الأولوية: أي مهارات تتعلم أولاً.',
    f6_h: 'مشاريع Portfolio', f6_p: 'فكرتان لمشروع ملموس يُظهران المهارات التي يريدها صاحب العمل.',
    analyzer_label: 'الأداة',
    analyzer_h2: 'حلل CV تاعك الآن.',
    analyzer_intro: 'الصق CV تاعك ووصف الوظيفة أدناه. لا تسجيل، لا بريد إلكتروني، لا CV محفوظ.',
    cv_label: 'CV تاعك',
    cv_hint: 'الصق كنص عادي. أدرج جميع الأقسام.',
    cv_placeholder: 'الصق CV تاعك الكامل هنا...',
    jd_label: 'وصف الوظيفة',
    jd_hint: 'الصق الإعلان الكامل بما في ذلك المتطلبات.',
    jd_placeholder: 'الصق وصف الوظيفة الكامل هنا...',
    analyze_btn: 'حلل CV تاعي →',
    free_note: 'مجاني · 3 تحليلات يومياً · بدون تسجيل',
    score_title: 'درجة التوافق',
    tab_skills: 'المهارات الناقصة',
    tab_improvements: 'تحسينات CV',
    tab_questions: 'أسئلة المقابلة',
    tab_roadmap: 'خطة التعلم',
    tab_projects: 'أفكار Portfolio',
    share_btn: 'شارك درجتك',
    new_btn: 'تحليل جديد',
    faq_label: 'الأسئلة',
    faq_h2: 'الأسئلة الشائعة.',
    faq1_q: 'هل يتم حفظ CV تاعي؟',
    faq1_a: 'لا. CV تاعك ووصف الوظيفة يُرسلان مباشرة إلى الذكاء الاصطناعي للتحليل ولا يُحفظان أبداً على خوادمنا.',
    faq2_q: 'ما مدى دقة درجة التوافق؟',
    faq2_a: 'الدرجة تعكس مدى توافق لغة CV تاعك مع متطلبات وصف الوظيفة. استخدمها كدليل وليس حكماً نهائياً.',
    faq3_q: 'هل يعمل للوظائف غير التقنية؟',
    faq3_a: 'CareerLens مصمم خصيصاً للأدوار التقنية — هندسة البرمجيات، DevOps، علم البيانات، Cloud، QA والمجالات ذات الصلة.',
    faq4_q: 'كم عدد التحليلات المجانية؟',
    faq4_a: '3 يومياً في الخطة المجانية. قم بالترقية إلى Pro للحصول على تحليلات غير محدودة.',
    cta_h2: 'توقف عن التخمين. ابدأ بالتحسين.',
    cta_sub: 'الصق CV تاعك ووصف الوظيفة. احصل على درجتك الصادقة في 30 ثانية.',
    cta_btn: 'حلل CV تاعي الآن →',
    footer_desc: 'تحليل CV بالذكاء الاصطناعي لمحترفي IT.',
    footer_copy: '© 2025 CareerLens. مبني بـ ☕ وميزانية صفر.',
  }
};

// ── الدالة الرئيسية ──────────────────────────────────────────────────────────
function applyLanguage(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  // اتجاه النص
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;

  // تحديث كل العناصر
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else if (key.endsWith('_h1') || key.endsWith('_h2') || key === 'hero_h1') {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // حفظ اللغة
  localStorage.setItem('careerlens_lang', lang);

  // تحديث الزر النشط
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function detectLanguage() {
  const saved = localStorage.getItem('careerlens_lang');
  if (saved && TRANSLATIONS[saved]) return saved;
  const browser = navigator.language.substring(0, 2).toLowerCase();
  if (browser === 'de') return 'de';
  if (browser === 'ar') return 'ar';
  return 'en';
}

// ── تشغيل عند تحميل الصفحة ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(detectLanguage());
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });
});

// إضافة الترجمات الناقصة
const EXTRA = {
  en: {
    analyzing: 'Analyzing...',
    testimonials_label: 'Early feedback',
    testimonials_h2: 'What job seekers are saying.',
    t1_text: '"I applied to 30 DevOps roles and heard nothing. After using CareerLens, I realized I was missing Terraform and ArgoCD. Fixed it, got 4 callbacks in a week."',
    t2_text: '"The before/after CV improvements alone are worth it. Night and day difference."',
    t3_text: '"The honest score hurt a little. But the learning roadmap was exactly what I needed."',
    footer_product: 'Product',
    footer_analyzer: 'Analyzer',
    footer_legal: 'Legal',
    footer_privacy: 'Privacy policy',
    footer_terms: 'Terms of service',
    footer_connect: 'Connect',
  },
  de: {
    analyzing: 'Analysiere...',
    testimonials_label: 'Erstes Feedback',
    testimonials_h2: 'Was Jobsuchende sagen.',
    t1_text: '"Ich habe mich auf 30 DevOps-Stellen beworben und nichts gehört. Nach CareerLens wusste ich: Terraform und ArgoCD fehlen. Behoben — 4 Rückmeldungen in einer Woche."',
    t2_text: '"Die Vorher/Nachher-CV-Verbesserungen allein sind es wert. Tag-und-Nacht-Unterschied."',
    t3_text: '"Der ehrliche Score hat ein bisschen wehgetan. Aber der Lernplan war genau das, was ich brauchte."',
    footer_product: 'Produkt',
    footer_analyzer: 'Analyzer',
    footer_legal: 'Rechtliches',
    footer_privacy: 'Datenschutz',
    footer_terms: 'Nutzungsbedingungen',
    footer_connect: 'Kontakt',
  },
  ar: {
    analyzing: 'جاري التحليل...',
    testimonials_label: 'آراء المستخدمين',
    testimonials_h2: 'ماذا يقول الباحثون عن عمل.',
    t1_text: '"تقدمت لـ 30 وظيفة DevOps ولم أسمع شيئاً. بعد CareerLens عرفت: Terraform وArgoCD ناقصان. أصلحتهما — حصلت على 4 مقابلات في أسبوع."',
    t2_text: '"تحسينات CV وحدها تستحق. فرق كبير جداً."',
    t3_text: '"الدرجة الصادقة آلمتني قليلاً. لكن خطة التعلم كانت بالضبط ما احتجته."',
    footer_product: 'المنتج',
    footer_analyzer: 'المحلل',
    footer_legal: 'قانوني',
    footer_privacy: 'سياسة الخصوصية',
    footer_terms: 'شروط الخدمة',
    footer_connect: 'تواصل',
  }
};

// دمج الترجمات الإضافية
Object.keys(EXTRA).forEach(lang => {
  Object.assign(TRANSLATIONS[lang], EXTRA[lang]);
});
