import { useApp } from '../lib/store'
import { PageHead } from '../components/ui'

const CONTENT = {
  en: {
    method: [
      'Records come from secondary literature (project reports, evaluations, government publications) and primary collection (surveys, KIIs, FGDs, field verification).',
      'Each record carries a verification level: self-reported, desk-verified or field-verified.',
      'Benefit-cost ratio = discounted avoided losses ÷ discounted capital and maintenance costs. BCR above 1 means benefits exceed costs.',
      'A multi-criteria score combines effectiveness, sustainability, equity, cost-efficiency and community ownership using admin-set weights.',
      'Classification: good practice, maladaptation or work in progress, based on the score, BCR and survival status.',
    ],
    data: [
      'One row per intervention with a unique ID, BBS geocodes and WGS84 coordinates.',
      'Open downloads in CSV (Bangla-safe UTF-8) and GeoJSON; a documented REST API for national systems.',
      'Built on open source: PostgreSQL/PostGIS, React, Leaflet — ready for handover to a national climate authority.',
    ],
    privacy: [
      'Compliant with GDPR and Oxfam data protection policy.',
      'Informed consent captured before any photo, quote or personal data is stored.',
      'Personal data is kept separate from public fields and never published.',
    ],
  },
  bn: {
    method: [
      'তথ্য আসে মাধ্যমিক উৎস (প্রকল্প প্রতিবেদন, মূল্যায়ন, সরকারি প্রকাশনা) এবং প্রাথমিক সংগ্রহ (জরিপ, মূল তথ্যদাতা সাক্ষাৎকার, দলীয় আলোচনা, মাঠ যাচাই) থেকে।',
      'প্রতিটি রেকর্ডে যাচাইয়ের স্তর থাকে: স্ব-প্রতিবেদিত, ডেস্ক-যাচাইকৃত বা মাঠ-যাচাইকৃত।',
      'ব্যয়-সুবিধা অনুপাত = ছাড়কৃত ক্ষতি-হ্রাস ÷ ছাড়কৃত মূলধন ও রক্ষণাবেক্ষণ ব্যয়। ১-এর বেশি হলে সুবিধা ব্যয়ের চেয়ে বেশি।',
      'বহু-মানদণ্ড স্কোর কার্যকারিতা, টেকসইতা, সমতা, ব্যয়-দক্ষতা ও সম্প্রদায়ের মালিকানাকে প্রশাসক-নির্ধারিত ওজনে যুক্ত করে।',
      'শ্রেণিবিন্যাস: স্কোর, BCR ও টিকে থাকার অবস্থার ভিত্তিতে উত্তম চর্চা, অপ-অভিযোজন বা চলমান মূল্যায়ন।',
    ],
    data: [
      'প্রতিটি উদ্যোগের জন্য একটি সারি, অনন্য আইডি, বিবিএস জিওকোড ও WGS84 স্থানাঙ্ক।',
      'CSV (বাংলা-সমর্থিত UTF-8) ও GeoJSON-এ উন্মুক্ত ডাউনলোড; জাতীয় সিস্টেমের জন্য নথিভুক্ত REST API।',
      'ওপেন সোর্সে তৈরি: PostgreSQL/PostGIS, React, Leaflet — জাতীয় জলবায়ু কর্তৃপক্ষের কাছে হস্তান্তরের উপযোগী।',
    ],
    privacy: [
      'GDPR ও অক্সফামের তথ্য সুরক্ষা নীতি অনুসরণ করা হয়।',
      'কোনো ছবি, উদ্ধৃতি বা ব্যক্তিগত তথ্য সংরক্ষণের আগে অবহিত সম্মতি নেওয়া হয়।',
      'ব্যক্তিগত তথ্য প্রকাশ্য তথ্য থেকে আলাদা রাখা হয় এবং কখনো প্রকাশ করা হয় না।',
    ],
  },
}

export default function About() {
  const { t, lang } = useApp()
  const c = CONTENT[lang]
  return (
    <>
      <PageHead title={t.about.title} sub={t.about.text} />
      <div className="container page-body about-grid">
        {[['method', t.about.method], ['data', t.about.data], ['privacy', t.about.privacy]].map(([k, h]) => (
          <section key={k} className="form-card">
            <h2>{h}</h2>
            <ul className="about-list">{c[k].map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        ))}
        <section className="form-card formula">
          <h2>BCR</h2>
          <div className="formula-box">
            BCR = <span className="frac"><span>Σ B<sub>t</sub> / (1+r)<sup>t</sup></span><span>Σ (C<sub>t</sub> + M<sub>t</sub>) / (1+r)<sup>t</sup></span></span>
          </div>
          <p className="small muted">B = avoided loss · C = capital cost · M = maintenance cost · r = discount rate · t = 0…T</p>
        </section>
      </div>
    </>
  )
}
