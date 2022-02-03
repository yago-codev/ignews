import Head from 'next/head'

import styles from './home.module.scss'

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
            👏
          <span>
            Hey, welcome
          </span>
          <h1>
            <span>
              News about
            </span>
            <div>
              <span>the</span> <span>React</span> {' '}
              world.
            </div>
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for $9.90 month</span>
          </p>
        </section>

        <img
          src="/images/avatar.svg"
          alt="Ilustração de uma garota programando em seu notebook"
        />
      </main>
    </>
  )
}
