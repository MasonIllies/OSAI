export default function Home(){
  return (
    <main className="mx-auto max-w-2xl p-10">
      <h1 className="text-3xl font-bold mb-4">OSAI</h1>
      <p className="mb-6">Your personal operating system. Trainable, private, always on.</p>
      <div className="flex gap-3">
        <a className="rounded border px-4 py-2" href="/pricing">See pricing</a>
        <a className="rounded border px-4 py-2" href="/account">Account</a>
      </div>
    </main>
  );
}