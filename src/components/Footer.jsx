import { Link } from 'react-router-dom'
import { useApp } from '../lib/store'

export default function Footer() {
  const { t } = useApp()
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <img src="/oxfam-logo-white.svg" alt="Oxfam" className="footer-logo" />
          <p>{t.footer}</p>
        </div>
        <div>
          <h4>{t.siteName}</h4>
          <Link to="/explore">{t.nav.explore}</Link>
          <Link to="/inventory">{t.nav.inventory}</Link>
          <Link to="/dashboard">{t.nav.dashboard}</Link>
          <Link to="/submit">{t.nav.submit}</Link>
        </div>
        <div>
          <h4>{t.nav.about}</h4>
          <Link to="/about">{t.about.method}</Link>
          <Link to="/about">{t.about.data}</Link>
          <Link to="/about">{t.about.privacy}</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Open data · CC BY 4.0</span>
      </div>
    </footer>
  )
}
