import { NextResponse } from 'next/server';

export function proxy(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  
  // Exclude internal Next.js paths, api routes, and static assets with file extensions
  const { pathname } = url;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Parse subdomain from host
  let subdomain = "";
  const hostParts = hostname.split(":");
  const hostWithoutPort = hostParts[0];
  const parts = hostWithoutPort.split(".");

  if (hostWithoutPort.includes("localhost")) {
    // Localhost development: subdomain.localhost:3000
    if (parts.length > 1 && parts[0] !== "localhost") {
      subdomain = parts[0];
    }
  } else if (hostWithoutPort.endsWith("vercel.app")) {
    // Vercel deployment: subdomain.project-name.vercel.app (4 parts)
    if (parts.length > 3) {
      subdomain = parts[0];
    }
  } else {
    // Custom domain: subdomain.educonnect.in (3 parts)
    if (parts.length > 2 && parts[0] !== "www") {
      subdomain = parts[0];
    }
  }

  // If a valid subdomain exists, rewrite the root path to the institution profile
  if (subdomain && subdomain !== "www") {
    if (pathname === "/") {
      url.pathname = `/institutions/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all paths except api, static files, and assets
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
