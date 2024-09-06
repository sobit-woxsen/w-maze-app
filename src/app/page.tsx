import Image from "next/image";
import Maze from "./components/maze";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Maze />
    </main>
  );
}
