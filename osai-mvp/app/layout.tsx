export const metadata = {
  title: 'OSAI',
  description: 'Your personal operating system. Trainable, private, always on.',
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
