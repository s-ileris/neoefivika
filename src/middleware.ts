import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isOnboardingRoute = createRouteMatcher(['/onboarding'])

const isPublicRoute = createRouteMatcher([
  '/',
  '/privacy',
  '/articles(.*)',
  '/article(.*)',
  '/help',
  '/contact',
  '/login(.*)',
  '/signup(.*)',
])

// Payload CMS routes to completely bypass Clerk
const isPayloadRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/graphql',
  '/api/graphql-playground',
  '/api/:slug((?!front).*)', // all /api/* EXCEPT /api/front*
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isPayloadRoute(req)) {
    return NextResponse.next()
  }

  if (req.url.includes('/api/front/')) {
    return NextResponse.next()
  }

  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth()
  if (isAuthenticated && !isPublicRoute(req)) return NextResponse.next()
  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // For users visiting /onboarding, don't try to redirect
  if (isAuthenticated && isOnboardingRoute(req)) {
    return NextResponse.next()
  }

  if (isAuthenticated && !sessionClaims?.metadata?.onboardingComplete) {
    const onboardingUrl = new URL('/onboarding', req.url)
    onboardingUrl.searchParams.set('to', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(onboardingUrl)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api)(.*)',
  ],
}
