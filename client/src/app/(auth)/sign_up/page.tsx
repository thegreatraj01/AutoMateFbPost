import SignUpForm from "@/components/Signup_form"

export default function Page() {
  return (
    <div className="flex w-full min-h-[80vh] items-center justify-center p-2 md:p-2">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}
