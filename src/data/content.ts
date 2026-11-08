/**
 * All portfolio content in one place. Edit text here; pages render from it.
 * Rule of thumb for this file: only facts that are verifiable from the CV or the
 * project repositories. Items marked TODO need confirmation before launch.
 */

export const researchInterests = [
  {
    title: 'Security of AI and ML systems',
    text: 'How models, data pipelines, and LLM-based applications fail under adversarial pressure, and how to deploy them with defensible guarantees.',
  },
  {
    title: 'Applied cryptography & key management',
    text: 'Key lifecycle, HSM-backed services, and the gap between cryptographic primitives and how they are integrated in production systems.',
  },
  {
    title: 'Authentication & identity security',
    text: 'Multi-factor authentication, resilience of identity services under failure, and usable security for enterprise users.',
  },
  {
    title: 'Secure systems & infrastructure',
    text: 'Root-cause analysis of failures across OS, network, and application layers in regulated environments.',
  },
];

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

export type ExpGroup = { area: string; items: string[] };

export const experience = [
  {
    org: 'Hana Bank',
    place: 'Seoul, South Korea',
    title: 'Information Security Engineer',
    // TODO(Zoey): confirm official English job title with HR / certificate of employment.
    unit: 'Digital Security Team, Information Security Department',
    dates: 'Apr 2023 – Present',
    summary:
      'Engineer responsible for enterprise data-encryption and employee-authentication services in a large commercial bank: operating them, integrating them with applications, and diagnosing failures that cross OS, network, and application boundaries.',
    groups: [
      {
        area: 'Cryptography, HSM & key management',
        items: [
          'Operate the bank’s enterprise data-encryption platform: field-level encryption of regulated personal data in databases and encryption of data in transit, with HSM/KMS-based key management across production, development, and disaster-recovery environments.',
          'Support application teams integrating AES, ARIA, and SEED in CBC and GCM modes.',
          'Led the replacement of end-of-service encryption servers — impact simulation, backup and recovery procedures with vendor engineers, and network-path coordination — with no service interruption during cutover.',
        ],
      },
      {
        area: 'Authentication, MFA & identity security',
        items: [
          'Operate the enterprise MFA service (directory-integrated PC agent with mobile OTP/push and facial authentication) and troubleshoot DNS and application-process incidents.',
          'Extended MFA to overseas users to support the New York branch’s compliance with NYDFS 23 NYCRR Part 500, and implemented single sign-on from PC logon to the group portal.',
          'Designed the disaster-recovery architecture for the employee authentication app and coordinated system interfaces with senior systems engineers, adding offline authentication for network outages.',
        ],
      },
      {
        area: 'Linux/Unix systems & secure software integration',
        items: [
          'Installed and validated cryptographic modules on Linux, AIX, and Solaris; diagnosed C-module failures caused by file-permission and shared-memory behavior.',
          'Diagnosed intermittent key-generation failures in a newly deployed encryption module for ATMs; with the vendor engineer, traced the root cause to thread contention in a library function through kernel-level log analysis, then verified the fix with off-peak patching, live monitoring, and performance tests.',
          'Wrote Java test code that helped developers integrate a legacy cryptographic library.',
        ],
      },
      {
        area: 'Network troubleshooting & API security',
        items: [
          'Resolved an API outage behind a newly deployed proxy by capturing traffic in Wireshark, identifying blocked CORS preflight (HTTP OPTIONS) requests, and correcting the forwarding policy.',
          'Isolated access-gateway connectivity faults through DMZ packet captures and TCP handshake analysis; traced a post-replacement outage to a switch-side fault together with network engineers.',
          'Assessed external Open API integrations against authentication, endpoint access-control, and confidentiality requirements, and recommended remediation to partner organizations.',
        ],
      },
      {
        area: 'Compliance, governance & leadership',
        items: [
          'Prepare audit evidence for ISMS-P certification and financial-regulator examinations.',
          'Negotiated maintenance contracts below the market benchmark rate and moved low-usage modules to per-call billing.',
          'Served as an IT Division Change Management Leader (2025) and promoted collaboration-tool adoption for onboarding and operational handoffs.',
        ],
      },
    ] as ExpGroup[],
  },
  {
    org: 'Sundosoft Co., Ltd.',
    place: 'Seoul, South Korea',
    title: 'Data Analyst',
    unit: 'Intelligent Information Business Division',
    dates: 'Jan 2022 – Jun 2022',
    summary:
      'Data analysis and computer-vision data preparation for public-sector AI proposals.',
    groups: [
      {
        area: 'Data analytics & machine learning',
        items: [
          'Developed an image-augmentation algorithm that automatically generated training images (e.g., plastic bottles) for a computer-vision waste-classification model, as part of a proposal for a government-funded AI project.',
          'Analyzed regional big data at the province and city/county/district levels with Python, SQL, and QGIS.',
        ],
      },
    ] as ExpGroup[],
  },
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type Metric = { label: string; value: string; note?: string };
export type Figure = { src: string; alt: string; caption: string; width: number; height: number };

export type Project = {
  slug: string;
  name: string; // stable analytics identifier (do not rename after launch)
  title: string;
  short: string;
  dates: string;
  role: string;
  team: string;
  featured?: boolean;
  tags: string[];
  repo: string;
  headline: Metric[];
  problem: string;
  approach: string[];
  stack: { group: string; items: string[] }[];
  contributions: string[];
  teamOutcomes: string[];
  methodology: { step: string; detail: string }[];
  results: string[];
  table?: { caption: string; head: string[]; rows: string[][]; note?: string };
  figures?: Figure[];
  challenges: string[];
  lessons: string[];
  connection: string;
};

export const projects: Project[] = [
  {
    slug: 'et5-korean-summarization',
    name: 'et5_summarization',
    title: 'Korean Text Summarization for Literacy Training',
    short:
      'Fine-tuned ETRI’s ET5 (a Korean T5 model) for abstractive summarization and built a web service that scores a learner’s summary against the model’s summary with BERTScore.',
    dates: 'Nov – Dec 2021',
    role: 'Team Leader · ML modeling & hyperparameter tuning',
    team: '6-person team, K-Digital Training program',
    featured: true,
    tags: ['NLP', 'Transformers', 'T5 / ET5', 'BERTScore', 'PyTorch', 'Flask'],
    repo: 'https://github.com/Kyounglim-Joey/cakd3_3rd_Project',
    headline: [
      { label: 'BERTScore F1 (validation)', value: '0.8391' },
      { label: 'Fine-tuning samples', value: '21,000', note: 'incremental, by domain' },
      { label: 'Competition result', value: 'Award', note: 'see Honors' },
    ],
    problem:
      'Reading-comprehension surveys reported that many Korean middle- and high-school students struggle to understand textbook-level passages. Summarizing a passage is one of the most common literacy exercises, but it needs feedback that learners rarely get. The goal was a self-study service that gives a passage, takes the learner’s summary, and returns an automatic, meaning-aware score.',
    approach: [
      'Fine-tune a pretrained Korean encoder–decoder language model (ET5, released by ETRI) to generate reference summaries for passages from a Korean book corpus.',
      'Score the learner’s summary against the model’s summary with BERTScore, which compares contextual embeddings rather than exact n-gram overlap (as ROUGE does), so paraphrased but correct summaries are not penalized.',
      'Wrap the model in a lightweight web service with topic selection, a timer, length limits, and graded feedback.',
    ],
    stack: [
      { group: 'Modeling', items: ['PyTorch', 'Hugging Face Transformers (T5ForConditionalGeneration)', 'SentencePiece', 'ET5 (ETRI)'] },
      { group: 'Evaluation', items: ['bert-score'] },
      { group: 'Data', items: ['pandas', 'SQLite', 'AI Hub document-summarization corpus', 'Korean book corpus (competition data)'] },
      { group: 'Service', items: ['Flask', 'HTML/CSS', 'Figma', 'ngrok', 'Google Colab (GPU)'] },
    ],
    contributions: [
      'Led the six-person team: scoped the service scenario, split work across data, modeling, and web streams, and coordinated the competition submission.',
      'Built the fine-tuning and validation pipeline, adapting a standard Hugging Face T5 workflow to ET5: custom PyTorch Dataset, teacher-forced training loop with padding tokens masked out of the loss, and beam-search generation for validation.',
      'Ran the training experiments and hyperparameter tuning, including batch size and number of epochs, and trained the model incrementally across domain subsets.',
    ],
    teamOutcomes: [
      'Data refinement from JSON to paragraph-level CSV, difficulty columns, and a SQLite store for fast serving.',
      'Web front end (main, topic, summary, user, settings views) designed in Figma and served with Flask.',
    ],
    methodology: [
      { step: 'Data', detail: 'AI Hub document-summarization text (≈200k paragraphs of ~300–1,000 characters, each with a reference summary) for fine-tuning; a Korean book corpus provided by the competition organizer for the passages shown in the service.' },
      { step: 'Preprocessing', detail: 'Converted JSON to CSV, merged sentence-level records into paragraphs, added difficulty columns by length, and merged corpus categories.' },
      { step: 'Model', detail: 'ET5 is pretrained by ETRI on both T5-style span corruption and GPT-style next-token prediction. Inputs are prefixed with “summarize:”.' },
      { step: 'Fine-tuning', detail: 'Adam optimizer, learning rate 1e-4, seed 42, 80/20 train/validation split; incremental training on technology & science (6,000), social science (6,000), arts (6,000), and other (3,000) samples — 21,000 in total.' },
      { step: 'Generation', detail: 'Beam search (2 beams) with repetition penalty 2.5, no-repeat n-gram size 3, and length bounds.' },
      { step: 'Evaluation', detail: 'BERTScore (precision, recall, F1) between generated and reference summaries on the validation split.' },
    ],
    results: [
      'Best validation BERTScore F1 of 0.8391 for the fine-tuned model.',
      'Working web service: a learner reads a passage, writes a 60–200 character summary, and receives a graded score (Perfect / Great / Good / Try again).',
      'The project received an award at a 2021 AI service competition using a Korean book corpus (organized by Woongjin Booxen).',
    ],
    table: {
      caption: 'Final training and generation configuration (from the project presentation)',
      head: ['Parameter', 'Value'],
      rows: [
        ['Train / validation batch size', '2 / 2'],
        ['Training epochs', '3'],
        ['Learning rate', '1e-4'],
        ['Max source / target length (tokens)', '800 / 200'],
        ['Beams · repetition penalty · no-repeat n-gram', '2 · 2.5 · 3'],
        ['Generated summary length (min / max)', '30 / 250'],
      ],
      note: 'Batch size and epochs were the tuned parameters; values in earlier notebook runs differ (e.g., batch size 3, source length 600).',
    },
    figures: [
      {
        src: '/images/projects/et5-service-ui.jpg',
        alt: 'Screenshot of the summarization web service with a passage, a learner summary box, a timer, the machine summary, and the score area. Interface text is in Korean.',
        caption: 'Summary view of the web service (interface in Korean). Labels mark topic tabs, random passage, learner input, timer, machine summary, and score.',
        width: 1200,
        height: 675,
      },
    ],
    challenges: [
      'Training ran on Colab GPUs with small batches; the model was trained incrementally on domain subsets, resuming from the saved checkpoint each round.',
      'ROUGE rewards exact word overlap and cannot judge whether a differently worded summary keeps the meaning; switching to embedding-based BERTScore made the feedback more meaningful for learners.',
      'The ET5 weights are licensed by ETRI and cannot be redistributed, so the public repository contains code and service files but not the trained model.',
    ],
    lessons: [
      'Metric choice shapes what a system rewards; an evaluation metric is itself a model with blind spots.',
      'A summary score derived from another model inherits that model’s errors — the same trust problem that motivates my interest in the reliability and security of ML-based systems.',
    ],
    connection:
      'Embedding-based scoring is easy to game with fluent but wrong text. Questions like “how robust is an automated evaluator?” lead directly to adversarial robustness and LLM-evaluation security, which I want to study in graduate school.',
  },
  {
    slug: 'mold-detection-yolov5',
    name: 'mold_detection',
    title: 'Mold Detection on Medicinal Crops with YOLOv5',
    short:
      'Built an object-detection program that finds white mold in low-resolution CCTV images of medicinal-crop trays, comparing Faster R-CNN, EfficientNet, and YOLOv5.',
    dates: 'Oct – Nov 2021',
    role: 'Team Leader · preprocessing, annotation, modeling',
    team: '4-person team, K-Digital Training program',
    tags: ['Computer Vision', 'Object Detection', 'YOLOv5', 'PyTorch', 'Roboflow'],
    repo: 'https://github.com/Kyounglim-Joey/cakd3_2nd_project-mold_detection',
    headline: [
      { label: 'mAP@0.5 (mold class)', value: '0.723' },
      { label: 'Precision / Recall (mold)', value: '0.706 / 0.69' },
      { label: 'Usable source images', value: '123', note: 'of 15,761 collected' },
    ],
    problem:
      'Indoor medicinal-crop cultivation is monitored by CCTV, but white mold is small, low-contrast, and easy to miss. The goal was a program that flags mold automatically from 640×480 CCTV frames so growers can intervene early.',
    approach: [
      'Curate a usable image set from roughly two weeks of CCTV captures and define annotation classes that separate clearly visible mold from ambiguous blur.',
      'Compare candidate models for accuracy and practicality, then train YOLOv5 for fast single-stage detection.',
      'Package inference as a command-line program (detect.py) with a usage guide.',
    ],
    stack: [
      { group: 'Modeling', items: ['YOLOv5 (Ultralytics)', 'PyTorch', 'OpenCV'] },
      { group: 'Compared', items: ['Faster R-CNN', 'EfficientNet (TensorFlow/Keras)'] },
      { group: 'Data', items: ['Roboflow (annotation, export)', 'Google Colab'] },
    ],
    contributions: [
      'Led the four-person team and presented the final results.',
      'Worked on data preprocessing, bounding-box annotation, and modeling.',
      'Wrote the execution guide for the packaged detection program.',
    ],
    teamOutcomes: [
      'Model comparison across Faster R-CNN, EfficientNet, and YOLOv5.',
      'Software registration application for the program submitted to the Korea Copyright Commission (Nov 2021).',
    ],
    methodology: [
      { step: 'Data collection', detail: 'CCTV images of two crop trays captured Sep 17 – Oct 5, 2021 (15,761 frames, 640×480 JPEG).' },
      { step: 'Filtering', detail: 'Excluded frames taken under purple LED lighting, at night, or without visible mold, leaving 123 usable images.' },
      { step: 'Annotation', detail: 'Two classes in Roboflow: “mold” (clearly distinguishable from soil) and “blur” (ambiguous). A single-class setup plateaued below mAP 0.65.' },
      { step: 'Split & export', detail: '70% train / 30% test, exported in YOLOv5 PyTorch TXT format.' },
      { step: 'Model selection', detail: 'Faster R-CNN reached high mAP on the small set but was too slow for timely detection; EfficientNet overfit (training accuracy 1.0); YOLOv5 balanced speed and accuracy.' },
      { step: 'Training', detail: 'YOLOv5 trained for about 200 epochs; evaluated with precision, recall, mAP@0.5 and mAP@0.5:0.95.' },
    ],
    results: [
      'Mold class on the validation set (23 images, 245 labels): precision 0.706, recall 0.69, mAP@0.5 0.723, mAP@0.5:0.95 0.23.',
      'All classes combined: mAP@0.5 0.421; the ambiguous “blur” class was hard to detect (mAP@0.5 0.119), which is expected for a deliberately ambiguous label.',
      'Image augmentation (flip, crop, exposure) lowered mAP below 0.4 on this dataset, so the final model was trained without heavy augmentation.',
    ],
    figures: [
      {
        src: '/images/projects/mold-validation.jpg',
        alt: 'YOLOv5 validation summary table and twelve training curves for box, objectness, and class loss, precision, recall, and mAP over about 200 epochs.',
        caption: 'YOLOv5 validation summary and training curves. The highlighted row is the mold class.',
        width: 653,
        height: 361,
      },
      {
        src: '/images/projects/mold-detection.jpg',
        alt: 'CCTV frame of two crop trays with several bounding boxes labeled mold and confidence scores around 0.64 to 0.67.',
        caption: 'Detections on a held-out CCTV frame using the trained weights.',
        width: 481,
        height: 333,
      },
    ],
    challenges: [
      'Severe data scarcity: only 123 of 15,761 frames were usable, at very low image quality.',
      'Label ambiguity: separating mold from soil texture required a second “blur” class.',
      'Augmentation hurt rather than helped — a reminder that standard recipes can fail on small, low-quality datasets.',
    ],
    lessons: [
      'Data quality and label definitions dominated model choice.',
      'Reporting per-class and combined metrics side by side avoids overstating results.',
    ],
    connection:
      'Low-quality inputs and ambiguous labels are exactly the conditions under which ML systems are brittle — and where data poisoning or evasion attacks are hardest to notice.',
  },
  {
    slug: 'customer-decline-prediction',
    name: 'customer_decline',
    title: 'Predicting Declining-Spend Customers from Retail Purchase Data',
    short:
      'Engineered quarter-over-quarter spending features from ~28.6M purchase records and compared five classifiers to predict customers whose spending would decline.',
    dates: 'Sep – Oct 2021',
    role: 'Team Leader · data exploration',
    team: '5-person team, K-Digital Training program',
    tags: ['Tabular ML', 'Feature Engineering', 'Random Forest', 'XGBoost', 'Clustering'],
    repo: 'https://github.com/Kyounglim-Joey/cakd3_1st_project-Data_exploration',
    headline: [
      { label: 'Best accuracy (Random Forest)', value: '0.7137' },
      { label: 'Best F1 (Random Forest)', value: '0.7265' },
      { label: 'Customers modeled', value: '19,169' },
    ],
    problem:
      'A retail group’s affiliate data showed that a large share of customers reduced their spending over two years. The goal was to find purchase patterns of declining customers and predict them early enough for retention marketing.',
    approach: [
      'Define a “declining customer” label relative to overall sales growth, so that a customer is flagged only when their spending grows less than the business as a whole.',
      'Aggregate purchases per customer by half-year, product category, consumer-goods type, and affiliate, then convert them to quartile grades and grade-change indices.',
      'Compare tree-based classifiers and cluster the predicted decliners into actionable segments.',
    ],
    stack: [
      { group: 'Modeling', items: ['scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost'] },
      { group: 'Data', items: ['pandas', 'NumPy', 'matplotlib', 'seaborn', 'Google Colab'] },
    ],
    contributions: [
      'Led the five-person team and coordinated analysis and presentation.',
      'Performed exploratory analysis of purchase trends by gender, quarter, affiliate, and product category, including year-over-year category change.',
    ],
    teamOutcomes: [
      'Feature engineering of 96 variables and selection of 40 by multicollinearity and feature importance.',
      'Model comparison and k-cluster segmentation of declining customers.',
    ],
    methodology: [
      { step: 'Data', detail: 'Customer demographics (19,383), product taxonomy, ~28.6M purchase records, membership and channel data for 2014–2015.' },
      { step: 'Label', detail: 'Customer spending growth ÷ total sales growth between half-years; ratio < 1 → declining (1), otherwise 0. Train on half-years 1–3, test on half-year 4.' },
      { step: 'Taxonomy', detail: 'Unified product categories into 12 groups and three consumer-goods types (convenience, shopping, specialty).' },
      { step: 'Features', detail: 'Quartile grades per aggregation, absolute grade-change (ABS) and net change (NET) indices; 40 of 96 features retained.' },
      { step: 'Models', detail: 'Decision Tree, LightGBM, Random Forest, XGBoost, CatBoost; cross-validation and grid search for tree depth and leaf sizes.' },
      { step: 'Segmentation', detail: 'Elbow method and dendrogram → four clusters of predicted decliners for marketing actions.' },
    ],
    results: [
      'Random Forest performed best (accuracy 0.7137, F1 0.7265) on 19,169 customers.',
      'The share of spending on convenience goods was the most important feature across tree models.',
      'Four declining-customer segments, each with a proposed retention action.',
    ],
    table: {
      caption: 'Model comparison on the test half-year (from the project presentation)',
      head: ['Model', 'Accuracy', 'Precision', 'Recall', 'F1'],
      rows: [
        ['Decision Tree', '0.6853', '0.6976', '0.7164', '0.7069'],
        ['LightGBM', '0.7052', '0.7312', '0.7013', '0.7159'],
        ['XGBoost', '0.6932', '0.7118', '0.7071', '0.7094'],
        ['CatBoost', '0.7084', '0.7289', '0.7158', '0.7223'],
        ['Random Forest', '0.7137', '0.7353', '0.7180', '0.7265'],
      ],
    },
    challenges: [
      'Turning 28.6M transaction rows into a stable per-customer representation without leaking the test period.',
      'A naive “spent less than last period” label would mostly capture seasonality; normalizing by overall growth fixed that.',
    ],
    lessons: [
      'Label definition is a modeling decision with as much impact as the classifier.',
      'Modest accuracy (≈0.71) is an honest result for behavioral prediction; the segmentation was the more useful output.',
    ],
    connection:
      'Behavioral features from transaction logs are the same raw material used in fraud and anomaly detection in financial security.',
  },
];

/* ------------------------------------------------------------------ */
/* Education & training                                                */
/* ------------------------------------------------------------------ */

export const degrees = [
  {
    school: 'Sejong Cyber University',
    place: 'Seoul, South Korea',
    // TODO(Zoey): confirm official English degree title and department name.
    degree: 'Bachelor’s program, Department of Information Security (admitted as third-year transfer)',
    dates: 'Mar 2025 – Expected Aug 2027',
    status: 'In progress',
    coursework: [
      'Introduction to Information Security',
      'Unix and Linux Systems',
      'Fundamentals of Cryptographic Algorithms',
      'Network Security',
    ],
  },
  {
    school: 'Ewha Womans University',
    place: 'Seoul, South Korea',
    // TODO(Zoey): confirm official degree title for the double major.
    degree: 'B.A. in Philosophy; Double Major in Life Sciences',
    dates: 'Mar 2015 – Feb 2022',
    status: 'Completed',
    coursework: [],
  },
];

export const creditCoursework = {
  label: 'Academic Credit Bank System (credit-bearing, non-degree)',
  courses: ['Linear Algebra', 'Probability and Statistics'],
};

export const training = [
  {
    name: 'K-Shield Program — Incident Response Track',
    org: 'Korea Internet & Security Agency (KISA)', // TODO(Zoey): confirm exact program name
    dates: 'Jun – Nov 2025',
    topics: [
      'Web and mobile penetration testing with attack scenarios',
      'Web application vulnerability analysis and response',
      'Developing a vulnerability-assessment tool for critical information infrastructure',
      'Building an integrated wired/wireless penetration-testing lab',
      'Generative AI for incident response',
      'Live-fire cyber exercise',
    ],
  },
  {
    name: 'K-Digital Training — Big Data–based AI Solution Developer Program (Cohort 3)',
    org: 'Non-degree intensive program', // TODO(Zoey): add the training provider's name
    dates: 'Jun – Dec 2021',
    topics: [
      'Machine learning and deep learning in Python',
      'SQL and statistics for data analysis',
      'Three team projects, all as team leader (see Projects)',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Awards                                                              */
/* ------------------------------------------------------------------ */

export const awards = [
  {
    // TODO(Zoey): confirm official English title. 2026.01 CV lists 최우수상; latest note says 대상.
    title: 'Top Excellence Award',
    event: '2021 AI Service Competition Using a Korean Book Corpus',
    org: 'Woongjin Booxen',
    date: 'Dec 2021',
    note: 'For the ET5-based summarization-practice service (team project).',
    kind: 'external',
  },
  {
    title: 'Grand Prize (1st place), CoP Category',
    event: 'Sangsang Ground Innovation Competition',
    org: 'Hana Bank (internal)',
    date: '2024',
    note: 'Personalized financial-challenge platform that groups users by spending patterns.',
    kind: 'internal',
  },
  {
    title: 'First Place (Top Excellence Award)',
    event: 'ONE-TEAM Payment Idea Competition',
    org: 'Hana Bank (internal)',
    date: '2024',
    note: 'Salary-management consulting and gamification program for early-career customers.',
    kind: 'internal',
  },
  {
    title: 'Grand Prize (1st place), CoP Category',
    event: 'Sangsang Ground Innovation Competition',
    org: 'Hana Bank (internal)',
    date: '2023',
    note: 'Digital sales-onboarding enhancement, later implemented by the development team.',
    kind: 'internal',
  },
];

/* ------------------------------------------------------------------ */
/* Skills & certifications                                             */
/* ------------------------------------------------------------------ */

export const skills = [
  {
    group: 'Cryptography & Security',
    items: ['HSM', 'KMS / key lifecycle', 'AES · ARIA · SEED (CBC, GCM)', 'MFA / SSO', 'Directory-integrated authentication', 'API security assessment', 'ISMS-P', 'Penetration-testing fundamentals'],
    evidence: 'Hana Bank; K-Shield',
  },
  {
    group: 'Systems & Networking',
    items: ['Linux', 'AIX', 'Solaris', 'TCP/IP', 'DNS', 'Proxy & access gateways', 'Wireshark packet analysis'],
    evidence: 'Hana Bank',
  },
  {
    group: 'Programming & Data',
    items: ['Python', 'SQL (Oracle)', 'Java', 'C', 'HTML/CSS', 'pandas', 'QGIS'],
    evidence: 'Hana Bank; Sundosoft; projects',
  },
  {
    group: 'Machine Learning / Deep Learning',
    items: ['PyTorch', 'Hugging Face Transformers', 'T5 / ET5 fine-tuning', 'YOLOv5', 'scikit-learn', 'XGBoost · LightGBM · CatBoost', 'BERTScore', 'Image augmentation'],
    evidence: 'Projects; Sundosoft',
  },
  {
    group: 'Tools & Platforms',
    items: ['Git / GitHub', 'Google Colab', 'Jupyter', 'Flask', 'Roboflow', 'Figma'],
    evidence: 'Projects',
  },
];

export const certifications = [
  // TODO(Zoey): fill in the acquisition date before launch.
  { name: 'Engineer Information Security', issuer: 'Korean national technical qualification', date: '' },
  { name: 'ADsP — Advanced Data Analytics Semi-Professional', issuer: 'Korea Data Agency', date: 'Nov 2024' },
  { name: 'Engineer Big Data Analysis', issuer: 'Korean national qualification', date: 'Dec 2021' },
];

export const languages = [
  { name: 'Korean', level: 'Native' },
  { name: 'English', level: 'OPIc Intermediate High (2025)' },
  { name: 'Chinese', level: 'HSK Level 4 (2025)' },
];
