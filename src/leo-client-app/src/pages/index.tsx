import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Index() {
  const { pathname, replace } = useRouter();

  useEffect(() => {
    replace("/satellite-passes");
  }, [pathname, replace]);
  return null;
}
