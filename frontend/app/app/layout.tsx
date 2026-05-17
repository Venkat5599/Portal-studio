import type { ReactNode } from "react";

export const metadata = {
  title: "Studio — PalletMan",
  description: "Explore pallets, test extrinsics, and submit transactions on Portaldot.",
};

export default function StudioLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
