"use client";

import { ANIKA_PROFILE } from "@/data/profile";
import { BrickSandbox } from "@/components/BrickSandbox";

export default function Home() {
  return <BrickSandbox profile={ANIKA_PROFILE} />;
}
