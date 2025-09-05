export default function Pricing(){
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold mb-6">Choose your plan</h1>
      <div className="space-y-4">
        <a className="block rounded-lg border p-4 text-center hover:bg-gray-50"
           href="https://buy.stripe.com/6oU00kbPvh03eUbb3U7g402" target="_blank" rel="noreferrer">
          Basic Control — $9.99/mo
        </a>
        <a className="block rounded-lg border p-4 text-center hover:bg-gray-50"
           href="https://buy.stripe.com/9B63cwdXDbFJ7rJeg67g403" target="_blank" rel="noreferrer">
          Locked In. — $14.99/mo
        </a>
      </div>
    </main>
  );
}
