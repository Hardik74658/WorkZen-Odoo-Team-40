import React from 'react'
import { Hero } from './LandingPage/Hero'
import { Features } from './LandingPage/Features'
import Team from './LandingPage/Team'
import TrustedPartners from './LandingPage/TrustedPartners'
import FAQ from './LandingPage/FAQ' // Import the new FAQ component
import Header from './layout/Header'
import Footer from './layout/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-left flex flex-col">
      <Header />
      <main className="flex-1 pt-20 sm:pt-24">
        <Hero />
        <Features />
        <TrustedPartners />
        <FAQ />
        {/* <Team/> */}
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage;
