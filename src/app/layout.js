import "./globals.css";

export const metadata = {
  title: "EduConnect | Educational & Employment Ecosystem",
  description: "Connecting students, teachers, institutions, and employers in a single verified digital workspace.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
