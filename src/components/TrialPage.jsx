import CatGarden from './CatGarden'
import CatWeaving from './CatWeaving'
import CodeWeaving from './CodeWeaving'
import { TRIAL_ROUTES } from '../trialRoutes'

export default function TrialPage({ demo = null }) {
  if (demo) return <main className="trial-page trial-demo-page">
    <nav className="trial-demo-nav" aria-label="Trial navigation">
      <a href={TRIAL_ROUTES.garden}>← Back to the garden</a>
      <a href={demo === 'code' ? TRIAL_ROUTES.weave : TRIAL_ROUTES.code}>{demo === 'code' ? 'Weave Camellia →' : 'Programming with knots →'}</a>
    </nav>
    {demo === 'code' ? <CodeWeaving/> : <CatWeaving/>}
  </main>

  return <main className="trial-page">
    <CatGarden onOpenKnit={() => { window.location.hash = TRIAL_ROUTES.weave }} onOpenCode={() => { window.location.hash = TRIAL_ROUTES.code }}/>
  </main>
}
