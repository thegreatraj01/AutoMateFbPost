"use client";

import { useAppSelector } from "@/hooks/reduxHooks";
import { Mail } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react"; // Import useCallback
import { Input } from "@/components/ui/input";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/types/redux";
import { setUser } from "@/store/slices/userSlice";

// Renamed to an uppercase component name to satisfy React's rules
export default function VerifyEmailPage() {
  const loginUser = useAppSelector((state) => state.user.user);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null); // Initialize with null

  // --- OTP Input Handlers (Unchanged) ---
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length && index + i < 6; i++) {
      newOtp[index + i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(index + pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // --- API Handlers ---
  const handleVerifyOtp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    const emailToVerify = loginUser?.email || email;
    const otpString = otp.join("");

    if (!emailToVerify) {
      toast.error("Email address is missing.");
      setLoading(false);
      return;
    }
    if (otpString.length < 6) {
      toast.error("Please enter the full 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("auth/verify-email", {
        email: emailToVerify,
        otp: otpString,
      });
      if (res.status === 200) {
        toast.success(res.data?.message || "Email verified successfully!");
        if (res.data?.data?.user) {
          dispatch(setUser(res.data.data.user));
        }
        router.push("/login");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Verification failed.");
      } else {
        toast.error("An unexpected error occurred.");
        console.error("Unexpected error", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = useCallback(async () => {
    if (!email) return; // Guard clause

    setLoading(true);
    try {
      const res = await api.post("/auth/otp-request", { email });
      if (res.status === 200) {
        toast.success(res.data?.message || "A new OTP has been sent.");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to resend OTP.");
      }
    } finally {
      setLoading(false);
    }
  }, [email]); // This function depends on the 'email' state

  // --- Effects ---

  // Effect 1: Get email from URL search params on initial load
  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Effect 2: Automatically resend OTP when the email is set for the first time
  useEffect(() => {
    // Only run this if we have an email
    if (email) {
      handleResendOtp();
    }
  }, [email, handleResendOtp]);

  // Redirect if user's email is already verified
  if (loginUser?.isEmailVerified) {
    router.push("/"); // Redirect to a safe page like home
    return null; // Render nothing while redirecting
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-neutral-300">
      <div className="p-6 min-w-[300px] text-center bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Mail className="mx-auto text-blue-500 w-12 h-12" />
          <h1 className="font-bold text-xl mt-2">Verify Your Email Address</h1>
        </div>
        <hr className="my-4" />
        <div>
          <p>
            A verification code has been sent to <br />
            <strong className="font-semibold">
              {loginUser?.email || email || "your email"}
            </strong>
          </p>
          <p className="w-92 mt-4 text-sm text-gray-600">
            Please check your inbox and enter the 6-digit code below. The code
            will expire in 10 minutes.
          </p>
          <div className="flex gap-2 mt-6 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                onPaste={(e) => handlePaste(e, index)}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className="w-12 h-12 text-center text-xl font-semibold"
              />
            ))}
          </div>
          <div className="mt-6">
            <button
              disabled={loading}
              onClick={handleVerifyOtp}
              className="block mx-auto w-full py-2 bg-black text-white font-semibold text-xl rounded-md hover:bg-slate-900 transition-transform duration-150 ease-in-out hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              disabled={loading}
              onClick={() => handleResendOtp()} // Use an arrow function to call it without the event object
              className="mt-4 text-blue-500 underline cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
