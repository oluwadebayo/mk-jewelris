import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function VerifySuccess() {
useEffect(() => {
const token = new URLSearchParams(window.location.search).get("token");

```
if (token) {
  // Auto-login using the verifyToken flow supported by your Credentials Provider
  signIn("credentials", {
    verifyToken: token,
    redirect: true,
    callbackUrl: "/dashboard", // redirect after login
  });
}
```

}, []);

return (
<div
style={{
padding: "80px 30px",
textAlign: "center",
}}
>
<h1 style={{ color: "#5a0737" }}>Account Verified 🎉</h1> <p>You will be redirected shortly...</p> </div>
);
}
