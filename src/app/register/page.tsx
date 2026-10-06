import AuthForm from "@/components/AuthForm";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="register" />
    </>
  );
}
