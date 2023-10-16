"use client";

import Image from 'next/image'
import styles from './page.module.css'
import SatelliteInfo from '../components/SatelliteInfo';

export default function Home() {
  return (
    <main className={styles.main}>
     <SatelliteInfo />
    </main>
  )
}
