import * as React from 'react'

const APP_DOMAIN = 'https://app.osai.llc' // <-- your app site (Repo B)
const APP_LOGIN_URL = `${APP_DOMAIN}/login`
const APP_SIGNUP_URL = `${APP_DOMAIN}/signup`

const EMBEDDED_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbLAAAABHNCSVQICAgIfAhkiAAAIABJREFUeJzt3Xl8FFX+//HPyUliSGCQpCQQEC4xK6Jp1iYyKi8bqH9Xq9XLrtVWqtWpf1QvVqtWqf1cXW6rNWrXgUqFZq1S1i7gkQkxLkZB4JgshmTzP8z3kk5mBGCS/fOd3P93vfM+7/nkFjDGmKIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoiqIoip6RffJ+uSVLyme8NzDGmFqk8bKnJj01PTrkOMaYWqVZ8ZeWf7lsduVjTGmFqkce3baP9e87VZhjDG1C7XKnnn8wfX2pKw4xlRCj1X+fM8p6f+aqy0wjDGmFqk8dP8XP7u6Z7mMaaH6Lz8P8vGl7lzTTDGmFqk8bPn5mVX1Q4xphapTHv1z5+87amBMcZUEgkDgEKNZlW87u+XtU6jKoiiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIrq/wBpXnU95lP8cAAAAASUVORK5CYII="

export default function App() {
  const [email, setEmail] = React.useState('')
  const [playIntro, setPlayIntro] = React.useState(false)

  function openSignup() {
    const url = new URL(APP_SIGNUP_URL)
    if (email) url.searchParams.set('email', email)
    window.location.href = url.toString()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="noise" />
      <div className="beams" />
      <style>{`
        :root{ --bg:#07080a; --border:rgba(255,255,255,0.18); --glass:rgba(0,0,0,0.55); --glassHover:rgba(0,0,0,0.7); --ring:rgba(255,255,255,0.35); --shadow:0 18px 60px rgba(0,0,0,0.75); }
        html,body{ background:var(--bg) }
        body{
          font-family: 'Sansation', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; color:#fff
        }
        a{ color:#a78bfa; text-decoration:none } a:hover{ text-decoration:underline }
        ::selection{ background:rgba(255,255,255,0.15) }

        .noise{ position:fixed; inset:0; pointer-events:none; opacity:.05; background-image:radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.6px); background-size:3px 3px }
        .beams{ position:fixed; inset:0; pointer-events:none; background:
          radial-gradient(600px 260px at 20% -80px, rgba(255,255,255,0.12), transparent 60%),
          radial-gradient(700px 340px at 110% 10%, rgba(255,255,255,0.10), transparent 65%);
          opacity:.6; filter:saturate(60%) }

        .glassbar{ position:sticky; top:0; z-index:40; background:rgba(0,0,0,0.35); backdrop-filter:saturate(140%) blur(8px); -webkit-backdrop-filter:saturate(140%) blur(8px); border-bottom:1px solid var(--border) }
        @supports not ((backdrop-filter: blur(1px))) { .glassbar{ background:rgba(0,0,0,0.6) } }

        .card{ position:relative; border-radius:16px; backdrop-filter:blur(14px);
          background: linear-gradient(var(--glass), var(--glass)) padding-box,
                     linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)) border-box;
          border:1px solid transparent; box-shadow:var(--shadow) }
        .card-hover{ transition:transform .25s ease, box-shadow .25s ease }
        .card-hover:hover{ transform:translateY(-2px); box-shadow:0 22px 70px rgba(0,0,0,0.9) }

        input{ border-radius:12px; border:1px solid rgba(255,255,255,0.2) }
        input:focus{ outline:2px solid transparent; box-shadow:0 0 0 3px var(--ring) }

        .btn{ display:inline-flex; align-items:center; gap:.5rem; border-radius:9999px; border:1px solid rgba(255,255,255,0.25); padding:.75rem 1rem; font-weight:600; transition:background .2s ease, transform .2s ease, box-shadow .2s ease }
        .btn-ghost{ background:transparent }
        .btn-ghost:hover{ background:var(--glassHover) }

        .pill{ display:inline-block; border-radius:9999px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.55); padding:.4rem .75rem; font-size:.72rem; letter-spacing:.06em; color:rgba(255,255,255,0.9) }
        .intro-tag{ position:absolute; top:12px; left:12px }

        .brand{ font-size:calc(0.875rem + 5px) }
        .logo{ height:40px; width:auto; display:block }
        .h1{ font-size:21px; line-height:1.15; font-weight:700 }
        @media (min-width:768px){ .h1{ font-size:33px } }
      `}</style>

      <header className="glassbar mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <a href="/" className="flex items-center gap-2">
          <img src={EMBEDDED_LOGO} alt="OSAI logo" className="logo" loading="eager" decoding="async" />
          <span className="brand tracking-widest text-white/80">MASIN’s OSAI</span>
        </a>
        <a href={APP_LOGIN_URL} className="text-sm text-white/70 hover:text-white">Login</a>
      </header>

      <section className="mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-6">
        <h1 className="h1 leading-[1.15]">
          Not just another shit app built to farm your data and trick you into forgetting your subscription.
        </h1>
        <p className="text-white/80">
          Give me $20 a month and I’ll give you <span className="underline underline-offset-4">everything</span> I can develop.<br />
          Owned–created, designed, developed, marketed, and sold by me—<br /><br />
          Welcome to OSAI. Nice to meet you.
        </p>
        <p className="text-sm italic text-white/60">p.s. Fuck you Google.</p>

        <div className="card card-hover p-3">
          <div className="relative h-56 w-full rounded-xl bg-black/40 md:h-80">
            {playIntro ? (
              <iframe
                title="OSAI Introduction"
                src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1`}
                className="absolute inset-0 h-full w-full rounded-xl"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <span className="pill intro-tag">INTRODUCTION VIDEO</span>
                <button
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80 hover:text-white"
                  onClick={() => setPlayIntro(true)}
                  aria-label="Play introduction video"
                >
                  <div className="h-16 w-16 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl font-bold">▶</div>
                  <span className="text-sm font-semibold tracking-wide">PLAY</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              className="w/full max-w-sm rounded-xl bg-white px-4 py-3 text-black outline-none"
              type="email"
              placeholder="sou@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-ghost md:w-48" onClick={openSignup}>Create account</button>
          </div>
          <div className="text-xl font-semibold">
            $20/month — everything I can develop. <span className="text-base text-white/60">Early access + updates.</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          {["CONTENT CREATION","FINANCIAL PLANNING","DAILY SCHEDULES","CREATE YOUR OWN UI"].map((t) => (
            <span key={t} className="pill">{t}</span>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-3xl px-4 pb-10 text-sm text-white/50">© {new Date().getFullYear()} OSAI</footer>
    </main>
  )
}
