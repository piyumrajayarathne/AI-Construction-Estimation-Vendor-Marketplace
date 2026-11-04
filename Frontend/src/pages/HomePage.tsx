import { ArrowRight, Bot, FileSearch, FileText, FolderKanban, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";

const heroImage = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85";
const planImage = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85";

const capabilities = [
  { icon: FolderKanban, title: "Project memory", description: "Keep drawings, specifications, existing BOQs, and project updates together so work starts with the right context." },
  { icon: FileSearch, title: "Source-aware review", description: "Follow PDF processing and inspect extracted text alongside the documents it came from." },
  { icon: ShieldCheck, title: "Human-led decisions", description: "Keep missing information and verification needs visible. Review the source before relying on an estimate." },
];

const workflow = [
  { number: "01", title: "Create a project", body: "Give your team a clear place for each job." },
  { number: "02", title: "Add source documents", body: "Keep plans, specifications, and existing BOQs attached to the project." },
  { number: "03", title: "Review with the agent", body: "Check extracted details against the source before taking action." },
];

export function HomePage() {
  return (
    <div className="min-h-svh app-canvas page-enter overflow-hidden text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="AURABUILD home" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"><BrandMark /></Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a className="transition hover:text-ink" href="#platform">Platform</a>
            <a className="transition hover:text-ink" href="#workflow">Workflow</a>
            <a className="transition hover:text-ink" href="#principles">Principles</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary transition hover:bg-white sm:px-4">Sign in</Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90 sm:px-5">Create account <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-area-ai/15 bg-[#F0E9F8] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-area-ai">
              <Sparkles className="h-3.5 w-3.5" /> Construction, with an agent in the loop
            </div>
            <h1 className="mt-6 max-w-[650px] text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px] lg:text-[32px]">
              A smarter way to work with <span className="text-secondary">construction documents.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted">
              AURABUILD brings project files and updates into one workspace, with an AI agent designed to work from source material and leave important decisions with your team.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary/90">Create your workspace <ArrowRight className="h-4 w-4" /></Link>
              <a href="#workflow" className="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-secondary transition hover:bg-soft">Explore the workflow</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-area-ai" /> Source documents stay visible</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> Human review stays in control</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] lg:max-w-none">
            <div className="absolute -inset-6 rounded-[36px] bg-area-ai/10 blur-3xl" />
            <div className="relative h-[450px] overflow-hidden rounded-[30px] bg-secondary shadow-[0_28px_80px_-36px_rgba(34,38,43,0.55)] sm:h-[530px]">
              <img src={heroImage} alt="Construction team reviewing work at an active building site" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-ink/40 via-ink/15 to-secondary/70" />
              <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-ink/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur sm:left-7 sm:top-7">AURABUILD · Construction workspace</div>
              <article className="animate-float absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_-24px_rgba(34,38,43,0.5)] sm:bottom-7 sm:left-auto sm:right-7 sm:w-[390px] sm:p-5">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0E9F8] text-area-ai"><Bot className="h-5 w-5" /></span>
                    <div><p className="text-base font-semibold text-ink">Project agent</p><p className="text-xs text-muted">Illustrative workflow preview</p></div>
                  </div>
                  <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-muted">Example</span>
                </div>
                <div className="mt-4 rounded-xl bg-soft p-3.5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-subtle">Sample request</p>
                  <p className="mt-1.5 text-xs leading-5 text-ink">Find the wall finish requirements in this project’s specification.</p>
                </div>
                <div className="mt-3 rounded-xl border border-area-ai/15 bg-[#F7F4FB] p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-area-ai"><Sparkles className="h-3.5 w-3.5" /> Example agent response</div>
                  <p className="mt-1.5 text-xs leading-5 text-muted">The finish is listed in the project specification. Open the cited page to review the original wording.</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-area-ai/15 bg-white px-2.5 py-1.5 text-xs font-medium text-area-ai"><FileText className="h-3 w-3" /> Project specification · p. 18</div>
                </div>
              </article>
              <div className="absolute bottom-8 left-7 hidden max-w-[210px] text-white sm:block"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Built around your project</p><p className="mt-2 text-lg font-semibold leading-snug">Keep the source close to every decision.</p></div>
            </div>
          </div>
        </section>

        <section id="platform" className="border-y border-line bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.17em] text-area-ai">One connected workspace</p><h2 className="type-section-title mt-3 text-ink">Agent workflows need reliable project context.</h2><p className="mt-4 text-base leading-7 text-muted">Organize the source material first. Then review extracted information with your team and keep the provenance in view.</p></div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="hover-lift rounded-2xl border border-line bg-gradient-to-br from-white to-[#F5F2F9] p-6 sm:p-7">
                  <div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E9F8] text-area-ai"><Icon className="h-5 w-5" /></span><span className="text-xs font-semibold tracking-[0.16em] text-subtle">0{index + 1}</span></div>
                  <h3 className="mt-6 text-lg font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="principles" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="relative min-h-[300px] overflow-hidden rounded-[26px] bg-line sm:min-h-[410px]"><img src={planImage} alt="Architectural drawings prepared for a construction project" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 rounded-xl border border-white/25 bg-ink/35 px-4 py-3 text-xs font-semibold text-white backdrop-blur">Project documents remain the source of truth</div></div>
          <div id="workflow" className="lg:pl-2"><p className="text-xs font-bold uppercase tracking-[0.17em] text-area-ai">A practical workflow</p><h2 className="type-section-title mt-3 text-ink">From project files to reviewable information.</h2><div className="mt-7 space-y-5">
            {workflow.map((step) => <div key={step.number} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E9F8] text-xs font-bold text-secondary">{step.number}</span><div><h3 className="text-base font-semibold text-ink">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{step.body}</p></div></div>)}
          </div></div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-secondary px-6 py-10 text-white sm:px-12 sm:py-14 lg:px-16"><div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-area-ai/45 blur-3xl" /><div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.17em] text-white/65">AURABUILD · Sri Lanka</p><h2 className="type-section-title mt-3 text-white">Bring your project into focus.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">Create a workspace for your documents, project activity, and agent-supported review.</p></div><Link to="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-secondary transition hover:bg-[#F0E9F8]">Get started <ArrowRight className="h-4 w-4" /></Link></div></div></section>
      </main>
      <footer className="border-t border-line bg-surface"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"><BrandMark /><p className="text-xs text-muted">Construction intelligence · Sri Lanka</p><div className="flex items-center gap-5 text-sm font-medium text-muted"><Link className="transition hover:text-secondary" to="/login">Sign in</Link><Link className="transition hover:text-secondary" to="/register">Create account</Link></div></div></footer>
    </div>
  );
}
