"use client";
// import { useAppSelector } from "@/hooks/reduxHooks";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/types/redux";
// import { setUser } from "@/store/slices/userSlice";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

// ✅ Schema with OTP validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    Otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^[0-9]+$/, "OTP must contain only numbers"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

function Page() {
  // const loginUser = useAppSelector((state) => state.user.user);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      Otp: "",
    },
  });

  const handlePasswordChange = async (data: FormValues) => {
    setLoading(true);
    if (!email) {
      toast.error("Email Not Found in Param");
      return;
    }
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        newPassword: data.password,
        otp: data.Otp,
      });
      if (res.status === 200) {
        toast.success("Password Changed Please Login");
        router.push("/login");
      }
    } catch (error) {
      if (isAxiosError(error) && error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OTP handling updates form value directly
  const handleChange = (
    value: string,
    index: number,
    fieldOnChange: (val: string) => void,
    currentOtp: string
  ) => {
    if (!/^[0-9]?$/.test(value)) return;

    const otpArray = currentOtp.split("");
    otpArray[index] = value;
    const newOtp = otpArray.join("");
    fieldOnChange(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && index > 0 && !e.currentTarget.value) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    fieldOnChange: (val: string) => void
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const otp = pasted.slice(0, 6); // take max 6 digits
    fieldOnChange(otp);

    // focus last filled input
    inputRefs.current[Math.min(otp.length - 1, 5)]?.focus();
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-neutral-300">
      <div className="p-6 min-w-[300px] text-center bg-white">
        <h1 className="font-bold text-xl pb-2">Reset Password</h1>
        <hr />
        <p className="mt-4 mb-2">
          A verification code is sent to your registered email
        </p>
        <hr />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePasswordChange)}
            className="mt-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>New Password </FormLabel>
                  <FormControl>
                    <Input placeholder="newPassword" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Confirm New Password </FormLabel>
                  <FormControl>
                    <Input placeholder="confirmNewPassword" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="w-92 mt-2 font-semibold">Enter OTP</p>
            <FormField
              control={form.control}
              name="Otp"
              render={({ field }) => (
                <FormItem className="flex gap-2 mt-6 justify-center">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <FormControl key={index}>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={field.value[index] || ""}
                        onChange={(e) =>
                          handleChange(
                            e.target.value,
                            index,
                            field.onChange,
                            field.value
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={(e) => handlePaste(e, field.onChange)}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        className="w-12 h-12 text-center text-xl font-semibold"
                      />
                    </FormControl>
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="block mx-auto w-full py-2 bg-black text-white font-semibold text-xl hover:bg-slate-900 duration-100 cursor-pointer"
              >
                {loading ? "..." : "Reset"}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;
