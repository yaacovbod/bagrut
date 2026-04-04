export function GET() {
  return Response.json({
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || null,
    accessKey: process.env.SITE_ACCESS_KEY || null
  })
}
