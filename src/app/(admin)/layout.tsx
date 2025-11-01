import type { Metadata } from "next";

import "../globals.css";


export const metadata: Metadata = {
  title: "Medical Tourism Forum - Admin panel",
  description: "Medical Tourism Forum - Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
    <html lang="en">
      <body
        
      >
        {children}
        </body>
      </html>
    
  );
}
