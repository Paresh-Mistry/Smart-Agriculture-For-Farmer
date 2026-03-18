import { AutoTranslate } from "@component/components/common/AutoTranslate";
import Hero from "@component/components/common/Hero";


export default function Home() {
  return (
    <AutoTranslate>
      <Hero />
    </AutoTranslate>  
  );
}

export const metadata = {
  title: "Home",
  description: "Using Next.js App Router",
};