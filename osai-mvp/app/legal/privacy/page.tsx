export default function Privacy() {
  return (
    <section className="prose prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Data We Process</h2>
      <ul><li>Account & billing</li><li>Content you provide</li><li>Basic analytics</li></ul>
      <h2>What We Don’t Sell</h2><p>We do not sell personal data. Access is restricted and role-scoped.</p>
      <h2>Your Rights</h2><p>Access, correction, deletion. Contact: privacy@osai.llc</p>
    </section>
  );
}
