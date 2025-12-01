import Head from 'next/head'
import Navbar from '../components/Navbar'
import SignupForm from '../components/SignupForm'
import Feature from '../components/Feature'
import CTA from '../components/CTA'

export default function Home() {
  return (
    <>
      <Head>
        <title>M&K Jewelris Store - Sign Up</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="announcement-bar">
        <span>ANNOUNCEMENT:</span> Welcome to M&K Jewelris Store!
        <a href="#signup-section">Read More →</a>
      </div>

      <Navbar />

      <main className="container">
        <section className="left">
          <p className="small-text">M&K Jewelris Store</p>
          <h1>
            <span className="highlight">M&K Jewelris Store.</span> Jewelry that defines elegance and tells your story.
          </h1>
          <p className="subtext">
            From dazzling engagement rings to timeless gold collections, every piece is made with passion and precision.
          </p>
        </section>

        <section className="right" id="signup-section">
          <SignupForm />
        </section>
      </main>

      <section className="features-section">
        <Feature
          title="Unleash Your Inner Sparkle"
          text="Every piece is crafted to help you shine brighter — from diamond necklaces to elegant bracelets."
          imgSrc="/feature1.jpg"
        />
        <Feature
          title="Designed for Every Occasion"
          text="Whether it’s a wedding, anniversary, or a gift of love — timeless designs await."
          imgSrc="/feature2.jpg"
          reverse
        />
        <Feature
          title="Authenticity You Can Trust"
          text="Certified materials. Ethical production. Jewelry built to last."
          imgSrc="/feature3.jpg"
        />
      </section>

      <CTA />

      

      <footer className="footer">
        <p>© 2025 M&K Jewelris, Inc. All rights reserved.</p>
      </footer>
    </>
  )
}

