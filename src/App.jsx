import Splash from './components/Splash.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Hero from './sections/Hero.jsx'
import Services from './sections/Services.jsx'
import Packages from './sections/Packages.jsx'
import CekPesanan from './sections/CekPesanan.jsx'
import Vouchers from './sections/Vouchers.jsx'
import NotificationLayer from './components/NotificationLayer.jsx'
import InstallCard from './components/InstallCard.jsx'
import ContactChooser from './components/ContactChooser.jsx'
import Subscribe from './sections/Subscribe.jsx'
import Why from './sections/Why.jsx'
import Process from './sections/Process.jsx'
import About from './sections/About.jsx'
import FAQ from './sections/FAQ.jsx'
import CTA from './sections/CTA.jsx'
export default function App() {
  return (
    <>
      <a href="#layanan" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-bg">Lewati ke konten</a>
      <Splash />
      <Navbar />
      <main>
        <Hero /><Services /><Packages /><Vouchers /><CekPesanan /><Why /><Process /><About /><FAQ /><Subscribe /><CTA />
      </main>
      <Footer />
      <NotificationLayer />
      <InstallCard />
      <ContactChooser />
    </>
  )
}
