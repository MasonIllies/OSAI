export default function Pricing(){
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold mb-6">Choose your plan</h1>
      <div className="space-y-4">
        <a className="block rounded-lg border p-4 text-center hover:bg-gray-50"
           href="https://buy.stripe.com/your-growth-link" target="_blank" rel="noreferrer">
          Growth — $20/mo
        </a>
        <a className="block rounded-lg border p-4 text-center hover:bg-gray-50"
           href="https://buy.stripe.com/your-elite-link" target="_blank" rel="noreferrer">
          Elite — $49.99/mo
        </a>
      </div>
    </main>
  );
}