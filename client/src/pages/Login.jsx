import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLogin, useRegister, useSendVerificationOtp } from "@/hooks/useAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const Login = () => {

    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        email: "",
        password: "",
    });
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [loginPage, setLoginPage] = useState(true);

    const login = useLogin();
    const sendVerificationOtp = useSendVerificationOtp();
    const register = useRegister();
    const queryClient = useQueryClient();

    const handleLogin = (e) => {
        e.preventDefault();
        if (!userData.email || !userData.password) {
            toast.error("Please enter both email and password.");
            return;
        }

        login.mutate(userData, {
            onSuccess: async (data) => {
                await queryClient.invalidateQueries({ queryKey: ["isMe"] });
                toast.success(data.message || "Login Successful!");
                navigate("/dashboard");
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Login Failed. Please check your credentials.");
                setUserData({ email: "", password: "" });
            }
        })
    }

    const handleSendVerificationOtp = (e) => {
        e.preventDefault();
        if (!userData.email) {
            toast.error("Please enter your email.");
            return;
        }

        sendVerificationOtp.mutate(userData.email, {
            onSuccess: (data) => {
                toast.success(data.message || "OTP Sent Successfully!");
                setOtpSent(true);
                setOtpTimer(30); // 30 seconds timer
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to send OTP. Please check your email.");
            }
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (!userData.email || !userData.password || otp.length !== 6) {
            toast.error("Please fill all fields and enter a valid OTP.");
            return;
        }

        register.mutate({ ...userData, otp }, {
            onSuccess: () => {
                toast.success("Registered Successfully!");
                setOtp("");
                setOtpSent(false);
                setUserData({ email: "", password: "" });
                setLoginPage(true);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Registration Failed. Please try again.");
                setOtp("");
            }
        });
    }

    useEffect(() => {
        let timer;
        if (otpTimer > 0) {
            timer = setTimeout(() => {
                setOtpTimer(otpTimer - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [otpTimer]);

    return (
        <div
            className={cn(
                "flex items-center justify-center min-h-screen p-4 sm:p-10 bg-gradient-to-br from-blue-100 via-blue-100 to-blue-50"
            )}
        >
            <div className="relative w-full max-w-sm md:max-w-3xl">
                <Card className="w-full max-w-3xl h-auto md:h-[650px] overflow-hidden p-0 md:mt-0">
                    <CardContent className="flex md:flex-row flex-col h-full p-0">
                        {/* Left: Login Form */}
                        <div className="px-6 pb-6 pt-10 md:p-8 md:pt-2 flex-1 bg-white/80 backdrop-blur-md flex flex-col justify-center">
                            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                                <div className="flex justify-center mb-6">
                                    <div className="flex bg-gray-100 rounded-full p-1 shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => setLoginPage(true)}
                                            className={`cursor-pointer px-6 py-2 rounded-full text-lg font-semibold transition-all duration-200
                                                    ${loginPage
                                                    ? "bg-white text-blue-800 shadow"
                                                    : "text-gray-500 hover:text-blue-700"}`}
                                        >
                                            Login
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setLoginPage(false)}
                                            className={`cursor-pointer px-6 py-2 rounded-full text-lg font-semibold transition-all duration-200 
                                                ${!loginPage
                                                    ? "bg-white text-blue-800 shadow"
                                                    : "text-gray-500 hover:text-blue-700"}`}
                                        >
                                            Register
                                        </button>
                                    </div>
                                </div>


                                {/* Email */}
                                <div className="grid gap-3">
                                    <Label className="text-lg" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={userData.email}
                                        placeholder="Enter Email Here..."
                                        disabled={login.isPending || sendVerificationOtp.isPending || register.isPending || otpSent}
                                        onChange={(e) =>
                                            setUserData({ ...userData, email: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Password */}
                                {
                                    ((!loginPage && otpSent) || loginPage) && <div className="grid gap-3">
                                        <Label htmlFor="password" className="text-lg">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            value={userData.password}
                                            type="password"
                                            placeholder="Enter Password Here..."
                                            disabled={login.isPending || sendVerificationOtp.isPending || register.isPending}
                                            onChange={(e) =>
                                                setUserData({ ...userData, password: e.target.value })
                                            }
                                        />
                                    </div>}

                                {!loginPage && otpSent &&
                                    (
                                        <div className="space-y-2 sm:space-y-3 w-full">
                                            <Label className="text-base sm:text-lg text-center sm:text-left">
                                                Enter OTP
                                            </Label>

                                            <InputOTP maxLength={6} className="flex justify-center"
                                                pattern={REGEXP_ONLY_DIGITS}
                                                value={otp}
                                                onChange={setOtp}
                                                disabled={login.isPending || sendVerificationOtp.isPending || register.isPending}
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


                                    )
                                }

                                {/* Login Button */}
                                {loginPage ?
                                    (
                                        <Button
                                            variant={"lgbtn"}
                                            type="submit"
                                            className="w-full"
                                            disabled={login.isPending}
                                            onClick={handleLogin}
                                        >
                                            {login.isPending ? "Logging in..." : "Login"}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={"lgbtn"}
                                            type="button"
                                            className="w-full"
                                            onClick={handleSendVerificationOtp}
                                            disabled={sendVerificationOtp.isPending || otpTimer > 0}
                                        >
                                            {sendVerificationOtp.isPending ? "Sending OTP..." : `Send OTP${otpTimer > 0 ? ` (${otpTimer}s)` : ""}`}

                                        </Button>
                                    )
                                }
                                {/* Register Button */}
                                {otpSent && !loginPage && <Button
                                    variant={"lgbtn"}
                                    type="button"
                                    className="w-full"
                                    onClick={handleRegister}
                                    disabled={register.isPending}
                                >
                                    {register.isPending ? "Registering..." : "Register"}
                                </Button>}
                                {loginPage &&
                                    (
                                        <div onClick={() => navigate("/forgot-password")}>
                                            <p className="text-sm text-center font-semibold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer">
                                                Forgot your password?
                                            </p>
                                        </div>
                                    )
                                }
                            </form>
                        </div>

                        {/* Right: Logo & Title (Desktop Only) */}
                        <div className="bg-blue-950 hidden md:flex flex-col justify-center items-center p-8 flex-1 text-white">
                            {/* <motion.img
                                src={clogo} // add image
                                alt="VGEC Logo" 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                className="w-32 h-32 rounded-full bg-white border-2 p-2 border-white shadow-md mb-6"
                            /> */}
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeInOut",
                                    delay: 0.3,
                                }}
                                className="text-2xl font-bold tracking-wide text-center drop-shadow-md"
                            >
                                ODOO
                            </motion.h2>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;