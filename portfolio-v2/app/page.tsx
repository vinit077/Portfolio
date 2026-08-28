import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Stack } from "@/components/sections/Stack";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { CodingProfile } from "@/components/sections/CodingProfile";
import { Credentials } from "@/components/sections/Credentials";
import { Contact } from "@/components/sections/Contact";
import { RevealInit } from "@/components/ui/RevealInit";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Stack />
        <Experience />
        <Projects />
        <CodingProfile />
        <Credentials />
        <Contact />
      </main>
      <Footer />
      <RevealInit />
    </>
  );
}
