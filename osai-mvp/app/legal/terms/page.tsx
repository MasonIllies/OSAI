export default function Terms() {
  return (
    <section className="prose prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>1. Overview</h2>
      <p>OSAI provides subscription software and related services.</p>
      <h2>2. Subscriptions</h2>
      <p>Plans: <strong>Basic Control</strong> and <strong>Locked In.</strong> You can cancel anytime in the billing portal.</p>
      <h2>3. Refunds</h2>
      <p>Unless required by law, subscriptions are non-refundable once a billing period begins.</p>
      <h2>4. Acceptable Use</h2>
      <p>No illegal activity, abuse, scraping, or attempts to disrupt service.</p>
      <h2>5. Liability</h2>
      <p>Service provided “as is” without warranties; liability limited to fees paid in the last 12 months.</p>
      <h2>6. Contact</h2>
      <p>support@osai.llc</p>
    </section>
  );
}
