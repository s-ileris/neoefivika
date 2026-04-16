import { getPayload as _getPayload } from 'payload'
import config from '@payload-config'
export default async function getPayload() {
  return _getPayload({ config })
}
