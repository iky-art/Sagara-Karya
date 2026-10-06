import Reveal from '../components/Reveal.jsx'
export default function About() {
  return (
    <section id="tentang" className="section">
      <div className="wrap">
        <Reveal className="card grid gap-8 p-8 md:grid-cols-[1fr_1.3fr] md:gap-14 md:p-12">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">Studio kecil, dekat dengan kliennya</h2>
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            <p>Sagara Karya adalah studio digital dari Indonesia. Fokus kami sederhana: membantu orang dan bisnis kecil punya identitas digital yang lebih baik.</p>
            <p>Kami bukan agency besar. Itu berarti kamu bicara langsung soal kebutuhanmu, hasilnya dikerjakan dengan rapi, dan harganya tetap masuk akal.</p>
            <p>Sagara membawa kesan luas seperti laut. Karya adalah hasil nyata yang bisa kamu buka, bagikan, dan banggakan.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
