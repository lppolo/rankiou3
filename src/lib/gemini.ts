export type ModerationResult = { decision: 'APPROVED' | 'REJECTED'; reason?: string }

export async function moderatePollContent(title: string, options: string[]): Promise<ModerationResult> {
  // Placeholder: simulate APPROVED to keep flow free while API keys are absent
  await new Promise(r => setTimeout(r, 800))
  return { decision: 'APPROVED' }
}

export async function extractKeywordsFromTitle(title: string): Promise<string[]> {
  const words = title.split(/\s+/).filter(w => w.length > 3)
  return words.slice(0, 3)
}
