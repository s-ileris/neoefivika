import styles from './nav.module.scss'
import { motion } from 'motion/react'
import { links } from './data'
import { perspective, slideIn } from './anim'

import Link from 'next/link'
// import { useUser } from '@clerk/nextjs'

export default function Nav() {
  // const { isSignedIn, user, isLoaded } = useUser()
  return (
    <>
      <div className={styles.nav}>
        <div className={styles.body}>
          {links.map((link, i) => {
            const { title, href } = link
            return (
              <div key={`b_${i}`} className={styles.linkContainer}>
                <motion.div
                  href={href}
                  custom={i}
                  //@ts-expect-error
                  variants={perspective}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  <Link href={href}>{title}</Link>
                </motion.div>
              </div>
            )
          })}
        </div>
        <motion.div className={styles.footer}>
          {/* <motion.div variants={slideIn} custom={1} initial="initial" animate="enter" exit="exit">
            {user ? (
              <Link href={'/account'}>[{user?.name}]</Link>
            ) : (
              <Link href={'/auth/login'}>Συνδεθείτε</Link>
            )}
          </motion.div> */}

          {/* @ts-expect-error */}
          <motion.div variants={slideIn} custom={2} initial="initial" animate="enter" exit="exit">
            <Link href={'https://www.instagram.com/neoefivika/'} target="_blank">
              Instagram
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
