"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useAccount, useBalance, useSignMessage } from "wagmi";

export default function Home() {

  const { address, isConnected, chain} = useAccount();
  const { data:balance} = useBalance({address});
  const { signMessage, data:signature, isPending} = useSignMessage();
  
  const isCorrectNetwork = chain?.id === 8453;

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet>
          <></>
        </Wallet>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Family Management DApp</h1>
        {isConnected && address && (
          <div className={styles.section}>
            <div className={styles.errormessage}>
              <p>Wrong Network! Please switch to Base Sepolia in Your Wallet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
