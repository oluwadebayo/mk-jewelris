import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import "../styles/globals.css";
import { ToastContainer } from "../components/ToastContainer";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash;

      history.replaceState(null, "", window.location.pathname);

      setTimeout(() => {
        history.replaceState(null, "", window.location.pathname + hash);
      }, 400);
    }

    window.scrollTo(0, 0);
  }, []);

  return (
      <SessionProvider session={session}>
        <>
          <Component {...pageProps} />
          <ToastContainer />
        </>
      </SessionProvider>


  );
}
