import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { createWriteStream, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipe = promisify(pipeline)

const S3_ENDPOINT = 'https://81fcdd07fd5db326865f917eccd73de4.eu.r2.cloudflarestorage.com'

const S3_ACCESS_KEY_ID = '15b9d5873a52a1424a9910141cee3890'
const S3_SECRET = 'bcc0e00e4bcc4848ced3a48899a5808c446f2d73e955d6bdef027c80b1811ac6'
async function main() {
  const [bucket, localRoot] = process.argv.slice(2)

  if (!bucket || !localRoot) {
    console.error('Usage: node clone-s3-bucket.js <bucket-name> <local-folder>')
    process.exit(1)
  }

  // Configure S3 client (supports AWS and S3-compatible endpoints)

  const s3 = new S3Client({
    region: 'auto',
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET,
    },
  })

  console.log(`Cloning bucket "${bucket}" to "${localRoot}" ...`)

  let continuationToken = undefined
  let totalFiles = 0
  let totalBytes = 0n

  try {
    do {
      const listParams = {
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }

      let listRes = null
      try {
        listRes = await s3.send(new ListObjectsV2Command(listParams))
      } catch (e) {
        console.error(e)
      }

      const objects = listRes.Contents || []
      console.log(`Found ${objects.length} objects in this page...`)

      for (const obj of objects) {
        if (!obj.Key) continue

        const key = obj.Key
        const size = BigInt(obj.Size || 0)

        // Map S3 object key to local path
        const localPath = join(localRoot, key)

        // Ensure directory exists
        mkdirSync(dirname(localPath), { recursive: true })

        console.log(`Downloading ${key} (${size} bytes)...`)

        const getRes = await s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        )

        // getRes.Body is a readable stream
        const readStream = getRes.Body

        const writeStream = createWriteStream(localPath)

        await pipe(readStream, writeStream)

        totalFiles += 1
        totalBytes += size
      }

      continuationToken = listRes.IsTruncated ? listRes.NextContinuationToken : undefined
    } while (continuationToken)

    console.log(`Done. Downloaded ${totalFiles} files, total ${totalBytes.toString()} bytes.`)
  } catch (err) {
    console.error('Error while cloning bucket:', err)
    process.exit(1)
  }
}

main()
