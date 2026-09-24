import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'
import { RecordCard, Section } from '../components/ui'
import MiniMap from '../components/MiniMap'

const Q_ICONS = ['🌊', '🛠️', '🤝', '৳', '⚖️', '👥']

export default function Home() {
  const { t, published, num, money } = useApp()
  const invest = published.reduce((s, r) => s + (r.capex || 0), 0)
  const people = published.reduce((s, r) => s + (r.beneficiaries?.total || 0), 0)
  const good = published.filter((r) => r.cls === 'good')
  const mal = published.filter((r) => r.cls === 'mal')
  const featured = [...good].sort((a, b) => b.mcda - a.mcda).slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
            <path d="M0 380 C 200 330, 350 420, 560 360 S 900 300, 1200 360 L1200 500 L0 500Z" fill="rgba(255,255,255,.06)" />
            <path d="M0 420 C 240 380, 420 470, 640 410 S 980 360, 1200 420 L1200 500 L0 500Z" fill="rgba(255,255,255,.08)" />
            <path d="M0 460 C 260 430, 480 500, 700 455 S 1000 420, 1200 460 L1200 500 L0 500Z" fill="rgba(255,255,255,.1)" />
          </svg>
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="kicker">{t.heroKicker}</span>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <div className="hero-ctas">
              <Link to="/explore" className="btn btn-white">{t.ctaExplore}</Link>
              <Link to="/submit" className="btn btn-orange">{t.ctaSubmit}</Link>
            </div>
          </div>
          <div className="hero-map">
            <MiniMap records={published} />
          </div>
        </div>
      </section>

      <div className="stats-band">
        <div className="container stats-grid">
          <div className="stat"><strong>{num(published.length)}</strong><span>{t.statRecords}</span></div>
          <div className="stat"><strong>{money(invest)}</strong><span>{t.statInvest}</span></div>
          <div className="stat"><strong>{num(people)}</strong><span>{t.statBenef}</span></div>
          <div className="stat"><strong>{num(good.length)}</strong><span>{t.statGood}</span></div>
        </div>
      </div>

      <Section title={t.sixQ} className="bg-sand">
        <div className="q-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="q-card">
              <span className="q-num">{Q_ICONS[i - 1]}</span>
              <h3>{t[`q${i}`]}</h3>
              <p>{t[`q${i}d`]}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t.featured}>
        <div className="card-grid">
          {featured.map((r) => <RecordCard key={r.id} r={r} />)}
        </div>
        <div className="center mt">
          <Link to="/inventory" className="btn btn-green">{t.viewAll}</Link>
        </div>
      </Section>

      <section className="mal-band">
        <div className="container mal-grid">
          <div>
            <h2>{t.maladaptTitle}</h2>
            <p>{t.maladaptText}</p>
          </div>
          <div className="card-grid two">
            {mal.slice(0, 2).map((r) => <RecordCard key={r.id} r={r} />)}
          </div>
        </div>
      </section>

      <Section title={t.whoFor} className="bg-sand">
        <div className="aud-grid">
          {t.audiences.map(([h, p]) => (
            <div key={h} className="aud">
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="cta-band">
        <div className="container cta-inner">
          <h2>{t.ctaSubmit}</h2>
          <div className="hero-ctas">
            <Link to="/submit" className="btn btn-white">{t.submit.single}</Link>
            <Link to="/bulk" className="btn btn-outline-white">{t.submit.bulk}</Link>
          </div>
        </div>
      </section>
    </>
  )
}
