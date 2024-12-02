"use client";

import Image from "next/image";

import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="App">
      <div className="container">
        <div className="logoBox">
          <div className="logoImage">
            <Image
              src="/logo-01.png"
              alt="SuperViral.ai logo"
              width="70"
              height="90"
            />
            <div className="logo-text">
              <span className="logo-caption">WanderPal AI</span>
              <p className="logo-small-text">
                Turning Travel Dreams into Reality
              </p>
            </div>
          </div>
          <p className="header-text">
            Ready for your next adventure? WanderPal AI is here to help you
            explore the world with personalized travel plans crafted just for
            you
          </p>
        </div>
        <Chat />
      </div>
    </main>
  );
}
