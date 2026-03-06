import { useLanguage } from '@/context/providers'

export function useTranslation() {
  const { t, language, isRTL } = useLanguage()
  return { t, language, isRTL }
}
