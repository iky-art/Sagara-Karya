import Reveal from '../components/Reveal.jsx'
import SubscribeForm from '../components/SubscribeForm.jsx'
export default function Subscribe() {
  return (
    <section id="kabar" className="pb-20 md:pb-28">
      <div className="wrap">
        <Reveal className="glass relative rounded-[32px] p-7 md:grid md:grid-cols-[1fr_1.1fr] md:items-center md:gap-12 md:p-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">Dapatkan kabar dan promo</h2>
            <p className="mt-3 text-muted">Kami hanya mengirim pengumuman, voucher, dan promo. Kamu bisa berhenti kapan saja.</p>
          </div>
          <SubscribeForm />
        </Reveal>
      </div>
    </section>
  )
}
