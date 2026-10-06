export const SOCIAL_PATHS = {
  ig: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01',
  tt: 'M14 3v11a3.5 3.5 0 1 1-3.5-3.5M14 3c.3 2.6 2 4.4 5 4.6',
}
export default function SocialIcon({ id, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={SOCIAL_PATHS[id]} /></svg>
  )
}
