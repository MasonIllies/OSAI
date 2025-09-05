export default function Privacy() {
  return (
    <section className="prose prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Data We Process</h2>
      <ul>
        <li>Account & billing details</li>
        <li>Content you provide to the assistant</li>
        <li>Basic analytics (error logs, performance)</li>
      </ul>
      <h2>What We Don’t Sell</h2>
      <p>We do not sell personal data. Access is restricted and role-scoped.</p>
      <h2>Retention</h2>
      <p>We retain minimal data for as long as needed to provide the service or comply with law.</p>
      <h2>Your Rights</h2>
      <p>Access, correction, deletion. Contact: privacy@osai.llc</p>
    </section>
  );
}
