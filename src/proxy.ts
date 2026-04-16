import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from './lib/auth0'

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request)
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname + request.nextUrl.search)

  if (authResponse) {
    authResponse.headers.set('x-pathname', request.nextUrl.pathname + request.nextUrl.search)
    return authResponse
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
