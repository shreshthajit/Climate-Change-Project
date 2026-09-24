import { Component } from 'react'

// Without a boundary, any render error unmounts the whole tree and leaves a white screen.
// This shows the error instead. App keys it by route, so navigating away clears it.
export default class ErrorBoundary extends Component {
  state = { error: null, componentStack: '' }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack)
    this.setState({ componentStack: info?.componentStack || '' })
  }

  resetData = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('cai.'))
        .forEach((k) => localStorage.removeItem(k))
    } catch {
      /* storage unavailable */
    }
    window.location.replace('/#/')
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="container page-body narrow">
        <div className="empty">
          <h2>Something went wrong on this page</h2>
          <p className="small muted">{String(this.state.error?.message || this.state.error)}</p>
          {/* Diagnostics: lets a tester screenshot exactly where it failed on their device. */}
          <details className="crash-details">
            <summary>Technical details</summary>
            <pre>
              {`Page: ${window.location.hash || '/'}\nBrowser: ${navigator.userAgent}\n\n${this.state.error?.stack || ''}\n\nComponents:${this.state.componentStack}`}
            </pre>
          </details>
          <div className="hero-ctas center">
            <button className="btn btn-green" onClick={() => window.location.reload()}>Reload page</button>
            <button className="btn btn-outline" onClick={this.resetData}>Reset demo data</button>
          </div>
        </div>
      </div>
    )
  }
}
