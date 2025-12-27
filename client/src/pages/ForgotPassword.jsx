import React, { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useResetPassword, useSendResetPasswordOtp } from "@/hooks/useAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [otpSent, setOtpSent] = useState(false);
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(0);
    const [otp, setOtp] = useState("");

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);


    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const password = watch("newPassword");

    const sendResetPasswordOtp = useSendResetPasswordOtp();
    const resetPassword = useResetPassword();

    const onSubmitEmail = (data) => {
        setEmail(data.email);
        sendResetPasswordOtp.mutate(
            { email: data.email },
            {
                onSuccess: () => {
                    toast.success("OTP sent to your email");
                    setOtpSent(true);
                    setTimer(15);
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to send OTP. Please try again."
                    );
                }
            }
        );
    };

    const onSubmitReset = (data) => {
        resetPassword.mutate(
            {
                email: email,
                otp: otp,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success("Password reset successful. Please login.");
                    navigate("/");
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to reset password. Please try again."
                    );
                }
            }
        );
    };

    return (
        <div
            className={cn(
                "flex items-center justify-center min-h-screen p-4 sm:p-10 bg-gradient-to-br from-blue-100 via-blue-100 to-blue-50"
            )}
        >
            <div className="relative w-full sm:w-[500px] max-w-sm md:max-w-3xl my-8">
                <Card className="w-full max-w-3xl h-auto md:h-[660px] overflow-hidden p-0 md:mt-0">
                    <CardContent className="flex md:flex-row flex-col h-full p-0">
                        {/* Left Section */}
                        <div className="px-6 pb-6 pt-10 md:p-8 md:pt-8 flex-1 bg-white/80 backdrop-blur-md flex flex-col justify-center">
                            <form
                                onSubmit={handleSubmit(otpSent ? onSubmitReset : onSubmitEmail)}
                                className="flex flex-col gap-6"
                            >
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold md:mt-0">
                                        {otpSent ? "Reset Password" : "Forgot Password"}
                                    </h1>
                                </div>

                                {/* Email */}
                                <div className="grid gap-3">
                                    <Label className="text-lg" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        placeholder="Enter Your Email..."
                                        disabled={otpSent}
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <span className="text-sm text-red-700">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>

                                {/* OTP Input — appears only after OTP is sent */}
                                {otpSent && (
                                    <>
                                        <div className="space-y-2 sm:space-y-3 w-full">
                                            <Label className="text-base sm:text-lg text-center sm:text-left">
                                                Enter OTP
                                            </Label>

                                            <InputOTP maxLength={6} className="flex justify-center"
                                                pattern={REGEXP_ONLY_DIGITS}
                                                value={otp}
                                                onChange={setOtp}
                                                disabled={sendResetPasswordOtp.isPending || resetPassword.isPending}
                                            >

                                                <InputOTPGroup className="gap-1.5">
                                                    {[...Array(6)].map((_, i) => (
                                                        <InputOTPSlot
                                                            key={i}
                                                            index={i}
                                                            className="
                                                                        h-10 w-10
                                                                        sm:h-11 sm:w-11
                                                                        md:h-12 md:w-12
                                                                        rounded-lg sm:rounded-xl
                                                                        border border-input
                                                                        text-sm sm:text-md
                                                                        font-semibold
                                                                        shadow-sm
                                                                        transition-all
                                                                    "
                                                        />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>

                                        {/* New Password */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="newPassword" className="text-lg">
                                                New Password
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                placeholder="Enter New Password..."
                                                disabled={resetPassword.isPending}
                                                {...register("newPassword", {
                                                    required: "New password is required",
                                                    minLength: {
                                                        value: 8,
                                                        message: "Password must be at least 8 characters",
                                                    },
                                                })}
                                            />
                                            {errors.newPassword && (
                                                <span className="text-sm text-red-700">
                                                    {errors.newPassword.message}
                                                </span>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="grid gap-3">
                                            <Label htmlFor="confirmPassword" className="text-lg">
                                                Confirm Password
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="Confirm New Password..."
                                                disabled={resetPassword.isPending}
                                                {...register("confirmPassword", {
                                                    required: "Please confirm your password",
                                                    validate: (value) =>
                                                        value === password || "Passwords do not match",
                                                })}
                                            />
                                            {errors.confirmPassword && (
                                                <span className="text-sm text-red-700">
                                                    {errors.confirmPassword.message}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Button */}
                                <Button
                                    variant={"lgbtn"}
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={
                                        sendResetPasswordOtp.isPending ||
                                        resetPassword.isPending
                                    }
                                >
                                    {otpSent
                                        ? resetPassword.isPending
                                            ? "Resetting..."
                                            : "Reset Password"
                                        : sendResetPasswordOtp.isPending
                                            ? "Sending OTP..."
                                            : "Send OTP"}
                                </Button>

                                {/* Resend / Change Email / Back */}
                                {otpSent && (
                                    <div className="flex justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOtpSent(false);
                                                reset();
                                            }}
                                            className="text-blue-600 hover:underline cursor-pointer"
                                        >
                                            Change Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { sendResetPasswordOtp.mutate({ email }); setTimer(10); }}
                                            className="text-blue-600 hover:underline cursor-pointer"
                                            disabled={timer > 0 || sendResetPasswordOtp.isPending}
                                        >
                                            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                                        </button>
                                    </div>
                                )}

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/")}
                                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
