import { useRouter } from "next/router";
import { useEffect } from "react";

// ----------------------------------------------------------------------

export default function Index() {
  const { pathname, replace, prefetch } = useRouter();

  useEffect(() => {
    // if (pathname === PATH_DASHBOARD.projects.root) {
    replace("/satellite-passes");
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}
