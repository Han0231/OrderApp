import { getAuth, sendEmailVerification } from "firebase/auth";

export const sendVerificationEmail = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        alert("Verification email sent! Check your inbox.");
  
        await user.reload();
        console.log("User reloaded:", user);
  
        if (user.emailVerified) {
          console.log("Email is now verified!");
          // You could trigger a re-render here or notify state
        }
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    } else {
      console.log("User's email is already verified.");
    }
  };
  