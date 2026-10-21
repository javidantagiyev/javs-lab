import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="jav-header">
      <div className="jav-shell jav-header-inner">
        <Link href="/" className="jav-brand" aria-label="Jav's Lab home">
          <span className="jav-brand-mark" aria-hidden="true">∴</span>
          Jav&apos;s Lab<span className="jav-brand-dot">.</span>
        </Link>
        <nav aria-label="Primary navigation" className="jav-header-nav">
          <Link href="/#subjects">Explore</Link>
          <Link href="/#about">About</Link>
        </nav>
        <Link href="/learn/ml/gradient-descent" className="jav-header-cta">
          <span className="jav-cta-long">Enter a lab</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
