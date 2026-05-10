'use client'
// React and Next.js imports
import Image from 'next/image'
import Link from 'next/link'

// Third-party library imports
import Balancer from 'react-wrap-balancer'

// Local component imports
import { Section, Container } from './craft'

export default function Footer() {
  return (
    <footer className="bg-grey">
      <Section>
        <Container className="grid gap-12 md:grid-cols-[1.5fr_0.5fr_0.5fr]">
          <div className="grid gap-6">
            <Link href="/">
              <h3 className="sr-only">Νέοεφηβικά</h3>
              <Image
                src={'/logo.svg'}
                alt="Logo"
                unoptimized
                width={120}
                height={26}
                className="transition-all hover:opacity-75"
              ></Image>
            </Link>
            <p>
              <Balancer>
                Η πρώτη ελληνική κοινότητα νέων ηλικίας 13 με 23. Απλώς χρησιμοποίησε την φωνή σου.
              </Balancer>
            </p>
            <p className="text-muted-foreground">
              ©{' '}
              <a href="https://stratos.bookbusters.gr" target="_blank">
                Στράτος Ιλερής
              </a>
              . Όλα τα δικαιώματα κατοχυρωμένα, {new Date().getFullYear()}.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Ιστοσελίδα</h5>
            <Link href="/articles">Κείμενα</Link>
            <Link href="/about">Εμείς</Link>
            <Link href="/create">Δημιούργησε</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Νομικά</h5>
            <Link href="/privacy">Πολιτική απορρήτου</Link>
            {/* <Link href="/terms-of-service">Terms of Service</Link> */}
            {/* <Link href="/cookie-policy">Cookie Policy</Link> */}
          </div>
        </Container>
      </Section>
    </footer>
  )
}
