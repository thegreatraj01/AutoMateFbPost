"use client";
import { useAppSelector } from "@/hooks/reduxHooks";
import { Mail } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/types/redux";
import { setUser } from "@/store/slices/userSlice";

function page() {
  const loginUser = useAppSelector((state) => state.user.user);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>();

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow digits
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
    for (let i = 0; i < pasted.length && index + 1 < 6; i++) {
      newOtp[index + i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = index + pasted.length < 6 ? index + pasted.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    const reqData = {
      email: loginUser?.email || email,
      otp: otp.join(""),
    };
    console.log(reqData);
    if (!reqData.email) return toast.error("Email is required");
    if (!reqData.otp) return toast.error("otp is required");
    try {
      const res = await api.post("auth/verify-email", reqData);
      console.log("res", res);
      if (res.status === 200) {
        toast.success(res.data?.message);
        dispatch(setUser(res.data?.data?.user));
        router.push("/login");
      }
    } catch (error) {
      setLoading;
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message);
      } else {
        console.log("Unexpected error", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/otp-request", {
        email,
      });
      if (res.status === 200) {
        toast.success(res.data?.message);
      }
    } catch (error) {
      console.log(error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const emailParam: string = searchParams?.get("email")!;
    console.log(emailParam);
    setEmail(emailParam);
    if (email?.trim()) {
      handleResendOtp();
    }
  }, [email]);

  if (loginUser?.isEmailVerified) return;
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-neutral-300">
      <div className="p-6 min-w-[300px] text-center bg-white">
        <div className="text-center">
          <p>
            <Mail className="mx-auto text-blue-500" />
          </p>
          <h1 className=" font-bold text-xl">Verify Your Email Address</h1>
        </div>
        <hr />
        <div className="mt-4">
          <p>
            A verification code is sent to <br />
            {email}
          </p>
          <p className="w-92 mt-6">
            Please check your inbox and enter the verification code below to
            verify your email address. The code will expire in 10 Minuts.
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
              disabled={loading ? true : false}
              onClick={handleVerifyOtp}
              className="block mx-auto w-full py-2 bg-black text-white font-semibold text-xl hover:bg-slate-900 hover:scale-x-103 duration-100 cursor-pointer"
            >
              {loading ? "verifying" : "Vefiry"}
            </button>
            <button
              disabled={loading}
              onClick={handleResendOtp}
              className={`mt-4 text-blue-300 underline cursor-pointer ${
                loading && "text-neutral-700"
              }`}
            >
              Resend Otp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
