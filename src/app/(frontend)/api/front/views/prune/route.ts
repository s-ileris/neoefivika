import { NextRequest, NextResponse } from 'next/server'
import { pruneOldBuckets } from '@/lib/viewsService'

export async function GET(req: NextRequest) {
  // Verify this is called by your cron scheduler (Vercel Cron, etc.)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pruneOldBuckets()
    console.log(`[cron/prune-views] Pruned ${result.pruned} stale buckets`)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/prune-views]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
