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
  <div className="min-h-screen bg-[var(--bg)] text-left">
      <Header/>
      <Hero/>
      <Features/>
      <TrustedPartners/>
      <FAQ/> {/* Add FAQ section */}
      <Footer/>
      {/* <Team/> */}
    </div>
  )
}

export default LandingPage;
