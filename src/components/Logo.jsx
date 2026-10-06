export default function Logo({ className = '', alt = '' }) {
  return (
    <span className={`inline-block shrink-0 ${className}`}>
      <img className="logo-l h-full w-full" src="/logo.png" alt={alt} width="512" height="512" />
      <img className="logo-d h-full w-full" src="/logo-light.png" alt="" aria-hidden="true" width="512" height="512" />
    </span>
  )
}
