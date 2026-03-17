import uploadApi from '@/apis/upload'

export type AvatarOwner = {
  avatar?: string | null
  avatarId?: string | null
} | null | undefined

const missingAvatarPublicIds = new Set<string>()
const resolvedAvatarUrls = new Map<string, string>()

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value)

export const normalizeAvatarPublicId = (publicId: string): string => {
  const trimmed = publicId.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('uploads/') ? trimmed.replace(/^uploads\//, '') : trimmed
}

export const getAvatarPublicId = (owner: AvatarOwner): string | undefined => {
  const candidate = (owner?.avatarId || owner?.avatar || '').trim()
  if (!candidate) return undefined
  if (isHttpUrl(candidate)) return undefined
  return candidate
}

/**
 * Synchronous "best effort" avatar URL:
 * - previewUrl if provided
 * - owner.avatar if it's already a URL
 * - owner.avatarId if it's already a URL
 *
 * If avatar is only a publicId, use `resolveAvatarUrl` to fetch from backend.
 */
export const getAvatarUrl = (owner: AvatarOwner, previewUrl?: string): string | undefined => {
  if (previewUrl) return previewUrl

  const avatarValue = owner?.avatar?.trim()
  if (avatarValue && isHttpUrl(avatarValue)) return avatarValue

  const avatarIdValue = owner?.avatarId?.trim()
  if (avatarIdValue && isHttpUrl(avatarIdValue)) return avatarIdValue

  return undefined
}

/**
 * Resolve avatar publicId to a real imageUrl via backend (`uploadApi.getImage`).
 * Tries both raw and normalized forms to support stored values with/without `uploads/` prefix.
 */
export const resolveAvatarUrl = async (owner: AvatarOwner): Promise<string | undefined> => {
  const cachedSyncUrl = getAvatarUrl(owner)
  if (cachedSyncUrl) return cachedSyncUrl

  const publicId = getAvatarPublicId(owner)
  if (!publicId) return undefined

  const normalized = normalizeAvatarPublicId(publicId)
  const candidates = Array.from(new Set([publicId, normalized].filter(Boolean)))

  const hasKnownMissingCandidate = candidates.some((candidateId) => missingAvatarPublicIds.has(candidateId))
  if (hasKnownMissingCandidate) return undefined

  for (const candidateId of candidates) {
    const cached = resolvedAvatarUrls.get(candidateId)
    if (cached) return cached

    try {
      const response = await uploadApi.getImage(candidateId)
      const imageUrl = response.data.imageUrl
      if (imageUrl) {
        resolvedAvatarUrls.set(candidateId, imageUrl)
        return imageUrl
      }
    } catch {
      missingAvatarPublicIds.add(candidateId)
    }
  }

  return undefined
}
